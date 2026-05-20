using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using IHCAE.Api.Features.Alumni.Models.Entities;
using IHCAE.Api.Features.Alumni.Models.DTOs;
using IHCAE.Api.Shared.Data;
using IHCAE.Api.Shared.DTOs;
using Microsoft.Extensions.Logging;
using System.Text;

namespace IHCAE.Api.Features.Alumni.Services;

public class AlumniImportService : IAlumniImportService
{
    private readonly AppDbContext _context;
    private readonly ILogger<AlumniImportService> _logger;
    private readonly IHCAE.Api.Shared.Services.IEmailService _emailService;
    private readonly IConfiguration _configuration;

    public AlumniImportService(
        AppDbContext context,
        ILogger<AlumniImportService> logger,
        IHCAE.Api.Shared.Services.IEmailService emailService,
        IConfiguration configuration)
    {
        _context = context;
        _logger = logger;
        _emailService = emailService;
        _configuration = configuration;
    }

    /// <summary>
    /// Imports alumni data from a CSV file.
    /// </summary>
    /// <param name="csvContent">The CSV file content as a string</param>
    /// <returns>Import result with statistics and any errors</returns>
    public async Task<AlumniImportResult> ImportAlumniDataAsync(string csvContent)
    {
        var result = new AlumniImportResult();
        var lines = csvContent.Split('\n', StringSplitOptions.RemoveEmptyEntries);
        
        if (lines.Length < 2) // Need at least header + 1 data row
        {
            result.Errors.Add("CSV file must contain at least a header row and one data row.");
            return result;
        }

        var headers = lines[0].Split(',').Select(h => h.Trim().ToLower()).ToArray();
        result.TotalRecords = lines.Length - 1; // Exclude header

        // Expected CSV format: FirstName,LastName,Email,Course,Batch,Phone,Location
        var firstNameIndex = Array.IndexOf(headers, "firstname");
        var lastNameIndex = Array.IndexOf(headers, "lastname");
        var emailIndex = Array.IndexOf(headers, "email");

        if (firstNameIndex == -1 || lastNameIndex == -1 || emailIndex == -1)
        {
            result.Errors.Add("CSV must contain FirstName, LastName, and Email columns.");
            return result;
        }

        var courseIndex = Array.IndexOf(headers, "course");
        var yearIndex = Array.IndexOf(headers, "batch");
        var phoneIndex = Array.IndexOf(headers, "phone");
        var locationIndex = Array.IndexOf(headers, "location");

        // Load all existing emails once to avoid N+1 queries and detect intra-CSV duplicates
        var existingEmails = new HashSet<string>(
            await _context.AlumniDatabase.Select(a => a.Email).ToListAsync(),
            StringComparer.OrdinalIgnoreCase);

        for (int i = 1; i < lines.Length; i++)
        {
            try
            {
                var values = ParseCsvLine(lines[i]);

                if (values.Length <= Math.Max(firstNameIndex, Math.Max(lastNameIndex, emailIndex)))
                {
                    result.Errors.Add($"Row {i + 1}: Insufficient data columns.");
                    result.SkippedRecords++;
                    continue;
                }

                var firstName = values[firstNameIndex]?.Trim();
                var lastName = values[lastNameIndex]?.Trim();
                var email = values[emailIndex]?.Trim().ToLower();

                if (string.IsNullOrEmpty(firstName) || string.IsNullOrEmpty(lastName) || string.IsNullOrEmpty(email))
                {
                    result.Errors.Add($"Row {i + 1}: Missing required fields (FirstName, LastName, or Email).");
                    result.SkippedRecords++;
                    continue;
                }

                // HashSet.Add returns false if already present (catches DB duplicates AND intra-CSV duplicates)
                if (!existingEmails.Add(email))
                {
                    result.SkippedRecords++;
                    continue;
                }

                // Create new alumni record
                var alumniRecord = new AlumniDatabase
                {
                    Id = Guid.NewGuid(),
                    FirstName = firstName,
                    LastName = lastName,
                    Email = email,
                    Course = courseIndex >= 0 && courseIndex < values.Length ? values[courseIndex]?.Trim() : null,
                    Batch = yearIndex >= 0 && yearIndex < values.Length ? values[yearIndex]?.Trim() : null,
                    Phone = phoneIndex >= 0 && phoneIndex < values.Length ? values[phoneIndex]?.Trim() : null,
                    Location = locationIndex >= 0 && locationIndex < values.Length ? values[locationIndex]?.Trim() : null,
                    ImportedAt = DateTime.UtcNow
                };

                _context.AlumniDatabase.Add(alumniRecord);
                result.ImportedRecords++;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing CSV row {RowNumber}", i + 1);
                result.Errors.Add($"Row {i + 1}: {ex.Message}");
                result.SkippedRecords++;
            }
        }

        if (result.ImportedRecords > 0)
        {
            await _context.SaveChangesAsync();
            _logger.LogInformation("Successfully imported {ImportedCount} alumni records", result.ImportedRecords);
        }

        return result;
    }

    public async Task<AlumniImportResult> PreviewImportAsync(string csvContent)
    {
        var result = new AlumniImportResult();
        var lines = csvContent.Split('\n', StringSplitOptions.RemoveEmptyEntries);

        if (lines.Length < 2)
        {
            result.Errors.Add("CSV file must contain at least a header row and one data row.");
            return result;
        }

        var headers = lines[0].Split(',').Select(h => h.Trim().ToLower()).ToArray();
        result.TotalRecords = lines.Length - 1;

        var firstNameIndex = Array.IndexOf(headers, "firstname");
        var lastNameIndex = Array.IndexOf(headers, "lastname");
        var emailIndex = Array.IndexOf(headers, "email");

        if (firstNameIndex == -1 || lastNameIndex == -1 || emailIndex == -1)
        {
            result.Errors.Add("CSV must contain FirstName, LastName, and Email columns.");
            return result;
        }

        var existingEmails = new HashSet<string>(
            await _context.AlumniDatabase.Select(a => a.Email).ToListAsync(),
            StringComparer.OrdinalIgnoreCase);

        for (int i = 1; i < lines.Length; i++)
        {
            try
            {
                var values = ParseCsvLine(lines[i]);

                if (values.Length <= Math.Max(firstNameIndex, Math.Max(lastNameIndex, emailIndex)))
                {
                    result.Errors.Add($"Row {i + 1}: Insufficient data columns.");
                    result.SkippedRecords++;
                    continue;
                }

                var firstName = values[firstNameIndex]?.Trim();
                var lastName = values[lastNameIndex]?.Trim();
                var email = values[emailIndex]?.Trim().ToLower();

                if (string.IsNullOrEmpty(firstName) || string.IsNullOrEmpty(lastName) || string.IsNullOrEmpty(email))
                {
                    result.Errors.Add($"Row {i + 1}: Missing required fields (FirstName, LastName, or Email).");
                    result.SkippedRecords++;
                    continue;
                }

                if (!existingEmails.Add(email))
                {
                    result.SkippedRecords++;
                    continue;
                }

                result.ImportedRecords++;
            }
            catch (Exception ex)
            {
                result.Errors.Add($"Row {i + 1}: {ex.Message}");
                result.SkippedRecords++;
            }
        }

        return result;
    }

    /// <summary>
    /// Searches for a matching alumni record by email.
    /// </summary>
    /// <param name="email">Email address to search for</param>
    /// <returns>The matching alumni record if found, null otherwise</returns>
    public async Task<AlumniDatabase?> FindMatchingAlumniAsync(string email)
    {
        return await _context.AlumniDatabase
            .FirstOrDefaultAsync(a => a.Email.ToLower() == email.ToLower() && a.MatchedUserId == null);
    }

    /// <summary>
    /// Gets all alumni records with optional filtering.
    /// </summary>
    /// <param name="searchTerm">Optional search term for name or email</param>
    /// <param name="matchedOnly">Whether to return only matched records</param>
    /// <param name="page">Page number for pagination</param>
    /// <param name="pageSize">Number of records per page</param>
    /// <returns>Paginated collection of alumni records</returns>
    public async Task<PaginatedResult<AlumniDatabase>> GetAlumniRecordsAsync(
        string? searchTerm = null, 
        bool? matchedOnly = null, 
        int page = 1, 
        int pageSize = 50,
        string? status = null)
    {
        var query = _context.AlumniDatabase.AsQueryable();

        // Apply search filter
        if (!string.IsNullOrEmpty(searchTerm))
        {
            var lowerSearchTerm = searchTerm.ToLower();
            query = query.Where(a => 
                a.FirstName.ToLower().Contains(lowerSearchTerm) ||
                a.LastName.ToLower().Contains(lowerSearchTerm) ||
                a.Email.ToLower().Contains(lowerSearchTerm));
        }

        // Apply status or matchedOnly filter
        if (!string.IsNullOrEmpty(status))
        {
            var lowerStatus = status.ToLower();
            if (lowerStatus == "registered")
            {
                query = query.Where(a => a.MatchedUserId != null && a.MatchedUser != null && a.MatchedUser.LastLoginAt != null);
            }
            else if (lowerStatus == "invited" || lowerStatus == "unclaimed")
            {
                query = query.Where(a => a.MatchedUserId != null && (a.MatchedUser == null || a.MatchedUser.LastLoginAt == null));
            }
            else if (lowerStatus == "pending" || lowerStatus == "unmatched")
            {
                query = query.Where(a => a.MatchedUserId == null);
            }
        }
        else if (matchedOnly.HasValue)
        {
            query = matchedOnly.Value 
                ? query.Where(a => a.MatchedUserId != null)
                : query.Where(a => a.MatchedUserId == null);
        }

        var totalCount = await query.CountAsync();
        
        var items = await query
            .Include(a => a.MatchedUser)
            .OrderBy(a => a.FirstName)
            .ThenBy(a => a.LastName)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PaginatedResult<AlumniDatabase>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    /// <summary>
    /// Links an alumni record to a user account.
    /// </summary>
    /// <param name="alumniId">The alumni record ID</param>
    /// <param name="userId">The user account ID</param>
    /// <returns>Task representing the async operation</returns>
    public async Task LinkAlumniToUserAsync(Guid alumniId, Guid userId)
    {
        var alumniRecord = await _context.AlumniDatabase.FindAsync(alumniId);
        if (alumniRecord != null)
        {
            alumniRecord.MatchedUserId = userId;
            await _context.SaveChangesAsync();
        }
    }

    /// <summary>
    /// Parses a CSV line handling quoted fields and commas within quotes.
    /// </summary>
    /// <param name="line">The CSV line to parse</param>
    /// <returns>Array of field values</returns>
    private static string[] ParseCsvLine(string line)
    {
        var result = new List<string>();
        var current = new StringBuilder();
        var inQuotes = false;

        for (int i = 0; i < line.Length; i++)
        {
            var c = line[i];

            if (c == '"')
            {
                if (inQuotes && i + 1 < line.Length && line[i + 1] == '"')
                {
                    // Escaped quote
                    current.Append('"');
                    i++; // Skip next quote
                }
                else
                {
                    // Toggle quote state
                    inQuotes = !inQuotes;
                }
            }
            else if (c == ',' && !inQuotes)
            {
                // Field separator
                result.Add(current.ToString());
                current.Clear();
            }
            else
            {
                current.Append(c);
            }
        }

        // Add the last field
        result.Add(current.ToString());

        return result.ToArray();
    }
    public async Task UpdateAlumniRecordsAsync(IEnumerable<AlumniDatabaseDto> records)
    {
        foreach (var record in records)
        {
            var existing = await _context.AlumniDatabase.FindAsync(record.Id);
            if (existing != null)
            {
                existing.FirstName = record.FirstName;
                existing.LastName = record.LastName;
                existing.Email = record.Email.ToLower();
                existing.Course = record.Course;
                existing.Batch = record.Batch;
                existing.Phone = record.Phone;
                existing.Location = record.Location;

                // If linked to an active user account, sync all fields
                if (existing.MatchedUserId != null)
                {
                    var user = await _context.Users.FindAsync(existing.MatchedUserId);
                    if (user != null)
                    {
                        user.FirstName = record.FirstName;
                        user.LastName = record.LastName;
                        user.Email = record.Email.ToLower();
                        user.Phone = record.Phone;
                    }

                    // Also sync Course/Batch/Location to AlumniProfile
                    var profile = await _context.AlumniProfiles.FirstOrDefaultAsync(p => p.UserId == existing.MatchedUserId);
                    if (profile != null)
                    {
                        profile.Course = record.Course;
                        profile.Batch = record.Batch;
                        profile.Location = record.Location;
                        profile.UpdatedAt = DateTime.UtcNow;
                    }
                }
            }
        }
        await _context.SaveChangesAsync();
    }

    /// <summary>
    /// Generates user accounts for the specified alumni records.
    /// </summary>
    /// <param name="alumniIds">The list of alumni IDs</param>
    /// <returns>The bulk generation result containing generated and linked counts</returns>
    public async Task<BulkGenerateResultDto> BulkGenerateUserAccountsAsync(IEnumerable<Guid> alumniIds)
    {
        var result = new BulkGenerateResultDto();
        var frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:4200";

        // Fetch Alumni role once outside the loop
        var alumniRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "Alumni");

        foreach (var id in alumniIds)
        {
            try
            {
                var alumni = await _context.AlumniDatabase.FindAsync(id);
                if (alumni == null || alumni.MatchedUserId != null) continue;

                var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == alumni.Email);
                if (existingUser != null)
                {
                    if (existingUser.Status == IHCAE.Api.Features.Auth.Models.Entities.UserStatus.Approved)
                    {
                        // Already active — just link
                        alumni.MatchedUserId = existingUser.Id;
                        await _context.SaveChangesAsync();
                        result.LinkedCount++;
                        continue;
                    }

                    // Pending or Rejected — activate, update profile, send setup email
                    existingUser.Status = IHCAE.Api.Features.Auth.Models.Entities.UserStatus.Approved;
                    existingUser.FirstName = alumni.FirstName;
                    existingUser.LastName = alumni.LastName;
                    existingUser.Phone = alumni.Phone;

                    var existingProfile = await _context.AlumniProfiles.FirstOrDefaultAsync(p => p.UserId == existingUser.Id);
                    if (existingProfile == null)
                    {
                        _context.AlumniProfiles.Add(new IHCAE.Api.Features.Auth.Models.Entities.AlumniProfile
                        {
                            UserId = existingUser.Id,
                            Course = alumni.Course,
                            Batch = alumni.Batch,
                            Location = alumni.Location,
                            CreatedAt = DateTime.UtcNow
                        });
                    }
                    else
                    {
                        existingProfile.Course = alumni.Course;
                        existingProfile.Batch = alumni.Batch;
                        existingProfile.Location = alumni.Location;
                        existingProfile.UpdatedAt = DateTime.UtcNow;
                    }

                    if (alumniRole != null)
                    {
                        var hasRole = await _context.UserRoles.AnyAsync(ur => ur.UserId == existingUser.Id && ur.RoleId == alumniRole.Id);
                        if (!hasRole)
                            _context.UserRoles.Add(new IHCAE.Api.Shared.Models.UserRole { UserId = existingUser.Id, RoleId = alumniRole.Id });
                    }

                    alumni.MatchedUserId = existingUser.Id;
                    var (setupToken, setupTokenHash) = GenerateToken();
                    _context.PasswordResetTokens.Add(new IHCAE.Api.Features.PasswordReset.Models.Entities.PasswordResetToken
                    {
                        Id = Guid.NewGuid(),
                        UserId = existingUser.Id,
                        TokenHash = setupTokenHash,
                        CreatedAt = DateTime.UtcNow,
                        ExpiresAt = DateTime.UtcNow.AddDays(7),
                        IsUsed = false
                    });
                    await _context.SaveChangesAsync();

                    var setupUrl = $"{frontendUrl}/setup-account?token={Uri.EscapeDataString(setupToken)}";
                    await _emailService.SendClaimAccountEmailAsync(existingUser.Email, existingUser.FirstName, setupUrl);

                    result.GeneratedCount++;
                    continue;
                }

                // No user exists — create one
                var user = new IHCAE.Api.Features.Auth.Models.Entities.User
                {
                    Id = Guid.NewGuid(),
                    FirstName = alumni.FirstName,
                    LastName = alumni.LastName,
                    Email = alumni.Email,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString(), 12),
                    Status = IHCAE.Api.Features.Auth.Models.Entities.UserStatus.Approved,
                    EmailVerified = true,
                    IsBanned = false,
                    CreatedAt = DateTime.UtcNow
                };
                _context.Users.Add(user);
                _context.AlumniProfiles.Add(new IHCAE.Api.Features.Auth.Models.Entities.AlumniProfile
                {
                    UserId = user.Id,
                    Course = alumni.Course,
                    Batch = alumni.Batch,
                    Location = alumni.Location,
                    CreatedAt = DateTime.UtcNow
                });

                if (alumniRole != null)
                    _context.UserRoles.Add(new IHCAE.Api.Shared.Models.UserRole { UserId = user.Id, RoleId = alumniRole.Id });

                alumni.MatchedUserId = user.Id;

                var (token, tokenHash) = GenerateToken();
                _context.PasswordResetTokens.Add(new IHCAE.Api.Features.PasswordReset.Models.Entities.PasswordResetToken
                {
                    Id = Guid.NewGuid(),
                    UserId = user.Id,
                    TokenHash = tokenHash,
                    CreatedAt = DateTime.UtcNow,
                    ExpiresAt = DateTime.UtcNow.AddDays(7),
                    IsUsed = false
                });
                await _context.SaveChangesAsync();

                var claimUrl = $"{frontendUrl}/setup-account?token={Uri.EscapeDataString(token)}";
                await _emailService.SendClaimAccountEmailAsync(user.Email, user.FirstName, claimUrl);

                result.GeneratedCount++;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed generating account for alumni {AlumniId}", id);
                result.Errors.Add($"Alumni {id}: {ex.Message}");
            }
        }

        return result;
    }

    private static (string token, string hash) GenerateToken()
    {
        // URL-safe base64: replace +→-, /→_, strip = padding so the token
        // survives email clients and URL encoding/decoding unchanged
        var bytes = System.Security.Cryptography.RandomNumberGenerator.GetBytes(32);
        var token = Convert.ToBase64String(bytes)
            .Replace('+', '-').Replace('/', '_').TrimEnd('=');
        var hash = Convert.ToBase64String(System.Security.Cryptography.SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(token)));
        return (token, hash);
    }

    public async Task<bool> DeleteAlumniRecordAsync(Guid id)
    {
        var alumni = await _context.AlumniDatabase.FindAsync(id);
        if (alumni == null) return false;

        _context.AlumniDatabase.Remove(alumni);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task ResendInvitationAsync(Guid alumniId)
    {
        var alumni = await _context.AlumniDatabase
            .Include(a => a.MatchedUser)
            .FirstOrDefaultAsync(a => a.Id == alumniId)
            ?? throw new KeyNotFoundException("Alumni record not found.");

        if (alumni.MatchedUserId == null || alumni.MatchedUser == null)
            throw new InvalidOperationException("This alumni record does not have a linked user account. Generate an account first.");

        if (alumni.MatchedUser.LastLoginAt != null)
            throw new InvalidOperationException("This account has already been claimed by the alumni.");

        var frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:4200";
        var (token, tokenHash) = GenerateToken();

        _context.PasswordResetTokens.Add(new IHCAE.Api.Features.PasswordReset.Models.Entities.PasswordResetToken
        {
            Id = Guid.NewGuid(),
            UserId = alumni.MatchedUserId.Value,
            TokenHash = tokenHash,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            IsUsed = false
        });
        await _context.SaveChangesAsync();

        var claimUrl = $"{frontendUrl}/setup-account?token={Uri.EscapeDataString(token)}";
        await _emailService.SendClaimAccountEmailAsync(alumni.MatchedUser.Email, alumni.MatchedUser.FirstName, claimUrl);

        _logger.LogInformation("Resent invitation to alumni {AlumniId} ({Email})", alumniId, alumni.MatchedUser.Email);
    }

    public async Task<AlumniDatabase> CreateAlumniRecordAsync(AlumniDatabaseDto record)
    {
        var existing = await _context.AlumniDatabase.FirstOrDefaultAsync(x => x.Email == record.Email.ToLower());
        if (existing != null)
        {
            throw new InvalidOperationException("An alumnus record with this email already exists.");
        }

        var userExists = await _context.Users.AnyAsync(u => u.Email == record.Email.ToLower());
        if (userExists)
        {
            throw new InvalidOperationException("A registered user account with this email already exists.");
        }

        var alumni = new AlumniDatabase
        {
            Id = Guid.NewGuid(),
            FirstName = record.FirstName,
            LastName = record.LastName,
            Email = record.Email.ToLower(),
            Course = record.Course,
            Batch = record.Batch,
            Phone = record.Phone,
            Location = record.Location,
            ImportedAt = DateTime.UtcNow,
            MatchedUserId = null
        };

        _context.AlumniDatabase.Add(alumni);
        await _context.SaveChangesAsync();
        return alumni;
    }
}

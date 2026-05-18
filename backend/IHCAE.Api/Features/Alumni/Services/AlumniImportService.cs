using Microsoft.EntityFrameworkCore;
using IHCAE.Api.Features.Alumni.Models.Entities;
using IHCAE.Api.Features.Alumni.Models.DTOs;
using IHCAE.Api.Shared.Data;
using IHCAE.Api.Shared.DTOs;
using Microsoft.Extensions.Logging;
using System.Text;

namespace IHCAE.Api.Features.Alumni.Services;

/// <summary>
/// Service implementation for alumni database import operations.
/// Handles importing alumni data from CSV files for auto-approval matching.
/// </summary>
public class AlumniImportService : IAlumniImportService
{
    private readonly AppDbContext _context;
    private readonly ILogger<AlumniImportService> _logger;
    private readonly IHCAE.Api.Shared.Services.IEmailService _emailService;

    /// <summary>
    /// Initializes a new instance of the AlumniImportService.
    /// </summary>
    /// <param name="context">The database context</param>
    /// <param name="logger">Logger for import operations</param>
    /// <param name="emailService">Email service</param>
    public AlumniImportService(AppDbContext context, ILogger<AlumniImportService> logger, IHCAE.Api.Shared.Services.IEmailService emailService)
    {
        _context = context;
        _logger = logger;
        _emailService = emailService;
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

                // Check if alumni record already exists
                var existingAlumni = await _context.AlumniDatabase
                    .FirstOrDefaultAsync(a => a.Email == email);

                if (existingAlumni != null)
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
        int pageSize = 50)
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

        // Apply matched filter
        if (matchedOnly.HasValue)
        {
            query = matchedOnly.Value 
                ? query.Where(a => a.MatchedUserId != null)
                : query.Where(a => a.MatchedUserId == null);
        }

        var totalCount = await query.CountAsync();
        
        var items = await query
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
    /// <summary>
    /// Updates multiple alumni database records at once.
    /// </summary>
    /// <param name="records">The list of updated records</param>
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
            }
        }
        await _context.SaveChangesAsync();
    }

    /// <summary>
    /// Generates user accounts for the specified alumni records.
    /// </summary>
    /// <param name="alumniIds">The list of alumni IDs</param>
    /// <returns>The number of accounts generated</returns>
    public async Task<int> BulkGenerateUserAccountsAsync(IEnumerable<Guid> alumniIds)
    {
        int generatedCount = 0;
        
        
        foreach (var id in alumniIds)
        {
            var alumni = await _context.AlumniDatabase.FindAsync(id);
            if (alumni == null || alumni.MatchedUserId != null) continue;

            // Check if user already exists
            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == alumni.Email);
            if (existingUser != null)
            {
                // Just link it
                alumni.MatchedUserId = existingUser.Id;
                continue;
            }

            // Create User
            var user = new IHCAE.Api.Features.Auth.Models.Entities.User
            {
                Id = Guid.NewGuid(),
                FirstName = alumni.FirstName,
                LastName = alumni.LastName,
                Email = alumni.Email,
                // Assign a temporary unguessable password hash, they will set it via the setup link
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString(), 12),
                Status = IHCAE.Api.Features.Auth.Models.Entities.UserStatus.Approved,
                EmailVerified = true, // Consider verified since admin imported
                IsBanned = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);

            // Create AlumniProfile
            var profile = new IHCAE.Api.Features.Auth.Models.Entities.AlumniProfile
            {
                UserId = user.Id,
                Course = alumni.Course,
                Batch = alumni.Batch,
                
                Location = alumni.Location,
                CreatedAt = DateTime.UtcNow
            };
            
            _context.AlumniProfiles.Add(profile);
            
            // Assign Alumni role
            var alumniRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "Alumni");
            if (alumniRole != null)
            {
                _context.UserRoles.Add(new IHCAE.Api.Shared.Models.UserRole
                {
                    UserId = user.Id,
                    RoleId = alumniRole.Id
                });
            }

            alumni.MatchedUserId = user.Id;

            // Generate Setup Token (Password Reset Token)
            var token = Convert.ToBase64String(System.Security.Cryptography.RandomNumberGenerator.GetBytes(32));
            var tokenHash = Convert.ToBase64String(System.Security.Cryptography.SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(token)));

            var resetToken = new IHCAE.Api.Features.PasswordReset.Models.Entities.PasswordResetToken
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                TokenHash = tokenHash,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddDays(7), // Give them 7 days to setup
                IsUsed = false
            };

            _context.PasswordResetTokens.Add(resetToken);
            
            await _context.SaveChangesAsync();

            // Send Setup Email
            if (_emailService != null)
            {
                var setupUrl = $"http://localhost:4200/reset-password?token={Uri.EscapeDataString(token)}&setup=true";
                var emailBody = $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #059669, #047857); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
        .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
        .button {{ display: inline-block; background: #059669; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>🏔️ Welcome to IHCAE Alumni Network</h1>
            <p>Your Account is Ready</p>
        </div>
        <div class='content'>
            <h2>Hello {user.FirstName},</h2>
            <p>We are excited to invite you to the new IHCAE Alumni Network!</p>
            <p>An account has been created for you using your past enrollment records. To claim your account and join the community, please click the button below to set up your password:</p>
            <div style='text-align: center;'>
                <a href='{setupUrl}' class='button'>Claim My Account</a>
            </div>
            <p>This link will expire in 7 days.</p>
        </div>
    </div>
</body>
</html>";
                await _emailService.SendEmailAsync(user.Email, "Welcome to IHCAE Alumni Network - Claim Your Account", emailBody);
            }

            generatedCount++;
        }

        return generatedCount;
    }
}

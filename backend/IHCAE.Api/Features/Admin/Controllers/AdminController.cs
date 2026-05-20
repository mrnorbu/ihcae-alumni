using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using IHCAE.Api.Features.Auth.Services;
using IHCAE.Api.Features.Auth.Repositories;
using IHCAE.Api.Features.Alumni.Services;
using IHCAE.Api.Shared.Services;
using IHCAE.Api.Shared.Data;
using IHCAE.Api.Features.Auth.Models.DTOs;
using IHCAE.Api.Features.Admin.Models.DTOs;
using IHCAE.Api.Features.Alumni.Models.DTOs;
using IHCAE.Api.Shared.DTOs;
using IHCAE.Api.Shared.Constants;
using IHCAE.Api.Features.Auth.Models.Entities;
using IHCAE.Api.Features.Alumni.Models.Entities;
using IHCAE.Api.Features.PasswordReset.Services;

namespace IHCAE.Api.Features.Admin.Controllers;

/// <summary>
/// Controller for administrative operations including user management and alumni data import.
/// Provides endpoints for administrators to manage user registrations and system data.
/// </summary>
[ApiController]
[Route("api/v1/admin")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IUserRepository _userRepository;
    private readonly IAlumniImportService _alumniImportService;
    private readonly IEmailService _emailService;
    private readonly IPasswordResetService _passwordResetService;
    private readonly AppDbContext _context;
    private readonly ILogger<AdminController> _logger;

    /// <summary>
    /// Initializes a new instance of the AdminController.
    /// </summary>
    public AdminController(
        IUserRepository userRepository,
        IAlumniImportService alumniImportService,
        IEmailService emailService,
        IPasswordResetService passwordResetService,
        AppDbContext context,
        ILogger<AdminController> logger)
    {
        _userRepository = userRepository;
        _alumniImportService = alumniImportService;
        _emailService = emailService;
        _passwordResetService = passwordResetService;
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Gets all users with optional filtering and pagination.
    /// </summary>
    [HttpGet("users")]
    [ProducesResponseType(typeof(PaginatedResult<UserSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllUsers(
        string? searchTerm = null,
        string? status = null,
        int page = 1,
        int pageSize = 20)
    {
        try
        {
            IEnumerable<User> users;

            if (!string.IsNullOrEmpty(searchTerm))
            {
                users = await _userRepository.SearchAsync(searchTerm);
            }
            else if (!string.IsNullOrEmpty(status) && Enum.TryParse<UserStatus>(status, true, out var userStatus))
            {
                users = await _userRepository.GetByStatusAsync(userStatus);
            }
            else
            {
                users = await _userRepository.GetAllAsync();
            }

            var totalCount = users.Count();
            
            var pagedUsers = users
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(u => new UserSummaryDto
                {
                    Id = u.Id,
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    Email = u.Email,
                    Status = u.Status.ToString(),
                    CreatedAt = u.CreatedAt,
                    LastLoginAt = u.LastLoginAt,
                    Roles = u.UserRoles.Select(ur => ur.Role.Name).ToList()
                })
                .ToList();

            var result = new PaginatedResult<UserSummaryDto>
            {
                Items = pagedUsers,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving users");
            return StatusCode(500, new ErrorResponse
            {
                StatusCode = 500,
                Message = "An error occurred while retrieving users."
            });
        }
    }

    // ===================== Ban / Unban =====================

    /// <summary>
    /// Bans a user, preventing them from logging in.
    /// </summary>
    [HttpPost("users/{userId}/ban")]
    [ProducesResponseType(typeof(AdminActionResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> BanUser(Guid userId, [FromBody] BanUserRequest? request = null)
    {
        try
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
                return NotFound(new ErrorResponse { StatusCode = 404, Message = "User not found." });

            user.IsBanned = true;
            user.UpdatedAt = DateTime.UtcNow;
            await _userRepository.UpdateAsync(user);

            _logger.LogInformation("User {UserId} ({Email}) banned by admin. Reason: {Reason}",
                userId, user.Email, request?.Reason ?? "No reason provided");

            return Ok(new AdminActionResponse
            {
                Success = true,
                Message = $"{user.FirstName} {user.LastName} has been banned.",
                UserId = userId
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error banning user {UserId}", userId);
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "An error occurred while banning the user." });
        }
    }

    /// <summary>
    /// Unbans a previously banned user, restoring their access.
    /// </summary>
    [HttpPost("users/{userId}/unban")]
    [ProducesResponseType(typeof(AdminActionResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UnbanUser(Guid userId)
    {
        try
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
                return NotFound(new ErrorResponse { StatusCode = 404, Message = "User not found." });

            user.IsBanned = false;
            user.UpdatedAt = DateTime.UtcNow;
            await _userRepository.UpdateAsync(user);

            _logger.LogInformation("User {UserId} ({Email}) unbanned by admin", userId, user.Email);

            return Ok(new AdminActionResponse
            {
                Success = true,
                Message = $"{user.FirstName} {user.LastName} has been unbanned.",
                UserId = userId
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error unbanning user {UserId}", userId);
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "An error occurred while unbanning the user." });
        }
    }

    // ===================== Role Management =====================

    /// <summary>
    /// Updates the roles assigned to a user. Syncs to the provided role list.
    /// </summary>
    [HttpPut("users/{userId}/roles")]
    [ProducesResponseType(typeof(AdminActionResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateUserRoles(Guid userId, [FromBody] UpdateRolesRequest request)
    {
        try
        {
            var user = await _userRepository.GetWithRolesAsync(userId);
            if (user == null)
                return NotFound(new ErrorResponse { StatusCode = 404, Message = "User not found." });

            var currentRoles = user.UserRoles.Select(ur => ur.Role.Name).ToList();
            var desiredRoles = request.Roles ?? new List<string>();

            // Remove roles that are no longer desired
            foreach (var role in currentRoles.Where(r => !desiredRoles.Contains(r)))
            {
                await _userRepository.RemoveRoleAsync(userId, role);
            }

            // Add new roles
            foreach (var role in desiredRoles.Where(r => !currentRoles.Contains(r)))
            {
                await _userRepository.AssignRoleAsync(userId, role);
            }

            _logger.LogInformation("Roles updated for user {UserId}: {Roles}", userId, string.Join(", ", desiredRoles));

            return Ok(new AdminActionResponse
            {
                Success = true,
                Message = $"Roles updated for {user.FirstName} {user.LastName}.",
                UserId = userId
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating roles for user {UserId}", userId);
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "An error occurred while updating roles." });
        }
    }

    // ===================== Admin Password Reset Trigger =====================

    /// <summary>
    /// Triggers a password reset email for a user. Uses the existing password reset flow.
    /// </summary>
    [HttpPost("users/{userId}/trigger-password-reset")]
    [ProducesResponseType(typeof(AdminActionResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> TriggerPasswordReset(Guid userId)
    {
        try
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
                return NotFound(new ErrorResponse { StatusCode = 404, Message = "User not found." });

            await _passwordResetService.InitiatePasswordResetAsync(user.Email);

            _logger.LogInformation("Admin triggered password reset for user {UserId} ({Email})", userId, user.Email);

            return Ok(new AdminActionResponse
            {
                Success = true,
                Message = $"Password reset email sent to {user.Email}.",
                UserId = userId
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error triggering password reset for user {UserId}", userId);
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "An error occurred while sending password reset." });
        }
    }

    // ===================== Admin Edit User Profile =====================

    /// <summary>
    /// Updates a user's profile information (bio, jobTitle, location, course, batch, phone).
    /// </summary>
    [HttpPut("users/{userId}/profile")]
    [ProducesResponseType(typeof(AdminActionResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateUserProfile(Guid userId, [FromBody] AdminUpdateProfileRequest request)
    {
        try
        {
            var user = await _userRepository.GetWithProfileAsync(userId);
            if (user == null)
                return NotFound(new ErrorResponse { StatusCode = 404, Message = "User not found." });

            // Update phone on User entity
            if (request.Phone != null)
                user.Phone = request.Phone;

            user.UpdatedAt = DateTime.UtcNow;

            // Create or update AlumniProfile
            if (user.AlumniProfile == null)
            {
                user.AlumniProfile = new AlumniProfile
                {
                    UserId = userId,
                    Bio = request.Bio,
                    JobTitle = request.JobTitle,
                    Location = request.Location,
                    Course = request.Course,
                    Batch = request.Batch,
                    CreatedAt = DateTime.UtcNow
                };
            }
            else
            {
                if (request.Bio != null) user.AlumniProfile.Bio = request.Bio;
                if (request.JobTitle != null) user.AlumniProfile.JobTitle = request.JobTitle;
                if (request.Location != null) user.AlumniProfile.Location = request.Location;
                if (request.Course != null) user.AlumniProfile.Course = request.Course;
                if (request.Batch != null) user.AlumniProfile.Batch = request.Batch;
                user.AlumniProfile.UpdatedAt = DateTime.UtcNow;
            }

            await _userRepository.UpdateAsync(user);

            _logger.LogInformation("Admin updated profile for user {UserId}", userId);

            return Ok(new AdminActionResponse
            {
                Success = true,
                Message = $"Profile updated for {user.FirstName} {user.LastName}.",
                UserId = userId
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating profile for user {UserId}", userId);
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "An error occurred while updating the profile." });
        }
    }

    // ===================== Alumni Import =====================

    /// <summary>
    /// Imports alumni data from CSV content.
    /// </summary>
    [HttpPost("alumni/import")]
    [ProducesResponseType(typeof(AlumniImportResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ImportAlumniData([FromBody] AlumniImportRequest request)
    {
        try
        {
            if (string.IsNullOrEmpty(request.CsvContent))
            {
                return BadRequest(new ErrorResponse
                {
                    StatusCode = 400,
                    Message = "CSV content is required."
                });
            }

            var result = await _alumniImportService.ImportAlumniDataAsync(request.CsvContent);

            _logger.LogInformation("Alumni data import completed: {ImportedCount} imported, {SkippedCount} skipped", 
                result.ImportedRecords, result.SkippedRecords);

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error importing alumni data");
            return StatusCode(500, new ErrorResponse
            {
                StatusCode = 500,
                Message = "An error occurred while importing alumni data."
            });
        }
    }

    /// <summary>
    /// Previews a CSV import without writing to the database.
    /// Returns the same result shape as ImportAlumniData but performs no DB writes.
    /// </summary>
    [HttpPost("alumni/preview-import")]
    [ProducesResponseType(typeof(AlumniImportResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> PreviewAlumniImport([FromBody] AlumniImportRequest request)
    {
        try
        {
            if (string.IsNullOrEmpty(request.CsvContent))
                return BadRequest(new ErrorResponse { StatusCode = 400, Message = "CSV content is required." });

            var result = await _alumniImportService.PreviewImportAsync(request.CsvContent);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error previewing alumni import");
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "An error occurred while previewing the import." });
        }
    }

    /// <summary>
    /// Gets all emails currently present in the alumni database.
    /// Used by frontend to identify duplicates before importing.
    /// </summary>
    [HttpGet("alumni/emails")]
    [ProducesResponseType(typeof(List<string>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAlumniEmails()
    {
        try
        {
            var emails = await _context.AlumniDatabase.Select(a => a.Email.ToLower()).ToListAsync();
            return Ok(emails);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving alumni emails");
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "An error occurred while retrieving alumni emails." });
        }
    }

    /// <summary>
    /// Gets global statistics for the alumni database.
    /// </summary>
    [HttpGet("alumni/stats")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAlumniDatabaseStats()
    {
        try
        {
            var total = await _context.AlumniDatabase.CountAsync();
            
            // Registered: user matched and has logged in
            var registered = await _context.AlumniDatabase
                .CountAsync(a => a.MatchedUserId != null && a.MatchedUser != null && a.MatchedUser.LastLoginAt != null);
                
            // Invitation Sent: user matched but has not logged in yet
            var invitationSent = await _context.AlumniDatabase
                .CountAsync(a => a.MatchedUserId != null && (a.MatchedUser == null || a.MatchedUser.LastLoginAt == null));
                
            // Pending Invitation: not matched yet
            var pendingInvitation = await _context.AlumniDatabase
                .CountAsync(a => a.MatchedUserId == null);
            
            // Courses count
            var courses = await _context.AlumniDatabase
                .Select(a => a.Course)
                .Where(c => c != null && c != "")
                .Distinct()
                .CountAsync();

            return Ok(new {
                success = true,
                total,
                registered,
                invitationSent,
                pendingInvitation,
                courses
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving alumni database stats");
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "An error occurred." });
        }
    }

    /// <summary>
    /// Gets alumni database records with optional filtering and pagination.
    /// </summary>
    [HttpGet("alumni")]
    [ProducesResponseType(typeof(PaginatedResult<AlumniDatabaseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAlumniRecords(
        string? searchTerm = null,
        bool? matchedOnly = null,
        string? status = null,
        int page = 1,
        int pageSize = 20)
    {
        try
        {
            var result = await _alumniImportService.GetAlumniRecordsAsync(searchTerm, matchedOnly, page, pageSize, status);

            var alumniDtos = result.Items.Select(a => new AlumniDatabaseDto
            {
                Id = a.Id,
                FirstName = a.FirstName,
                LastName = a.LastName,
                Email = a.Email,
                Course = a.Course,
                Batch = a.Batch,
                Phone = a.Phone,
                Location = a.Location,
                MatchedUserId = a.MatchedUserId,
                ImportedAt = a.ImportedAt,
                LastLoginAt = a.MatchedUser?.LastLoginAt
            }).ToList();

            var response = new PaginatedResult<AlumniDatabaseDto>
            {
                Items = alumniDtos,
                TotalCount = result.TotalCount,
                Page = result.Page,
                PageSize = result.PageSize
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving alumni records");
            return StatusCode(500, new ErrorResponse
            {
                StatusCode = 500,
                Message = "An error occurred while retrieving alumni records."
            });
        }
    }

    /// <summary>
    /// Bulk updates alumni database records.
    /// </summary>
    [HttpPut("alumni/bulk-update")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> BulkUpdateAlumni([FromBody] List<AlumniDatabaseDto> records)
    {
        try
        {
            if (records == null || !records.Any())
            {
                return BadRequest(new ErrorResponse { StatusCode = 400, Message = "No records provided." });
            }

            await _alumniImportService.UpdateAlumniRecordsAsync(records);
            return Ok(new { Success = true, Message = "Records updated successfully." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating alumni records");
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "An error occurred." });
        }
    }

    /// <summary>
    /// Bulk generates user accounts from alumni database records.
    /// </summary>
    [HttpPost("alumni/bulk-generate-accounts")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> BulkGenerateAccounts([FromBody] List<Guid> alumniIds)
    {
        try
        {
            if (alumniIds == null || !alumniIds.Any())
            {
                return BadRequest(new ErrorResponse { StatusCode = 400, Message = "No alumni IDs provided." });
            }

            BulkGenerateResultDto result = await _alumniImportService.BulkGenerateUserAccountsAsync(alumniIds);

            return Ok(new {
                Success = true,
                Message = $"Generated {result.GeneratedCount} accounts, linked {result.LinkedCount} existing. {(result.Errors.Any() ? $"{result.Errors.Count} error(s)." : "")}".Trim(),
                GeneratedCount = result.GeneratedCount,
                LinkedCount = result.LinkedCount,
                Errors = result.Errors
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating user accounts");
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "An error occurred generating accounts." });
        }
    }

    /// <summary>
    /// Resends the account-claim invitation email to an alumni who has not yet claimed their account.
    /// Returns 400 if the account is already claimed or no account has been generated yet.
    /// </summary>
    [HttpPost("alumni/{id}/resend-invitation")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ResendInvitation(Guid id)
    {
        try
        {
            await _alumniImportService.ResendInvitationAsync(id);
            return Ok(new { Success = true, Message = "Invitation email resent successfully." });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new ErrorResponse { StatusCode = 404, Message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ErrorResponse { StatusCode = 400, Message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error resending invitation for alumni {AlumniId}", id);
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "An error occurred while resending the invitation." });
        }
    }

    /// <summary>
    /// Bulk resends the account-claim invitation emails to selected alumni.
    /// </summary>
    [HttpPost("alumni/bulk-resend-invitation")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> BulkResendInvitation([FromBody] List<Guid> alumniIds)
    {
        try
        {
            if (alumniIds == null || !alumniIds.Any())
            {
                return BadRequest(new ErrorResponse { StatusCode = 400, Message = "No alumni IDs provided." });
            }

            int successCount = 0;
            var errors = new List<string>();

            foreach (var id in alumniIds)
            {
                try
                {
                    await _alumniImportService.ResendInvitationAsync(id);
                    successCount++;
                }
                catch (Exception ex)
                {
                    errors.Add($"Alumni ID {id}: {ex.Message}");
                }
            }

            return Ok(new {
                Success = true,
                Message = $"Successfully sent reminders to {successCount} alumni. {(errors.Any() ? $"{errors.Count} error(s)." : "")}".Trim(),
                SuccessCount = successCount,
                Errors = errors
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error bulk resending invitations");
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "An error occurred while bulk resending invitations." });
        }
    }

    /// <summary>
    /// Deletes a specific alumni database record.
    /// </summary>
    [HttpDelete("alumni/{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteAlumni(Guid id)
    {
        try
        {
            var success = await _alumniImportService.DeleteAlumniRecordAsync(id);
            if (!success)
            {
                return NotFound(new ErrorResponse { StatusCode = 404, Message = "Alumni record not found." });
            }
            return Ok(new { Success = true, Message = "Alumni record deleted successfully." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting alumni record {Id}", id);
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "An error occurred while deleting." });
        }
    }

    /// <summary>
    /// Creates a single new alumni database record manually.
    /// </summary>
    [HttpPost("alumni")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateAlumni([FromBody] AlumniDatabaseDto record)
    {
        try
        {
            if (record == null)
            {
                return BadRequest(new ErrorResponse { StatusCode = 400, Message = "Record is null." });
            }

            var created = await _alumniImportService.CreateAlumniRecordAsync(record);
            return Ok(new { Success = true, Message = "Alumni record created successfully." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ErrorResponse { StatusCode = 400, Message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating alumni record");
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "An unexpected error occurred." });
        }
    }
}

// ===================== Request DTOs =====================

/// <summary>
/// Request body for banning a user.
/// </summary>
public class BanUserRequest
{
    public string? Reason { get; set; }
}

/// <summary>
/// Request body for updating user roles.
/// </summary>
public class UpdateRolesRequest
{
    public List<string> Roles { get; set; } = new();
}

/// <summary>
/// Request body for admin updating a user's profile.
/// </summary>
public class AdminUpdateProfileRequest
{
    public string? Bio { get; set; }
    public string? JobTitle { get; set; }
    public string? Location { get; set; }
    public string? Course { get; set; }
    public string? Batch { get; set; }
    public string? Phone { get; set; }
}

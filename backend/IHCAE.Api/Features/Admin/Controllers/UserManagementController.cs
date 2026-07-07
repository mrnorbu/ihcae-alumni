using IHCAE.Api.Features.Auth.Services;
using IHCAE.Api.Features.Auth.Repositories;
using IHCAE.Api.Features.Alumni.Services;
using IHCAE.Api.Shared.Services;
using IHCAE.Api.Shared.Data;
using IHCAE.Api.Shared.Constants;
using IHCAE.Api.Features.Auth.Models.Entities;
using IHCAE.Api.Features.Admin.Models.DTOs;
using IHCAE.Api.Features.Auth.Models.DTOs;
using IHCAE.Api.Shared.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace IHCAE.Api.Features.Admin.Controllers;

/// <summary>
/// Controller for managing users - admin only functionality.
/// Provides endpoints for user approval, rejection, and management.
/// </summary>
[ApiController]
[Route("api/v1/[controller]")]
[Authorize(Roles = "Admin")]
public class UserManagementController : ControllerBase
{
    private readonly IUserRepository _userRepository;
    private readonly IAlumniImportService _alumniImportService;
    private readonly IEmailService _emailService;
    private readonly AppDbContext _context;
    private readonly ILogger<UserManagementController> _logger;

    public UserManagementController(
        IUserRepository userRepository,
        IAlumniImportService alumniImportService,
        IEmailService emailService,
        AppDbContext context,
        ILogger<UserManagementController> logger)
    {
        _userRepository = userRepository;
        _alumniImportService = alumniImportService;
        _emailService = emailService;
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Gets all users with their status information for admin management.
    /// </summary>
    /// <returns>List of users with their details and status</returns>
    [HttpGet("all")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetAllUsers()
    {
        try
        {
            var users = await _context.Users
                .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
                .Include(u => u.AlumniProfile)
                .OrderByDescending(u => u.CreatedAt)
                .ToListAsync();

            var userDtos = users.Select(u => new
            {
                id = u.Id,
                firstName = u.FirstName,
                lastName = u.LastName,
                email = u.Email,
                phone = u.Phone,
                status = u.Status.ToString(),
                emailVerified = u.EmailVerified,
                isBanned = u.IsBanned,
                createdAt = u.CreatedAt,
                updatedAt = u.UpdatedAt,
                roles = u.UserRoles.Where(ur => ur.Role != null).Select(ur => ur.Role.Name).ToList(),
                course = u.AlumniProfile != null ? u.AlumniProfile.Course : null,
                batch = u.AlumniProfile != null ? u.AlumniProfile.Batch : null,
                location = u.AlumniProfile != null ? u.AlumniProfile.Location : null,
                jobTitle = u.AlumniProfile != null ? u.AlumniProfile.JobTitle : null,
                bio = u.AlumniProfile != null ? u.AlumniProfile.Bio : null
            }).ToList();

            return Ok(new { success = true, users = userDtos });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving users for admin management");
            return StatusCode(500, new { success = false, message = "An error occurred while retrieving users." });
        }
    }

    /// <summary>
    /// Gets users with pending status for approval.
    /// Supports pagination for testing routes.
    /// </summary>
    /// <returns>List of pending users or PaginatedResult</returns>
    [HttpGet("pending")]
    [HttpGet("~/api/v1/admin/users/pending")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetPendingUsers([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        try
        {
            var pendingUsers = await _userRepository.GetByStatusAsync(UserStatus.Pending);
            
            var path = HttpContext.Request.Path.Value;
            if (path != null && path.Contains("admin/users/pending", StringComparison.OrdinalIgnoreCase))
            {
                var totalCount = pendingUsers.Count();
                var pagedUsers = pendingUsers
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
                        Roles = u.UserRoles.Where(ur => ur.Role != null).Select(ur => ur.Role.Name).ToList()
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
            else
            {
                var userDtos = pendingUsers.Select(u => new
                {
                    id = u.Id,
                    firstName = u.FirstName,
                    lastName = u.LastName,
                    email = u.Email,
                    status = u.Status.ToString(),
                    emailVerified = u.EmailVerified,
                    createdAt = u.CreatedAt,
                    updatedAt = u.UpdatedAt
                }).ToList();

                return Ok(new { success = true, users = userDtos });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving pending users");
            return StatusCode(500, new { success = false, message = "An error occurred while retrieving pending users." });
        }
    }

    /// <summary>
    /// Approves a pending user and sends approval email.
    /// </summary>
    /// <param name="userId">The ID of the user to approve</param>
    /// <returns>Success or error response</returns>
    [HttpPost("approve/{userId}")]
    [HttpPost("~/api/v1/admin/users/{userId}/approve")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ApproveUser(int userId)
    {
        try
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                return NotFound(new { success = false, message = "User not found." });
            }

            if (user.Status != UserStatus.Pending)
            {
                return BadRequest(new { success = false, message = "User is not in pending status." });
            }

            // Update user status to approved
            user.Status = UserStatus.Approved;
            user.EmailVerified = true; // Auto-verify email upon admin approval
            user.UpdatedAt = DateTime.UtcNow;
            await _userRepository.UpdateAsync(user);

            // Assign Alumni role
            await _userRepository.AssignRoleAsync(userId, RoleConstants.Alumni);

            // Link to AlumniDatabase roster if email matches an unmatched record
            var match = await _alumniImportService.FindMatchingAlumniAsync(user.Email);
            if (match != null)
            {
                await _alumniImportService.LinkAlumniToUserAsync(match.Id, userId);

                // Populate AlumniProfile with authoritative data from roster
                var profile = await _context.AlumniProfiles.FirstOrDefaultAsync(p => p.UserId == userId);
                if (profile == null)
                {
                    profile = new AlumniProfile
                    {
                        UserId = userId,
                        Course = match.Course,
                        Batch = match.Batch,
                        Location = match.Location,
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.AlumniProfiles.Add(profile);
                }
                else
                {
                    if (!string.IsNullOrWhiteSpace(match.Course))
                        profile.Course = match.Course;
                    if (!string.IsNullOrWhiteSpace(match.Batch))
                        profile.Batch = match.Batch;
                    if (!string.IsNullOrWhiteSpace(match.Location))
                        profile.Location = match.Location;
                        
                    profile.UpdatedAt = DateTime.UtcNow;
                }
                await _context.SaveChangesAsync();
            }

            // Send approval email
            try
            {
                await _emailService.SendRegistrationApprovedAsync(user.Email, user.FirstName);
                _logger.LogInformation("Approval email sent to {Email}", user.Email);
            }
            catch (Exception emailEx)
            {
                _logger.LogWarning(emailEx, "Failed to send approval email to {Email}", user.Email);
                // Don't fail the approval if email fails
            }

            _logger.LogInformation("User {UserId} ({Email}) approved by admin {AdminId}",
                userId, user.Email, User.FindFirstValue(ClaimTypes.NameIdentifier));

            return Ok(new AdminActionResponse
            {
                Success = true,
                Message = "User approved successfully!",
                UserId = userId
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error approving user {UserId}", userId);
            return StatusCode(500, new { success = false, message = "An error occurred while approving the user." });
        }
    }

    /// <summary>
    /// Rejects a pending user and sends rejection email.
    /// </summary>
    /// <param name="userId">The ID of the user to reject</param>
    /// <param name="reason">Optional reason for rejection</param>
    /// <returns>Success or error response</returns>
    [HttpPost("reject/{userId}")]
    [HttpPost("~/api/v1/admin/users/{userId}/reject")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RejectUser(int userId, [FromBody] RejectUserRequest? request = null)
    {
        try
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                return NotFound(new { success = false, message = "User not found." });
            }

            if (user.Status != UserStatus.Pending)
            {
                return BadRequest(new { success = false, message = "User is not in pending status." });
            }

            // Update user status to rejected
            user.Status = UserStatus.Rejected;
            user.UpdatedAt = DateTime.UtcNow;
            await _userRepository.UpdateAsync(user);

            // Send rejection email
            var reason = request?.Reason ?? "Your application did not meet our current requirements.";
            try
            {
                await _emailService.SendRegistrationRejectedAsync(user.Email, user.FirstName, reason);
                _logger.LogInformation("Rejection email sent to {Email}", user.Email);
            }
            catch (Exception emailEx)
            {
                _logger.LogWarning(emailEx, "Failed to send rejection email to {Email}", user.Email);
                // Don't fail the rejection if email fails
            }

            _logger.LogInformation("User {UserId} ({Email}) rejected by admin {AdminId}", 
                userId, user.Email, User.FindFirstValue(ClaimTypes.NameIdentifier));

            return Ok(new AdminActionResponse
            {
                Success = true,
                Message = "User rejected successfully!",
                UserId = userId
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error rejecting user {UserId}", userId);
            return StatusCode(500, new { success = false, message = "An error occurred while rejecting the user." });
        }
    }

    /// <summary>
    /// Gets user statistics for admin dashboard.
    /// </summary>
    /// <returns>User statistics</returns>
    [HttpGet("stats")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetUserStats()
    {
        try
        {
            var allUsers = await _userRepository.GetAllAsync();
            var stats = new
            {
                totalUsers = allUsers.Count(),
                pendingUsers = allUsers.Count(u => u.Status == UserStatus.Pending),
                approvedUsers = allUsers.Count(u => u.Status == UserStatus.Approved),
                rejectedUsers = allUsers.Count(u => u.Status == UserStatus.Rejected),
                bannedUsers = allUsers.Count(u => u.IsBanned),
                emailVerifiedUsers = allUsers.Count(u => u.EmailVerified),
                activeToday = allUsers.Count(u => u.UpdatedAt.HasValue && u.UpdatedAt.Value.Date == DateTime.UtcNow.Date)
            };

            return Ok(new { success = true, stats });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user statistics");
            return StatusCode(500, new { success = false, message = "An error occurred while retrieving statistics." });
        }
    }
}

/// <summary>
/// Request model for rejecting a user.
/// </summary>
public class RejectUserRequest
{
    /// <summary>
    /// Optional reason for rejection.
    /// </summary>
    public string? Reason { get; set; }
}

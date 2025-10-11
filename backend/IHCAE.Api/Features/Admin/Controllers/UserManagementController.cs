using IHCAE.Api.Features.Auth.Services;
using IHCAE.Api.Features.Auth.Repositories;
using IHCAE.Api.Shared.Services;
using IHCAE.Api.Features.Auth.Models.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
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
    private readonly IEmailService _emailService;
    private readonly ILogger<UserManagementController> _logger;

    public UserManagementController(
        IUserRepository userRepository,
        IEmailService emailService,
        ILogger<UserManagementController> logger)
    {
        _userRepository = userRepository;
        _emailService = emailService;
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
            var users = await _userRepository.GetAllAsync();
            var userDtos = users.Select(u => new
            {
                id = u.Id,
                firstName = u.FirstName,
                lastName = u.LastName,
                email = u.Email,
                status = u.Status.ToString(),
                emailVerified = u.EmailVerified,
                isBanned = u.IsBanned,
                createdAt = u.CreatedAt,
                updatedAt = u.UpdatedAt,
                roles = u.UserRoles.Select(ur => ur.Role.Name).ToList()
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
    /// </summary>
    /// <returns>List of pending users</returns>
    [HttpGet("pending")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetPendingUsers()
    {
        try
        {
            var pendingUsers = await _userRepository.GetByStatusAsync(UserStatus.Pending);
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
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ApproveUser(Guid userId)
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
            user.UpdatedAt = DateTime.UtcNow;
            await _userRepository.UpdateAsync(user);

            // Send approval email
            var subject = "Welcome to IHCAE Alumni Network - Account Approved!";
            var body = $"<p>Dear {user.FirstName} {user.LastName},</p>" +
                       "<p>Great news! Your account has been approved by our admin team.</p>" +
                       "<p>You can now:</p>" +
                       "<ul>" +
                       "<li>Access all features of the alumni network</li>" +
                       "<li>Participate in discussions and forums</li>" +
                       "<li>Connect with other alumni members</li>" +
                       "<li>Access exclusive alumni resources</li>" +
                       "</ul>" +
                       "<p>Please log in to your account to get started.</p>" +
                       "<p>Welcome to the IHCAE Alumni Network!</p>" +
                       "<p>Best regards,<br/>IHCAE Alumni Network Team</p>";

            try
            {
                await _emailService.SendEmailAsync(user.Email, subject, body);
                _logger.LogInformation("Approval email sent to {Email}", user.Email);
            }
            catch (Exception emailEx)
            {
                _logger.LogWarning(emailEx, "Failed to send approval email to {Email}", user.Email);
                // Don't fail the approval if email fails
            }

            _logger.LogInformation("User {UserId} ({Email}) approved by admin {AdminId}", 
                userId, user.Email, User.FindFirstValue(ClaimTypes.NameIdentifier));

            return Ok(new { success = true, message = "User approved successfully!" });
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
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RejectUser(Guid userId, [FromBody] RejectUserRequest? request = null)
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
            var subject = "IHCAE Alumni Network - Application Status Update";
            var body = $"<p>Dear {user.FirstName} {user.LastName},</p>" +
                       "<p>Thank you for your interest in joining the IHCAE Alumni Network.</p>" +
                       "<p>After careful review, we regret to inform you that your application has not been approved at this time.</p>" +
                       $"<p><strong>Reason:</strong> {reason}</p>" +
                       "<p>You may reapply in the future if your circumstances change.</p>" +
                       "<p>If you have any questions, please contact our support team.</p>" +
                       "<p>Best regards,<br/>IHCAE Alumni Network Team</p>";

            try
            {
                await _emailService.SendEmailAsync(user.Email, subject, body);
                _logger.LogInformation("Rejection email sent to {Email}", user.Email);
            }
            catch (Exception emailEx)
            {
                _logger.LogWarning(emailEx, "Failed to send rejection email to {Email}", user.Email);
                // Don't fail the rejection if email fails
            }

            _logger.LogInformation("User {UserId} ({Email}) rejected by admin {AdminId}", 
                userId, user.Email, User.FindFirstValue(ClaimTypes.NameIdentifier));

            return Ok(new { success = true, message = "User rejected successfully!" });
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

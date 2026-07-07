using System;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using IHCAE.Api.Features.Notifications.Models.DTOs;
using IHCAE.Api.Shared.Data;
using IHCAE.Api.Shared.DTOs;

namespace IHCAE.Api.Features.Notifications.Controllers;

/// <summary>
/// Controller for managing in-app notifications for authenticated users.
/// </summary>
[ApiController]
[Route("api/v1/notifications")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<NotificationsController> _logger;

    public NotificationsController(AppDbContext context, ILogger<NotificationsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Gets a paginated list of notifications for the current user.
    /// Also returns the total count of unread notifications.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PaginatedResult<NotificationDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetNotifications(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        try
        {
            var userId = GetCurrentUserId();

            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 20;

            var query = _context.Notifications
                .Where(n => n.UserId == userId);

            var totalCount = await query.CountAsync();
            var unreadCount = await query.CountAsync(n => !n.IsRead);

            var notifications = await query
                .OrderByDescending(n => n.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(n => new NotificationDto
                {
                    Id = n.Id,
                    Title = n.Title,
                    Message = n.Message,
                    Type = n.Type,
                    Link = n.Link,
                    IsRead = n.IsRead,
                    CreatedAt = n.CreatedAt
                })
                .ToListAsync();

            // Set the unread count in header response for UI
            Response.Headers.Append("X-Unread-Count", unreadCount.ToString());

            return Ok(new PaginatedResult<NotificationDto>
            {
                Items = notifications,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting notifications for user");
            return StatusCode(500, new ErrorResponse { Message = "An error occurred while fetching notifications." });
        }
    }

    /// <summary>
    /// Gets the count of unread notifications for the current user.
    /// </summary>
    [HttpGet("unread-count")]
    [ProducesResponseType(typeof(int), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetUnreadCount()
    {
        try
        {
            var userId = GetCurrentUserId();
            var count = await _context.Notifications.CountAsync(n => n.UserId == userId && !n.IsRead);
            return Ok(count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting unread notification count");
            return StatusCode(500, new ErrorResponse { Message = "An error occurred." });
        }
    }

    /// <summary>
    /// Marks a specific notification as read.
    /// </summary>
    [HttpPut("{id}/read")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> MarkAsRead(int id)
    {
        try
        {
            var userId = GetCurrentUserId();
            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);

            if (notification == null)
            {
                return NotFound(new ErrorResponse { Message = "Notification not found." });
            }

            if (!notification.IsRead)
            {
                notification.IsRead = true;
                await _context.SaveChangesAsync();
            }

            return Ok(new { Message = "Notification marked as read." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error marking notification {Id} as read", id);
            return StatusCode(500, new ErrorResponse { Message = "An error occurred." });
        }
    }

    /// <summary>
    /// Marks all notifications for the current user as read.
    /// </summary>
    [HttpPut("read-all")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> MarkAllAsRead()
    {
        int userId = 0;
        try
        {
            userId = GetCurrentUserId();
            var unreadNotifications = await _context.Notifications
                .Where(n => n.UserId == userId && !n.IsRead)
                .ToListAsync();

            if (unreadNotifications.Any())
            {
                foreach (var notification in unreadNotifications)
                {
                    notification.IsRead = true;
                }
                await _context.SaveChangesAsync();
            }

            return Ok(new { Message = "All notifications marked as read." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error marking all notifications as read for user {UserId}", userId);
            return StatusCode(500, new ErrorResponse { Message = "An error occurred." });
        }
    }

    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
        {
            throw new UnauthorizedAccessException("Invalid user token.");
        }
        return userId;
    }
}

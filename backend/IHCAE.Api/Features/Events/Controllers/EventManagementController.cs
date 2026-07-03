using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using IHCAE.Api.Features.Events.Services;
using IHCAE.Api.Features.Events.Models.DTOs;
using IHCAE.Api.Features.News.Controllers;
using IHCAE.Api.Shared.DTOs;

namespace IHCAE.Api.Features.Events.Controllers;

/// <summary>
/// Controller for event management (Admin and Content Creator)
/// </summary>
[ApiController]
[Route("api/v1/events/management")]
[Authorize]
public class EventManagementController : ControllerBase
{
    private readonly IEventService _eventService;
    private readonly ILogger<EventManagementController> _logger;

    public EventManagementController(IEventService eventService, ILogger<EventManagementController> logger)
    {
        _eventService = eventService;
        _logger = logger;
    }

    /// <summary>
    /// Create a new event (Admin/ContentCreator)
    /// <summary>
    /// Get events for management (Admin sees all, ContentCreator sees own)
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "Admin,ContentCreator")]
    [ProducesResponseType(typeof(List<EventSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetManagementEvents()
    {
        try
        {
            var userId = GetCurrentUserId();
            var isAdmin = User.IsInRole("Admin") || User.IsInRole("ContentCreator");
            var events = await _eventService.GetManagementEventsAsync(userId, isAdmin);
            return Ok(events);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving management events");
            throw;
        }
    }

    /// <summary>
    /// Create a new event (Admin/ContentCreator)
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin,ContentCreator")]
    [ProducesResponseType(typeof(EventDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateEvent([FromBody] CreateEventRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new ErrorResponse { Message = "Invalid request data" });
            }

            var userId = GetCurrentUserId();
            var isAdmin = User.IsInRole("Admin") || User.IsInRole("ContentCreator");

            var eventDto = await _eventService.CreateEventAsync(userId, request, isAdmin);
            return CreatedAtRoute("GetEventById", new { controller = "Events", id = eventDto.Id }, eventDto);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid argument when creating event");
            return BadRequest(new ErrorResponse { Message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating event");
            throw;
        }
    }

    /// <summary>
    /// Update an existing event (Admin/ContentCreator - own events only)
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,ContentCreator")]
    [ProducesResponseType(typeof(EventDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateEvent(Guid id, [FromBody] UpdateEventRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new ErrorResponse { Message = "Invalid request data" });
            }

            var userId = GetCurrentUserId();
            var isAdmin = User.IsInRole("Admin") || User.IsInRole("ContentCreator");

            var eventDto = await _eventService.UpdateEventAsync(id, userId, request, isAdmin);
            return Ok(eventDto);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Event {EventId} not found", id);
            return NotFound(new ErrorResponse { Message = "Event not found" });
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access attempt for event {EventId}", id);
            return StatusCode(403, new ErrorResponse { Message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid argument when updating event {EventId}", id);
            return BadRequest(new ErrorResponse { Message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating event {EventId}", id);
            throw;
        }
    }

    /// <summary>
    /// Delete an event (Admin/ContentCreator - own events only)
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,ContentCreator")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteEvent(Guid id)
    {
        try
        {
            var userId = GetCurrentUserId();
            var isAdmin = User.IsInRole("Admin") || User.IsInRole("ContentCreator");

            var deleted = await _eventService.DeleteEventAsync(id, userId, isAdmin);
            if (!deleted)
            {
                return NotFound(new ErrorResponse { Message = "Event not found" });
            }

            return Ok(new { Message = "Event deleted successfully" });
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized delete attempt for event {EventId}", id);
            return StatusCode(403, new ErrorResponse { Message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting event {EventId}", id);
            throw;
        }
    }

    /// <summary>
    /// Get pending events for admin review
    /// </summary>
    [HttpGet("pending")]
    [Authorize(Roles = "Admin,ContentCreator")]
    [ProducesResponseType(typeof(PaginatedResult<EventSummaryDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetPendingEvents(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        try
        {
            var result = await _eventService.GetPendingEventsAsync(page, pageSize);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving pending events");
            throw;
        }
    }

    /// <summary>
    /// Approve a pending event (Admin only)
    /// </summary>
    [HttpPost("{id}/approve")]
    [Authorize(Roles = "Admin,ContentCreator")]
    [ProducesResponseType(typeof(EventDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ApproveEvent(Guid id)
    {
        try
        {
            var adminId = GetCurrentUserId();
            var eventDto = await _eventService.ApproveEventAsync(id, adminId);
            return Ok(eventDto);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Event {EventId} not found", id);
            return NotFound(new ErrorResponse { Message = "Event not found" });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid operation when approving event {EventId}", id);
            return BadRequest(new ErrorResponse { Message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error approving event {EventId}", id);
            throw;
        }
    }

    /// <summary>
    /// Reject a pending event (Admin only)
    /// </summary>
    [HttpPost("{id}/reject")]
    [Authorize(Roles = "Admin,ContentCreator")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RejectEvent(Guid id, [FromBody] RejectContentRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Reason))
            {
                return BadRequest(new ErrorResponse { Message = "Rejection reason is required" });
            }

            var adminId = GetCurrentUserId();
            var rejected = await _eventService.RejectEventAsync(id, adminId, request.Reason);
            
            if (!rejected)
            {
                return NotFound(new ErrorResponse { Message = "Event not found" });
            }

            return Ok(new { Message = "Event rejected successfully" });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid operation when rejecting event {EventId}", id);
            return BadRequest(new ErrorResponse { Message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error rejecting event {EventId}", id);
            throw;
        }
    }

    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            throw new UnauthorizedAccessException("Invalid user token");
        }
        return userId;
    }
}

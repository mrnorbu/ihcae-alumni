using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using IHCAE.Api.Features.Events.Services;
using IHCAE.Api.Features.Events.Models.DTOs;
using IHCAE.Api.Shared.DTOs;

namespace IHCAE.Api.Features.Events.Controllers;

/// <summary>
/// Public controller for events viewing and registration
/// </summary>
[ApiController]
[Route("api/v1/events")]
public class EventsController : ControllerBase
{
    private readonly IEventService _eventService;
    private readonly IEventRegistrationService _registrationService;
    private readonly ILogger<EventsController> _logger;

    public EventsController(
        IEventService eventService,
        IEventRegistrationService registrationService,
        ILogger<EventsController> logger)
    {
        _eventService = eventService;
        _registrationService = registrationService;
        _logger = logger;
    }

    /// <summary>
    /// Get upcoming published events with pagination and filtering
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PaginatedResult<EventSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetUpcomingEvents(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] Guid? categoryId = null,
        [FromQuery] string? location = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        try
        {
            var result = await _eventService.GetUpcomingEventsAsync(
                page, pageSize, categoryId, location, startDate, endDate);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving upcoming events");
            throw;
        }
    }

    /// <summary>
    /// Get a single published event by ID
    /// </summary>
    [HttpGet("{id}", Name = "GetEventById")]
    [ProducesResponseType(typeof(EventDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetEventById(Guid id)
    {
        try
        {
            var eventDto = await _eventService.GetEventByIdAsync(id);
            return Ok(eventDto);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Event {EventId} not found", id);
            return NotFound(new ErrorResponse { Message = "Event not found" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving event {EventId}", id);
            throw;
        }
    }

    /// <summary>
    /// Register for an event (public - no authentication required)
    /// </summary>
    [HttpPost("{id}/register")]
    [ProducesResponseType(typeof(EventRegistrationDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RegisterForEvent(Guid id, [FromBody] RegisterForEventRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new ErrorResponse { Message = "Invalid request data" });
            }

            // Get user ID if authenticated
            Guid? userId = null;
            if (User.Identity?.IsAuthenticated == true)
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!string.IsNullOrEmpty(userIdClaim) && Guid.TryParse(userIdClaim, out var parsedUserId))
                {
                    userId = parsedUserId;
                }
            }

            var registration = await _registrationService.RegisterForEventAsync(id, request, userId);
            return CreatedAtAction(nameof(GetEventById), new { id }, registration);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Event {EventId} not found", id);
            return NotFound(new ErrorResponse { Message = "Event not found" });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid registration attempt for event {EventId}", id);
            return BadRequest(new ErrorResponse { Message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error registering for event {EventId}", id);
            throw;
        }
    }

    /// <summary>
    /// Check if an email is already registered for an event
    /// </summary>
    [HttpGet("{id}/check-registration")]
    [ProducesResponseType(typeof(bool), StatusCodes.Status200OK)]
    public async Task<IActionResult> CheckIfRegistered(Guid id, [FromQuery] string email)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(email))
            {
                return BadRequest(new ErrorResponse { Message = "Email is required" });
            }

            var isRegistered = await _registrationService.CheckIfRegisteredAsync(id, email);
            return Ok(new { IsRegistered = isRegistered });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking registration for event {EventId}", id);
            throw;
        }
    }

    /// <summary>
    /// Get available spots for an event
    /// </summary>
    [HttpGet("{id}/available-spots")]
    [ProducesResponseType(typeof(int), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetAvailableSpots(Guid id)
    {
        try
        {
            var availableSpots = await _registrationService.GetAvailableSpotsAsync(id);
            return Ok(new { AvailableSpots = availableSpots });
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Event {EventId} not found", id);
            return NotFound(new ErrorResponse { Message = "Event not found" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting available spots for event {EventId}", id);
            throw;
        }
    }

    /// <summary>
    /// Get all event categories
    /// </summary>
    [HttpGet("categories")]
    [ProducesResponseType(typeof(List<EventCategoryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCategories()
    {
        try
        {
            var categories = await _eventService.GetCategoriesAsync();
            return Ok(categories);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving event categories");
            throw;
        }
    }

    /// <summary>
    /// Get event registrations (Admin only)
    /// </summary>
    [HttpGet("{id}/registrations")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(PaginatedResult<EventRegistrationDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetEventRegistrations(
        Guid id,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        try
        {
            var result = await _registrationService.GetEventRegistrationsAsync(id, page, pageSize);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving registrations for event {EventId}", id);
            throw;
        }
    }

    /// <summary>
    /// Export event registrations as CSV (Admin only)
    /// </summary>
    [HttpGet("{id}/registrations/export")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> ExportRegistrations(Guid id)
    {
        try
        {
            var csvData = await _registrationService.ExportRegistrationsToCsvAsync(id);
            return File(csvData, "text/csv", $"event-{id}-registrations.csv");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting registrations for event {EventId}", id);
            throw;
        }
    }
}

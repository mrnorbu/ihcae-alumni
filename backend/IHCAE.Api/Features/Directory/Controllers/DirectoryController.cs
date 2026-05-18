using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using IHCAE.Api.Features.Directory.Services;
using IHCAE.Api.Features.Directory.Models.DTOs;
using IHCAE.Api.Shared.DTOs;

namespace IHCAE.Api.Features.Directory.Controllers;

/// <summary>
/// Controller for alumni directory operations.
/// Provides endpoints for browsing the alumni directory and viewing member profiles.
/// All endpoints require authentication and only return approved alumni members.
/// 
/// Features:
/// - Paginated alumni directory with search and filtering
/// - Detailed alumni profile view with contact information
/// - Security validation to ensure only approved alumni are accessible
/// </summary>
[ApiController]
[Route("api/v1/alumni")]
[Authorize] // All endpoints require authentication
public class DirectoryController : ControllerBase
{
    private readonly IDirectoryService _directoryService;
    private readonly ILogger<DirectoryController> _logger;

    /// <summary>
    /// Initializes the DirectoryController with required services.
    /// </summary>
    /// <param name="directoryService">Service for directory operations</param>
    /// <param name="logger">Logger for tracking controller operations</param>
    public DirectoryController(
        IDirectoryService directoryService,
        ILogger<DirectoryController> logger)
    {
        _directoryService = directoryService;
        _logger = logger;
    }

    /// <summary>
    /// Gets a paginated, filtered list of approved alumni for the directory.
    /// Supports search by name/email and filtering by course/graduation year.
    /// Only returns approved alumni members for security.
    /// Used by the frontend directory page for browsing alumni.
    /// </summary>
    /// <param name="search">Optional search term for name or email filtering</param>
    /// <param name="course">Optional course filter (e.g., "Advanced Mountaineering")</param>
    /// <param name="graduationYear">Optional graduation year filter (e.g., 2020)</param>
    /// <param name="page">Page number (1-based, default: 1)</param>
    /// <param name="pageSize">Number of records per page (default: 20, max: 100)</param>
    /// <returns>Paginated list of alumni cards</returns>
    /// <response code="200">Directory retrieved successfully</response>
    /// <response code="400">Invalid pagination parameters</response>
    /// <response code="401">User not authenticated</response>
    [HttpGet]
    [ProducesResponseType(typeof(PaginatedResult<AlumniCardDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetAlumniDirectory(
        [FromQuery] string? search = null,
        [FromQuery] string? course = null,
        [FromQuery] string? batch = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        try
        {
            // Validate pagination parameters
            if (page < 1)
            {
                return BadRequest(new ErrorResponse
                {
                    StatusCode = 400,
                    Message = "Page number must be greater than 0"
                });
            }

            if (pageSize < 1 || pageSize > 100)
            {
                return BadRequest(new ErrorResponse
                {
                    StatusCode = 400,
                    Message = "Page size must be between 1 and 100"
                });
            }

            // Retrieve filtered alumni directory
            var result = await _directoryService.GetAlumniDirectoryAsync(
                search, course, batch, page, pageSize);

            _logger.LogInformation($"Retrieved alumni directory page {page} with {result.Items.Count()} results");
            
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving alumni directory");
            return StatusCode(500, new ErrorResponse
            {
                StatusCode = 500,
                Message = "An error occurred while retrieving the alumni directory"
            });
        }
    }

    /// <summary>
    /// Gets detailed information for a specific alumnus.
    /// Returns comprehensive profile data including contact information.
    /// Used for the alumni detail page with quick action buttons.
    /// Validates that the user is an approved alumni member.
    /// </summary>
    /// <param name="userId">The unique identifier of the alumnus</param>
    /// <returns>Detailed alumni information including contact details</returns>
    /// <response code="200">Alumni detail retrieved successfully</response>
    /// <response code="401">User not authenticated</response>
    /// <response code="403">User is not an approved alumni member</response>
    /// <response code="404">Alumni not found</response>
    [HttpGet("{userId}")]
    [ProducesResponseType(typeof(AlumniDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetAlumniDetail([FromRoute] Guid userId)
    {
        try
        {
            // Retrieve detailed alumni information
            var alumniDetail = await _directoryService.GetAlumniDetailAsync(userId);
            
            _logger.LogInformation("Retrieved alumni detail for user {UserId}", userId);
            
            return Ok(alumniDetail);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Alumni not found: {UserId}", userId);
            return NotFound(new ErrorResponse
            {
                StatusCode = 404,
                Message = ex.Message
            });
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access to alumni: {UserId}", userId);
            return StatusCode(403, new ErrorResponse
            {
                StatusCode = 403,
                Message = ex.Message
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving alumni detail for {UserId}", userId);
            return StatusCode(500, new ErrorResponse
            {
                StatusCode = 500,
                Message = "An error occurred while retrieving the alumni details"
            });
        }
    }
}


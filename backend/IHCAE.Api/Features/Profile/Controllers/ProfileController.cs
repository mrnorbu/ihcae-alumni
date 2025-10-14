using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using IHCAE.Api.Features.Profile.Services;
using IHCAE.Api.Features.Profile.Models.DTOs;
using IHCAE.Api.Shared.Services;
using IHCAE.Api.Shared.DTOs;

namespace IHCAE.Api.Features.Profile.Controllers;

/// <summary>
/// Controller for managing user profile operations.
/// Provides endpoints for users to view and update their own profile information.
/// All endpoints require authentication and operate on the authenticated user's profile.
/// 
/// Features:
/// - View complete profile (personal info + alumni details)
/// - Update profile information (bio, job title, location, etc.)
/// - Upload profile images with validation
/// </summary>
[ApiController]
[Route("api/v1/profile")]
[Authorize] // All endpoints require authentication
public class ProfileController : ControllerBase
{
    private readonly IProfileService _profileService;
    private readonly IFileUploadService _fileUploadService;
    private readonly ILogger<ProfileController> _logger;

    /// <summary>
    /// Initializes the ProfileController with required services.
    /// </summary>
    /// <param name="profileService">Service for profile operations</param>
    /// <param name="fileUploadService">Service for file upload operations</param>
    /// <param name="logger">Logger for tracking controller operations</param>
    public ProfileController(
        IProfileService profileService,
        IFileUploadService fileUploadService,
        ILogger<ProfileController> logger)
    {
        _profileService = profileService;
        _fileUploadService = fileUploadService;
        _logger = logger;
    }

    /// <summary>
    /// Gets the authenticated user's complete profile information.
    /// Returns all profile data including personal information, alumni details, and profile image.
    /// Used by the frontend profile page to display user information.
    /// </summary>
    /// <returns>The user's complete profile data</returns>
    /// <response code="200">Profile retrieved successfully</response>
    /// <response code="401">User not authenticated</response>
    /// <response code="404">User profile not found</response>
    [HttpGet("me")]
    [ProducesResponseType(typeof(ProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetMyProfile()
    {
        try
        {
            // Extract user ID from JWT token claims
            var userId = GetCurrentUserId();
            
            // Retrieve user's complete profile data
            var profile = await _profileService.GetProfileAsync(userId);

            _logger.LogInformation("Retrieved profile for user {UserId}", userId);
            return Ok(profile);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Profile not found for authenticated user");
            return NotFound(new ErrorResponse
            {
                StatusCode = 404,
                Message = ex.Message
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving profile for authenticated user");
            return StatusCode(500, new ErrorResponse
            {
                StatusCode = 500,
                Message = "An error occurred while retrieving the profile"
            });
        }
    }

    /// <summary>
    /// Updates the authenticated user's profile information.
    /// Allows updating bio, job title, location, course, graduation year, and phone number.
    /// Only provided fields are updated; null fields are ignored.
    /// Creates AlumniProfile if it doesn't exist for the user.
    /// </summary>
    /// <param name="request">The profile update request containing new values</param>
    /// <returns>The updated profile data</returns>
    /// <response code="200">Profile updated successfully</response>
    /// <response code="400">Invalid request data</response>
    /// <response code="401">User not authenticated</response>
    /// <response code="404">User profile not found</response>
    [HttpPut("me")]
    [ProducesResponseType(typeof(UpdateProfileResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> UpdateMyProfile([FromBody] UpdateProfileRequest request)
    {
        try
        {
            // Validate request model using data annotations
            if (!ModelState.IsValid)
            {
                return BadRequest(new ErrorResponse
                {
                    StatusCode = 400,
                    Message = "Invalid profile data",
                    Errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .ToList()
                });
            }

            // Extract user ID from JWT token claims
            var userId = GetCurrentUserId();
            
            // Update user's profile with new data
            var updatedProfile = await _profileService.UpdateProfileAsync(userId, request);

            _logger.LogInformation("Updated profile for user {UserId}", userId);
            
            // Return success response with updated profile
            return Ok(new UpdateProfileResponse
            {
                Message = "Profile updated successfully",
                Profile = updatedProfile
            });
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Profile not found for authenticated user during update");
            return NotFound(new ErrorResponse
            {
                StatusCode = 404,
                Message = ex.Message
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating profile for authenticated user");
            return StatusCode(500, new ErrorResponse
            {
                StatusCode = 500,
                Message = "An error occurred while updating the profile"
            });
        }
    }

    /// <summary>
    /// Uploads a profile image for the authenticated user.
    /// Accepts image files (JPG, PNG, GIF, WebP) up to 5MB in size.
    /// Validates file type, size, and MIME type for security.
    /// Returns the URL to access the uploaded image.
    /// </summary>
    /// <param name="file">The image file to upload</param>
    /// <returns>The upload response with image URL</returns>
    /// <response code="200">Image uploaded successfully</response>
    /// <response code="400">Invalid file or file too large</response>
    /// <response code="401">User not authenticated</response>
    /// <response code="404">User profile not found</response>
    [HttpPost("me/image")]
    [ProducesResponseType(typeof(UploadProfileImageResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> UploadProfileImage([FromForm] IFormFile file)
    {
        try
        {
            // Check if file is provided and not empty
            if (file == null || file.Length == 0)
            {
                return BadRequest(new ErrorResponse
                {
                    StatusCode = 400,
                    Message = "Please provide a valid image file"
                });
            }

            // Validate image file (type, size, MIME type)
            _fileUploadService.ValidateImageFile(file, maxSizeInMb: 5);

            // Extract user ID from JWT token claims
            var userId = GetCurrentUserId();

            // Upload the file to storage
            var imageUrl = await _fileUploadService.UploadProfileImageAsync(file, userId);

            // Update user's profile with the new image URL
            await _profileService.UpdateProfileImageAsync(userId, imageUrl);

            _logger.LogInformation("Uploaded profile image for user {UserId}", userId);
            
            // Return success response with image URL
            return Ok(new UploadProfileImageResponse
            {
                Message = "Profile image uploaded successfully",
                ProfileImageUrl = imageUrl
            });
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid file upload attempt by user");
            return BadRequest(new ErrorResponse
            {
                StatusCode = 400,
                Message = ex.Message
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading profile image for authenticated user");
            return StatusCode(500, new ErrorResponse
            {
                StatusCode = 500,
                Message = "An error occurred while uploading the image"
            });
        }
    }

    /// <summary>
    /// Extracts the user ID from the JWT token claims.
    /// Used to identify the authenticated user for profile operations.
    /// </summary>
    /// <returns>The user ID from the token</returns>
    /// <exception cref="UnauthorizedAccessException">Thrown when user ID claim is not found or invalid</exception>
    private Guid GetCurrentUserId()
    {
        // Extract user ID from JWT token claims
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            throw new UnauthorizedAccessException("Invalid user ID in token");
        }

        return userId;
    }
}


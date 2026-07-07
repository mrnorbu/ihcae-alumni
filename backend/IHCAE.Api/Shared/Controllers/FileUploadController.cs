using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using IHCAE.Api.Shared.Services;
using IHCAE.Api.Shared.DTOs;

namespace IHCAE.Api.Shared.Controllers;

/// <summary>
/// Controller for handling file uploads
/// </summary>
[ApiController]
[Route("api/v1/upload")]
[Authorize]
public class FileUploadController : ControllerBase
{
    private readonly IFileUploadService _fileUploadService;
    private readonly ILogger<FileUploadController> _logger;

    public FileUploadController(IFileUploadService fileUploadService, ILogger<FileUploadController> logger)
    {
        _fileUploadService = fileUploadService;
        _logger = logger;
    }

    /// <summary>
    /// Upload a content image (news, event, success story)
    /// </summary>
    [HttpPost("content-image")]
    [ProducesResponseType(typeof(FileUploadResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UploadContentImage([FromForm] IFormFile file, [FromForm] string contentType = "news")
    {
        try
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new ErrorResponse { Message = "No file provided" });
            }

            // Validate content type
            var validContentTypes = new[] { "news", "event", "story" };
            if (!validContentTypes.Contains(contentType.ToLower()))
            {
                contentType = "news";
            }

            var imageUrl = await _fileUploadService.UploadContentImageAsync(file, contentType);
            var thumbnailUrl = _fileUploadService.GetThumbnailUrl(imageUrl);

            return Ok(new FileUploadResponse
            {
                ImageUrl = imageUrl,
                ThumbnailUrl = thumbnailUrl,
                Success = true,
                Message = "Image uploaded successfully"
            });
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid file upload attempt");
            return BadRequest(new ErrorResponse { Message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading content image");
            return StatusCode(500, new ErrorResponse { Message = "An error occurred while uploading the file" });
        }
    }

    /// <summary>
    /// Upload a profile image
    /// </summary>
    [HttpPost("profile-image")]
    [ProducesResponseType(typeof(FileUploadResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UploadProfileImage([FromForm] IFormFile file)
    {
        try
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new ErrorResponse { Message = "No file provided" });
            }

            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? throw new UnauthorizedAccessException());
            var imageUrl = await _fileUploadService.UploadProfileImageAsync(file, userId);

            return Ok(new FileUploadResponse
            {
                ImageUrl = imageUrl,
                ThumbnailUrl = imageUrl, // Profile images don't have separate thumbnails
                Success = true,
                Message = "Profile image uploaded successfully"
            });
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid file upload attempt");
            return BadRequest(new ErrorResponse { Message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading profile image");
            return StatusCode(500, new ErrorResponse { Message = "An error occurred while uploading the file" });
        }
    }
}

/// <summary>
/// Response DTO for file upload operations
/// </summary>
public class FileUploadResponse
{
    public string ImageUrl { get; set; } = string.Empty;
    public string ThumbnailUrl { get; set; } = string.Empty;
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
}

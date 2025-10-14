using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using IHCAE.Api.Features.Forums.Models.DTOs;
using IHCAE.Api.Features.Forums.Services;
using IHCAE.Api.Shared.DTOs;
using System.Security.Claims;

namespace IHCAE.Api.Features.Forums.Controllers;

/// <summary>
/// Controller for forum moderation operations.
/// All endpoints require Admin role.
/// </summary>
[ApiController]
[Route("api/v1/admin/forums")]
[Authorize(Roles = "Admin")]
public class ForumModerationController : ControllerBase
{
    private readonly IForumService _forumService;
    private readonly ILogger<ForumModerationController> _logger;

    public ForumModerationController(IForumService forumService, ILogger<ForumModerationController> logger)
    {
        _forumService = forumService;
        _logger = logger;
    }

    /// <summary>
    /// Deletes a topic (soft delete).
    /// </summary>
    [HttpDelete("topics/{topicId}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> DeleteTopic(Guid topicId)
    {
        try
        {
            var adminUserId = GetCurrentUserId();
            var deleted = await _forumService.DeleteTopicAsync(topicId, adminUserId);
            
            if (!deleted)
            {
                return NotFound(new ErrorResponse { Message = "Topic not found." });
            }

            _logger.LogInformation("Admin {AdminId} deleted topic {TopicId}", adminUserId, topicId);
            return Ok(new { Message = "Topic deleted successfully." });
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Topic {TopicId} not found", topicId);
            return NotFound(new ErrorResponse { Message = "Topic not found." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting topic {TopicId}", topicId);
            return StatusCode(500, new ErrorResponse { Message = "An error occurred while deleting the topic." });
        }
    }

    /// <summary>
    /// Pins or unpins a topic.
    /// </summary>
    [HttpPut("topics/{topicId}/pin")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> TogglePinTopic(Guid topicId)
    {
        try
        {
            var adminUserId = GetCurrentUserId();
            var isPinned = await _forumService.TogglePinTopicAsync(topicId, adminUserId);
            
            _logger.LogInformation("Admin {AdminId} {Action} topic {TopicId}", 
                adminUserId, isPinned ? "pinned" : "unpinned", topicId);
            
            return Ok(new { IsPinned = isPinned, Message = isPinned ? "Topic pinned successfully." : "Topic unpinned successfully." });
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Topic {TopicId} not found", topicId);
            return NotFound(new ErrorResponse { Message = "Topic not found." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error toggling pin for topic {TopicId}", topicId);
            return StatusCode(500, new ErrorResponse { Message = "An error occurred while updating the topic." });
        }
    }

    /// <summary>
    /// Locks or unlocks a topic.
    /// </summary>
    [HttpPut("topics/{topicId}/lock")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> ToggleLockTopic(Guid topicId)
    {
        try
        {
            var adminUserId = GetCurrentUserId();
            var isLocked = await _forumService.ToggleLockTopicAsync(topicId, adminUserId);
            
            _logger.LogInformation("Admin {AdminId} {Action} topic {TopicId}", 
                adminUserId, isLocked ? "locked" : "unlocked", topicId);
            
            return Ok(new { IsLocked = isLocked, Message = isLocked ? "Topic locked successfully." : "Topic unlocked successfully." });
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Topic {TopicId} not found", topicId);
            return NotFound(new ErrorResponse { Message = "Topic not found." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error toggling lock for topic {TopicId}", topicId);
            return StatusCode(500, new ErrorResponse { Message = "An error occurred while updating the topic." });
        }
    }

    /// <summary>
    /// Deletes a post (soft delete with admin audit trail).
    /// </summary>
    [HttpDelete("posts/{postId}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> DeletePost(Guid postId, [FromBody] DeletePostRequest? request = null)
    {
        try
        {
            var adminUserId = GetCurrentUserId();
            var reason = request?.Reason ?? "Deleted by administrator";
            
            var deleted = await _forumService.DeletePostAsAdminAsync(postId, adminUserId, reason);
            
            if (!deleted)
            {
                return NotFound(new ErrorResponse { Message = "Post not found." });
            }

            _logger.LogInformation("Admin {AdminId} deleted post {PostId} with reason: {Reason}", 
                adminUserId, postId, reason);
            
            return Ok(new { Message = "Post deleted successfully." });
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Post {PostId} not found", postId);
            return NotFound(new ErrorResponse { Message = "Post not found." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting post {PostId}", postId);
            return StatusCode(500, new ErrorResponse { Message = "An error occurred while deleting the post." });
        }
    }

    /// <summary>
    /// Updates a post content (admin moderation).
    /// </summary>
    [HttpPut("posts/{postId}")]
    [ProducesResponseType(typeof(PostDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> UpdatePost(Guid postId, [FromBody] UpdatePostRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new ErrorResponse { Message = "Invalid request data." });
            }

            var adminUserId = GetCurrentUserId();
            var updatedPost = await _forumService.UpdatePostAsync(postId, request.Content, adminUserId);
            
            _logger.LogInformation("Admin {AdminId} updated post {PostId}", adminUserId, postId);
            
            return Ok(updatedPost);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Post {PostId} not found", postId);
            return NotFound(new ErrorResponse { Message = "Post not found." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating post {PostId}", postId);
            return StatusCode(500, new ErrorResponse { Message = "An error occurred while updating the post." });
        }
    }

    /// <summary>
    /// Gets the current user ID from the JWT token.
    /// </summary>
    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            throw new UnauthorizedAccessException("Invalid user token.");
        }
        return userId;
    }
}

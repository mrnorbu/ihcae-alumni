using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using IHCAE.Api.Features.Forums.Models.DTOs;
using IHCAE.Api.Features.Forums.Models.Entities;
using IHCAE.Api.Features.Forums.Services;
using IHCAE.Api.Shared.Data;
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
    private readonly AppDbContext _context;
    private readonly ILogger<ForumModerationController> _logger;

    public ForumModerationController(IForumService forumService, AppDbContext context, ILogger<ForumModerationController> logger)
    {
        _forumService = forumService;
        _context = context;
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

    // ===================== Flagged Content =====================

    /// <summary>
    /// Gets all flagged posts with optional status filtering.
    /// </summary>
    [HttpGet("flags")]
    [ProducesResponseType(typeof(PaginatedResult<ForumFlagDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetFlags(
        [FromQuery] string? status = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        try
        {
            var query = _context.ForumFlags
                .Include(f => f.Post)
                    .ThenInclude(p => p.Author)
                .Include(f => f.Post)
                    .ThenInclude(p => p.Topic)
                .Include(f => f.FlaggedBy)
                .Include(f => f.ResolvedBy)
                .AsQueryable();

            if (!string.IsNullOrEmpty(status) && Enum.TryParse<FlagStatus>(status, true, out var flagStatus))
            {
                query = query.Where(f => f.Status == flagStatus);
            }

            var totalCount = await query.CountAsync();

            var flags = await query
                .OrderByDescending(f => f.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(f => new ForumFlagDto
                {
                    Id = f.Id,
                    PostId = f.PostId,
                    PostContent = f.Post.Content,
                    TopicTitle = f.Post.Topic.Title,
                    TopicId = f.Post.TopicId,
                    PostAuthorName = f.Post.Author.FirstName + " " + f.Post.Author.LastName,
                    PostAuthorId = f.Post.AuthorId,
                    FlaggedByName = f.FlaggedBy.FirstName + " " + f.FlaggedBy.LastName,
                    FlaggedById = f.FlaggedById,
                    Reason = f.Reason,
                    Details = f.Details,
                    Status = f.Status.ToString(),
                    ResolvedByName = f.ResolvedBy != null ? f.ResolvedBy.FirstName + " " + f.ResolvedBy.LastName : null,
                    ResolutionNotes = f.ResolutionNotes,
                    CreatedAt = f.CreatedAt,
                    ResolvedAt = f.ResolvedAt
                })
                .ToListAsync();

            return Ok(new PaginatedResult<ForumFlagDto>
            {
                Items = flags,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving flags");
            return StatusCode(500, new ErrorResponse { Message = "An error occurred while retrieving flags." });
        }
    }

    /// <summary>
    /// Restores a post (reverses soft delete).
    /// </summary>
    [HttpPut("posts/{postId}/restore")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> RestorePost(Guid postId)
    {
        try
        {
            var adminUserId = GetCurrentUserId();
            var restored = await _forumService.RestorePostAsync(postId, adminUserId);
            
            if (!restored)
            {
                return NotFound(new ErrorResponse { Message = "Post not found." });
            }

            _logger.LogInformation("Admin {AdminId} restored post {PostId}", adminUserId, postId);
            return Ok(new { Message = "Post restored successfully." });
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Post {PostId} not found", postId);
            return NotFound(new ErrorResponse { Message = "Post not found." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error restoring post {PostId}", postId);
            return StatusCode(500, new ErrorResponse { Message = "An error occurred while restoring the post." });
        }
    }

    /// <summary>
    /// Resolves a flag (dismiss, take action, or reset to pending).
    /// </summary>
    [HttpPut("flags/{flagId}/resolve")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ResolveFlag(Guid flagId, [FromBody] ResolveFlagRequest request)
    {
        try
        {
            var adminUserId = GetCurrentUserId();

            var flag = await _context.ForumFlags.FindAsync(flagId);
            if (flag == null)
                return NotFound(new ErrorResponse { Message = "Flag not found." });

            if (!Enum.TryParse<FlagStatus>(request.Status, true, out var newStatus) ||
                (newStatus != FlagStatus.Dismissed && newStatus != FlagStatus.ActionTaken && newStatus != FlagStatus.Reviewed && newStatus != FlagStatus.Pending))
            {
                return BadRequest(new ErrorResponse { Message = "Invalid status. Use 'Dismissed', 'Reviewed', 'ActionTaken', or 'Pending'." });
            }

            flag.Status = newStatus;
            flag.ResolvedById = newStatus == FlagStatus.Pending ? null : adminUserId;
            flag.ResolutionNotes = request.Notes;
            flag.ResolvedAt = newStatus == FlagStatus.Pending ? null : DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Admin {AdminId} resolved flag {FlagId} with status {Status}", adminUserId, flagId, newStatus);
            return Ok(new { Message = $"Flag resolved as {newStatus}." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error resolving flag {FlagId}", flagId);
            return StatusCode(500, new ErrorResponse { Message = "An error occurred while resolving the flag." });
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

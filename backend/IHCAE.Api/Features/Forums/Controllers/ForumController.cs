using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using IHCAE.Api.Features.Forums.Models.DTOs;
using IHCAE.Api.Features.Forums.Services;
using IHCAE.Api.Shared.DTOs;
using IHCAE.Api.Shared.Services;
using System.Security.Claims;

namespace IHCAE.Api.Features.Forums.Controllers;

/// <summary>
/// Controller for forum operations.
/// Handles topics, posts, and likes for authenticated users.
/// </summary>
[ApiController]
[Route("api/v1/forums")]
[Authorize]
public class ForumController : ControllerBase
{
    private readonly IForumService _forumService;
    private readonly ITagService _tagService;
    private readonly ILogger<ForumController> _logger;

    public ForumController(IForumService forumService, ITagService tagService, ILogger<ForumController> logger)
    {
        _forumService = forumService;
        _tagService = tagService;
        _logger = logger;
    }

    /// <summary>
    /// Gets a paginated list of discussion topics.
    /// </summary>
    [HttpGet("topics")]
    [ProducesResponseType(typeof(PaginatedResult<TopicSummaryDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetTopics(
        [FromQuery] int page = 1, 
        [FromQuery] int pageSize = 20, 
        [FromQuery] string? tags = null,
        [FromQuery] string? search = null,
        [FromQuery] Guid? authorId = null,
        [FromQuery] string sortBy = "recent")
    {
        try
        {
            var userId = GetCurrentUserId();
            var tagList = string.IsNullOrWhiteSpace(tags) 
                ? null 
                : tags.Split(',').Select(t => t.Trim()).Where(t => !string.IsNullOrEmpty(t)).ToList();
            
            var result = await _forumService.GetTopicsAsync(userId, page, pageSize, tagList, search, authorId, sortBy);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving topics");
            return StatusCode(500, new ErrorResponse { Message = "An error occurred while retrieving topics." });
        }
    }

    /// <summary>
    /// Gets a single topic with all its posts.
    /// </summary>
    [HttpGet("topics/{topicId}")]
    [ProducesResponseType(typeof(TopicDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetTopicById(Guid topicId)
    {
        try
        {
            var userId = GetCurrentUserId();
            var topic = await _forumService.GetTopicByIdAsync(topicId, userId);
            return Ok(topic);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Topic {TopicId} not found", topicId);
            return NotFound(new ErrorResponse { Message = "Topic not found." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving topic {TopicId}", topicId);
            return StatusCode(500, new ErrorResponse { Message = "An error occurred while retrieving the topic." });
        }
    }

    /// <summary>
    /// Creates a new discussion topic.
    /// </summary>
    [HttpPost("topics")]
    [ProducesResponseType(typeof(TopicDetailDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> CreateTopic([FromBody] CreateTopicRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new ErrorResponse { Message = "Invalid request data." });
            }

            var userId = GetCurrentUserId();
            var topic = await _forumService.CreateTopicAsync(userId, request.Title, request.Content, request.Tags);
            return CreatedAtAction(nameof(GetTopicById), new { topicId = topic.Id }, topic);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating topic");
            return StatusCode(500, new ErrorResponse { Message = "An error occurred while creating the topic." });
        }
    }

    /// <summary>
    /// Creates a new post or reply in a topic.
    /// </summary>
    [HttpPost("topics/{topicId}/posts")]
    [ProducesResponseType(typeof(PostDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> CreatePost(Guid topicId, [FromBody] CreatePostRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new ErrorResponse { Message = "Invalid request data." });
            }

            var userId = GetCurrentUserId();
            var post = await _forumService.CreatePostAsync(topicId, userId, request.Content, request.ParentPostId);
            return CreatedAtAction(nameof(GetTopicById), new { topicId }, post);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Topic {TopicId} not found", topicId);
            return NotFound(new ErrorResponse { Message = "Topic not found." });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Cannot post to topic {TopicId}", topicId);
            return BadRequest(new ErrorResponse { Message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating post in topic {TopicId}", topicId);
            return StatusCode(500, new ErrorResponse { Message = "An error occurred while creating the post." });
        }
    }

    /// <summary>
    /// Likes a post.
    /// </summary>
    [HttpPost("posts/{postId}/like")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> LikePost(Guid postId)
    {
        try
        {
            var userId = GetCurrentUserId();
            var liked = await _forumService.LikePostAsync(postId, userId);
            return Ok(new { Liked = liked });
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Post {PostId} not found", postId);
            return NotFound(new ErrorResponse { Message = "Post not found." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error liking post {PostId}", postId);
            return StatusCode(500, new ErrorResponse { Message = "An error occurred while liking the post." });
        }
    }

    /// <summary>
    /// Unlikes a post.
    /// </summary>
    [HttpDelete("posts/{postId}/like")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> UnlikePost(Guid postId)
    {
        try
        {
            var userId = GetCurrentUserId();
            var unliked = await _forumService.UnlikePostAsync(postId, userId);
            return Ok(new { Unliked = unliked });
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Post {PostId} not found", postId);
            return NotFound(new ErrorResponse { Message = "Post not found." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error unliking post {PostId}", postId);
            return StatusCode(500, new ErrorResponse { Message = "An error occurred while unliking the post." });
        }
    }

    /// <summary>
    /// Deletes a post (user can only delete their own posts).
    /// </summary>
    [HttpDelete("posts/{postId}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> DeletePost(Guid postId)
    {
        try
        {
            var userId = GetCurrentUserId();
            var deleted = await _forumService.DeleteOwnPostAsync(postId, userId);
            return Ok(new { Deleted = deleted });
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Post {PostId} not found", postId);
            return NotFound(new ErrorResponse { Message = "Post not found." });
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "User {UserId} attempted to delete post {PostId}", GetCurrentUserId(), postId);
            return StatusCode(403, new ErrorResponse { Message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting post {PostId}", postId);
            return StatusCode(500, new ErrorResponse { Message = "An error occurred while deleting the post." });
        }
    }

    /// <summary>
    /// Searches for tags by name (autocomplete).
    /// </summary>
    [HttpGet("tags/search")]
    [ProducesResponseType(typeof(List<TagDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> SearchTags([FromQuery] string q, [FromQuery] int limit = 10)
    {
        try
        {
            var tags = await _tagService.SearchTagsAsync(q, limit);
            return Ok(tags);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching tags");
            return StatusCode(500, new ErrorResponse { Message = "An error occurred while searching tags." });
        }
    }

    /// <summary>
    /// Gets the most popular tags.
    /// </summary>
    [HttpGet("tags/popular")]
    [ProducesResponseType(typeof(List<TagDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetPopularTags([FromQuery] int limit = 20)
    {
        try
        {
            var tags = await _tagService.GetPopularTagsAsync(limit);
            return Ok(tags);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving popular tags");
            return StatusCode(500, new ErrorResponse { Message = "An error occurred while retrieving popular tags." });
        }
    }

    /// <summary>
    /// Gets top users by engagement (likes received).
    /// </summary>
    [HttpGet("top-users")]
    [ProducesResponseType(typeof(List<TopUserDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetTopUsers([FromQuery] int limit = 5)
    {
        try
        {
            var topUsers = await _forumService.GetTopUsersAsync(limit);
            return Ok(topUsers);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving top users");
            return StatusCode(500, new ErrorResponse { Message = "An error occurred while retrieving top users." });
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
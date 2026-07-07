using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using IHCAE.Api.Features.Forums.Models.DTOs;
using IHCAE.Api.Features.Forums.Models.Entities;
using IHCAE.Api.Features.Forums.Services;
using IHCAE.Api.Shared.Data;
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
    private readonly AppDbContext _context;
    private readonly ILogger<ForumController> _logger;

    public ForumController(IForumService forumService, ITagService tagService, AppDbContext context, ILogger<ForumController> logger)
    {
        _forumService = forumService;
        _tagService = tagService;
        _context = context;
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
        [FromQuery] int? authorId = null,
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
    public async Task<IActionResult> GetTopicById(int topicId)
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
    public async Task<IActionResult> CreatePost(int topicId, [FromBody] CreatePostRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new ErrorResponse { Message = "Invalid request data." });
            }

            var userId = GetCurrentUserId();
            var post = await _forumService.CreatePostAsync(topicId, userId, request.Content, request.ParentPostId, request.MentionedUserIds);
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
    public async Task<IActionResult> LikePost(int postId)
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
    public async Task<IActionResult> UnlikePost(int postId)
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
    public async Task<IActionResult> DeletePost(int postId)
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
    /// Flags a forum post for admin review.
    /// </summary>
    [HttpPost("posts/{postId}/flag")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> FlagPost(int postId, [FromBody] FlagPostRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();

            var postExists = await _context.ForumPosts.AnyAsync(p => p.Id == postId && !p.IsDeleted);
            if (!postExists)
                return NotFound(new ErrorResponse { Message = "Post not found." });

            var alreadyFlagged = await _context.ForumFlags
                .AnyAsync(f => f.PostId == postId && f.FlaggedById == userId);
            if (alreadyFlagged)
                return Conflict(new ErrorResponse { Message = "You have already flagged this post." });

            var flag = new ForumFlag
            {
                PostId = postId,
                FlaggedById = userId,
                Reason = request.Reason,
                Details = request.Details,
                Status = FlagStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            _context.ForumFlags.Add(flag);
            await _context.SaveChangesAsync();

            _logger.LogInformation("User {UserId} flagged post {PostId} for reason: {Reason}", userId, postId, request.Reason);
            return Ok(new { Message = "Post flagged for review." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error flagging post {PostId}", postId);
            return StatusCode(500, new ErrorResponse { Message = "An error occurred while flagging the post." });
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
    /// Searches for users by name for mentions.
    /// </summary>
    [HttpGet("users/search")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> SearchUsers([FromQuery] string q, [FromQuery] int limit = 5)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(q)) return Ok(new List<object>());
            var query = q.ToLower();
            var users = await _context.Users
                .Where(u => u.Status == IHCAE.Api.Features.Auth.Models.Entities.UserStatus.Approved && !u.IsBanned)
                .Where(u => u.FirstName.ToLower().Contains(query) || u.LastName.ToLower().Contains(query))
                .Take(limit)
                .Select(u => new { u.Id, u.FirstName, u.LastName })
                .ToListAsync();
            return Ok(users);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching users");
            return StatusCode(500, new ErrorResponse { Message = "An error occurred while searching users." });
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
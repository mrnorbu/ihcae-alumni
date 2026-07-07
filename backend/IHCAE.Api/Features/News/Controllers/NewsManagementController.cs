using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using IHCAE.Api.Features.News.Services;
using IHCAE.Api.Features.News.Models.DTOs;
using IHCAE.Api.Shared.DTOs;

namespace IHCAE.Api.Features.News.Controllers;

/// <summary>
/// Controller for news article management (Admin and Content Creator)
/// </summary>
[ApiController]
[Route("api/v1/news/management")]
[Authorize]
public class NewsManagementController : ControllerBase
{
    private readonly INewsService _newsService;
    private readonly ILogger<NewsManagementController> _logger;

    public NewsManagementController(INewsService newsService, ILogger<NewsManagementController> logger)
    {
        _newsService = newsService;
        _logger = logger;
    }

    /// <summary>
    /// Create a new news article (Admin/ContentCreator)
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin,ContentCreator")]
    [ProducesResponseType(typeof(NewsArticleDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateArticle([FromBody] CreateNewsArticleRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new ErrorResponse { Message = "Invalid request data" });
            }

            var userId = GetCurrentUserId();
            var isAdmin = User.IsInRole("Admin") || User.IsInRole("ContentCreator");

            var article = await _newsService.CreateArticleAsync(userId, request, isAdmin);
            return CreatedAtRoute("GetArticleBySlug", new { slug = article.Slug }, article);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid argument when creating article");
            return BadRequest(new ErrorResponse { Message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating article");
            throw;
        }
    }

    /// <summary>
    /// Update an existing news article (Admin/ContentCreator/Alumni - own articles only)
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,ContentCreator,Alumni")]
    [ProducesResponseType(typeof(NewsArticleDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateArticle(int id, [FromBody] UpdateNewsArticleRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new ErrorResponse { Message = "Invalid request data" });
            }

            var userId = GetCurrentUserId();
            var isAdmin = User.IsInRole("Admin") || User.IsInRole("ContentCreator");

            var article = await _newsService.UpdateArticleAsync(id, userId, request, isAdmin);
            return Ok(article);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Article {ArticleId} not found", id);
            return NotFound(new ErrorResponse { Message = "Article not found" });
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access attempt for article {ArticleId}", id);
            return StatusCode(403, new ErrorResponse { Message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid argument when updating article {ArticleId}", id);
            return BadRequest(new ErrorResponse { Message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating article {ArticleId}", id);
            throw;
        }
    }

    /// <summary>
    /// Delete a news article (Admin/ContentCreator/Alumni - own articles only)
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,ContentCreator,Alumni")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteArticle(int id)
    {
        try
        {
            var userId = GetCurrentUserId();
            var isAdmin = User.IsInRole("Admin") || User.IsInRole("ContentCreator");

            var deleted = await _newsService.DeleteArticleAsync(id, userId, isAdmin);
            if (!deleted)
            {
                return NotFound(new ErrorResponse { Message = "Article not found" });
            }

            return Ok(new { Message = "Article deleted successfully" });
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized delete attempt for article {ArticleId}", id);
            return StatusCode(403, new ErrorResponse { Message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting article {ArticleId}", id);
            throw;
        }
    }

    /// <summary>
    /// Get articles for management (Admin sees all, ContentCreator/Alumni sees own)
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "Admin,ContentCreator")]
    [ProducesResponseType(typeof(List<NewsArticleSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetManagementArticles()
    {
        try
        {
            var userId = GetCurrentUserId();
            var isAdmin = User.IsInRole("Admin") || User.IsInRole("ContentCreator");
            var articles = await _newsService.GetManagementArticlesAsync(userId, isAdmin);
            return Ok(articles);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving management articles");
            throw;
        }
    }

    /// <summary>
    /// Get articles created by the current user (Alumni, ContentCreator, Admin)
    /// </summary>
    [HttpGet("my-articles")]
    [ProducesResponseType(typeof(List<NewsArticleSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyArticles()
    {
        try
        {
            var userId = GetCurrentUserId();
            var articles = await _newsService.GetMyArticlesAsync(userId);
            return Ok(articles);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving my articles");
            throw;
        }
    }

    /// <summary>
    /// Get pending articles for admin review
    /// </summary>
    [HttpGet("pending")]
    [Authorize(Roles = "Admin,ContentCreator")]
    [ProducesResponseType(typeof(PaginatedResult<NewsArticleSummaryDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetPendingArticles(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        try
        {
            var result = await _newsService.GetPendingArticlesAsync(page, pageSize);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving pending articles");
            throw;
        }
    }

    /// <summary>
    /// Approve a pending article (Admin only)
    /// </summary>
    [HttpPost("{id}/approve")]
    [Authorize(Roles = "Admin,ContentCreator")]
    [ProducesResponseType(typeof(NewsArticleDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ApproveArticle(int id)
    {
        try
        {
            var adminId = GetCurrentUserId();
            var article = await _newsService.ApproveArticleAsync(id, adminId);
            return Ok(article);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Article {ArticleId} not found", id);
            return NotFound(new ErrorResponse { Message = "Article not found" });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid operation when approving article {ArticleId}", id);
            return BadRequest(new ErrorResponse { Message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error approving article {ArticleId}", id);
            throw;
        }
    }

    /// <summary>
    /// Reject a pending article (Admin only)
    /// </summary>
    [HttpPost("{id}/reject")]
    [Authorize(Roles = "Admin,ContentCreator")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RejectArticle(int id, [FromBody] RejectContentRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Reason))
            {
                return BadRequest(new ErrorResponse { Message = "Rejection reason is required" });
            }

            var adminId = GetCurrentUserId();
            var rejected = await _newsService.RejectArticleAsync(id, adminId, request.Reason);
            
            if (!rejected)
            {
                return NotFound(new ErrorResponse { Message = "Article not found" });
            }

            return Ok(new { Message = "Article rejected successfully" });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid operation when rejecting article {ArticleId}", id);
            return BadRequest(new ErrorResponse { Message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error rejecting article {ArticleId}", id);
            throw;
        }
    }

    /// <summary>
    /// Submit content for admin review (Alumni only)
    /// </summary>
    [HttpPost("submit")]
    [Authorize(Roles = "Alumni,Admin")]
    [ProducesResponseType(typeof(NewsArticleDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> SubmitContent([FromBody] SubmitContentRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new ErrorResponse { Message = "Invalid request data" });
            }

            var alumniId = GetCurrentUserId();
            var article = await _newsService.SubmitContentAsync(alumniId, request);
            return CreatedAtRoute("GetArticleBySlug", new { slug = article.Slug }, article);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid arguments when submitting content");
            return BadRequest(new ErrorResponse { Message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid operation when submitting content");
            return BadRequest(new ErrorResponse { Message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error submitting content");
            throw;
        }
    }

    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
        {
            throw new UnauthorizedAccessException("Invalid user token");
        }
        return userId;
    }
}

/// <summary>
/// Request DTO for rejecting content
/// </summary>
public class RejectContentRequest
{
    public string Reason { get; set; } = string.Empty;
}

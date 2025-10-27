using Microsoft.AspNetCore.Mvc;
using IHCAE.Api.Features.News.Services;
using IHCAE.Api.Features.News.Models.DTOs;
using IHCAE.Api.Shared.DTOs;

namespace IHCAE.Api.Features.News.Controllers;

/// <summary>
/// Public controller for news article viewing
/// </summary>
[ApiController]
[Route("api/v1/news")]
public class NewsController : ControllerBase
{
    private readonly INewsService _newsService;
    private readonly ILogger<NewsController> _logger;

    public NewsController(INewsService newsService, ILogger<NewsController> logger)
    {
        _newsService = newsService;
        _logger = logger;
    }

    /// <summary>
    /// Get published news articles with pagination and filtering
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PaginatedResult<NewsArticleSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPublishedArticles(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] Guid? categoryId = null,
        [FromQuery] string? search = null)
    {
        try
        {
            var result = await _newsService.GetPublishedArticlesAsync(page, pageSize, categoryId, search);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving published articles");
            throw;
        }
    }

    /// <summary>
    /// Get a single published news article by ID
    /// </summary>
    [HttpGet("{id}", Name = "GetArticleById")]
    [ProducesResponseType(typeof(NewsArticleDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetArticleById(Guid id)
    {
        try
        {
            var article = await _newsService.GetArticleByIdAsync(id);
            return Ok(article);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Article {ArticleId} not found", id);
            return NotFound(new ErrorResponse { Message = "Article not found" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving article {ArticleId}", id);
            throw;
        }
    }

    /// <summary>
    /// Get published success stories
    /// </summary>
    [HttpGet("success-stories")]
    [ProducesResponseType(typeof(PaginatedResult<NewsArticleSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSuccessStories(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        try
        {
            var result = await _newsService.GetSuccessStoriesAsync(page, pageSize);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving success stories");
            throw;
        }
    }

    /// <summary>
    /// Get all news categories
    /// </summary>
    [HttpGet("categories")]
    [ProducesResponseType(typeof(List<NewsCategoryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCategories()
    {
        try
        {
            var categories = await _newsService.GetCategoriesAsync();
            return Ok(categories);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving news categories");
            throw;
        }
    }
}

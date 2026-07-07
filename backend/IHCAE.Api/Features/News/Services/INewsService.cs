using IHCAE.Api.Features.News.Models.DTOs;
using IHCAE.Api.Shared.DTOs;

namespace IHCAE.Api.Features.News.Services;

/// <summary>
/// Service interface for news article operations
/// </summary>
public interface INewsService
{
    // Public viewing
    Task<PaginatedResult<NewsArticleSummaryDto>> GetPublishedArticlesAsync(
        int page, int pageSize, int? categoryId = null, string? search = null);
    
    Task<NewsArticleDto> GetArticleBySlugAsync(string slug, int? currentUserId = null, bool isAdmin = false);
    Task<NewsArticleDto> GetArticleByIdAsync(int id, int? currentUserId = null, bool isAdmin = false);
    
    Task<PaginatedResult<NewsArticleSummaryDto>> GetSuccessStoriesAsync(int page, int pageSize);
    
    // Content creation (Admin/Content Creator)
    Task<NewsArticleDto> CreateArticleAsync(int authorId, CreateNewsArticleRequest request, bool isAdmin);
    
    Task<NewsArticleDto> UpdateArticleAsync(int id, int userId, UpdateNewsArticleRequest request, bool isAdmin);
    
    Task<bool> DeleteArticleAsync(int id, int userId, bool isAdmin);
    
    // Admin operations
    Task<PaginatedResult<NewsArticleSummaryDto>> GetPendingArticlesAsync(int page, int pageSize);
    
    Task<NewsArticleDto> ApproveArticleAsync(int id, int adminId);
    
    Task<bool> RejectArticleAsync(int id, int adminId, string reason);
    
    // Content submission (Alumni)
    Task<NewsArticleDto> SubmitContentAsync(int alumniId, SubmitContentRequest request);
    
    // User own articles
    Task<List<NewsArticleSummaryDto>> GetMyArticlesAsync(int userId);
    Task<List<NewsArticleSummaryDto>> GetManagementArticlesAsync(int userId, bool isAdmin);
    
    // Categories
    Task<List<NewsCategoryDto>> GetCategoriesAsync();
}

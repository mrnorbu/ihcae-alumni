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
        int page, int pageSize, Guid? categoryId = null, string? search = null);
    
    Task<NewsArticleDto> GetArticleByIdAsync(Guid id, Guid? currentUserId = null, bool isAdmin = false);
    
    Task<PaginatedResult<NewsArticleSummaryDto>> GetSuccessStoriesAsync(int page, int pageSize);
    
    // Content creation (Admin/Content Creator)
    Task<NewsArticleDto> CreateArticleAsync(Guid authorId, CreateNewsArticleRequest request, bool isAdmin);
    
    Task<NewsArticleDto> UpdateArticleAsync(Guid id, Guid userId, UpdateNewsArticleRequest request, bool isAdmin);
    
    Task<bool> DeleteArticleAsync(Guid id, Guid userId, bool isAdmin);
    
    // Admin operations
    Task<PaginatedResult<NewsArticleSummaryDto>> GetPendingArticlesAsync(int page, int pageSize);
    
    Task<NewsArticleDto> ApproveArticleAsync(Guid id, Guid adminId);
    
    Task<bool> RejectArticleAsync(Guid id, Guid adminId, string reason);
    
    // Content submission (Alumni)
    Task<NewsArticleDto> SubmitContentAsync(Guid alumniId, SubmitContentRequest request);
    
    // User own articles
    Task<List<NewsArticleSummaryDto>> GetMyArticlesAsync(Guid userId);
    Task<List<NewsArticleSummaryDto>> GetManagementArticlesAsync(Guid userId, bool isAdmin);
    
    // Categories
    Task<List<NewsCategoryDto>> GetCategoriesAsync();
}

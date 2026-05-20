using Microsoft.EntityFrameworkCore;
using IHCAE.Api.Features.News.Models.Entities;
using IHCAE.Api.Features.News.Models.DTOs;
using IHCAE.Api.Shared.Data;
using IHCAE.Api.Shared.DTOs;
using IHCAE.Api.Shared.Services;
using AuthorDto = IHCAE.Api.Shared.DTOs.AuthorDto;

namespace IHCAE.Api.Features.News.Services;

/// <summary>
/// Service implementation for news article operations
/// </summary>
public class NewsService : INewsService
{
    private readonly AppDbContext _context;
    private readonly ILogger<NewsService> _logger;
    private readonly IEmailService _emailService;
    private readonly IUrlHelperService _urlHelperService;

    public NewsService(AppDbContext context, ILogger<NewsService> logger, IEmailService emailService, IUrlHelperService urlHelperService)
    {
        _context = context;
        _logger = logger;
        _emailService = emailService;
        _urlHelperService = urlHelperService;
    }

    public async Task<PaginatedResult<NewsArticleSummaryDto>> GetPublishedArticlesAsync(
        int page, int pageSize, Guid? categoryId = null, string? search = null)
    {
        if (page < 1) page = 1;
        if (pageSize < 1 || pageSize > 50) pageSize = 10;

        var query = _context.NewsArticles
            .Include(a => a.Category)
            .Include(a => a.Author)
                .ThenInclude(u => u.AlumniProfile)
            .Where(a => a.Status == ContentStatus.Published)
            .AsQueryable();

        // Filter by category
        if (categoryId.HasValue)
        {
            query = query.Where(a => a.CategoryId == categoryId.Value);
        }

        // Filter by search term
        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.ToLower();
            query = query.Where(a => 
                a.Title.ToLower().Contains(searchLower) || 
                (a.Content != null && a.Content.ToLower().Contains(searchLower)));
        }

        var totalCount = await query.CountAsync();

        var articles = await query
            .OrderByDescending(a => a.PublishedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var articleDtos = articles.Select(a => new NewsArticleSummaryDto
        {
            Id = a.Id,
            Title = a.Title,
            Excerpt = a.Excerpt,
            Category = new NewsCategoryDto
            {
                Id = a.Category.Id,
                Name = a.Category.Name,
                Slug = a.Category.Slug,
                Description = a.Category.Description
            },
            Author = new AuthorDto
            {
                Id = a.Author.Id,
                FirstName = a.Author.FirstName,
                LastName = a.Author.LastName,
                ProfileImageUrl = _urlHelperService.GetAbsoluteUrl(a.Author.AlumniProfile?.ProfileImageUrl)
            },
            ThumbnailUrl = _urlHelperService.GetAbsoluteUrl(a.ThumbnailUrl),
            Status = a.Status,
            PublishedAt = a.PublishedAt,
            CreatedAt = a.CreatedAt,
            ViewCount = a.ViewCount
        }).ToList();

        return new PaginatedResult<NewsArticleSummaryDto>
        {
            Items = articleDtos,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<NewsArticleDto> GetArticleByIdAsync(Guid id)
    {
        var article = await _context.NewsArticles
            .Include(a => a.Category)
            .Include(a => a.Author)
                .ThenInclude(u => u.AlumniProfile)
            .FirstOrDefaultAsync(a => a.Id == id && a.Status == ContentStatus.Published);

        if (article == null)
        {
            throw new KeyNotFoundException($"Article with ID {id} not found");
        }

        // Increment view count
        article.ViewCount++;
        await _context.SaveChangesAsync();

        return MapToDto(article);
    }

    public async Task<PaginatedResult<NewsArticleSummaryDto>> GetSuccessStoriesAsync(int page, int pageSize)
    {
        if (page < 1) page = 1;
        if (pageSize < 1 || pageSize > 50) pageSize = 10;

        // Get the Success Story category
        var successStoryCategory = await _context.NewsCategories
            .FirstOrDefaultAsync(c => c.Slug == "success-story");

        if (successStoryCategory == null)
        {
            return new PaginatedResult<NewsArticleSummaryDto>
            {
                Items = new List<NewsArticleSummaryDto>(),
                TotalCount = 0,
                Page = page,
                PageSize = pageSize
            };
        }

        return await GetPublishedArticlesAsync(page, pageSize, successStoryCategory.Id);
    }

    public async Task<NewsArticleDto> CreateArticleAsync(Guid authorId, CreateNewsArticleRequest request, bool isAdmin)
    {
        // Verify category exists
        var categoryExists = await _context.NewsCategories.AnyAsync(c => c.Id == request.CategoryId);
        if (!categoryExists)
        {
            throw new ArgumentException("Invalid category ID");
        }

        var article = new NewsArticle
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Content = request.Content,
            Excerpt = request.Content.Length > 200 ? request.Content.Substring(0, 200) + "..." : request.Content,
            CategoryId = request.CategoryId,
            AuthorId = authorId,
            ImageUrl = request.ImageUrl,
            ThumbnailUrl = request.ThumbnailUrl,
            Status = isAdmin && request.Publish ? ContentStatus.Published : 
                     isAdmin ? ContentStatus.Draft : ContentStatus.PendingReview,
            PublishedAt = isAdmin && request.Publish ? DateTime.UtcNow : null,
            CreatedAt = DateTime.UtcNow,
            ViewCount = 0
        };

        _context.NewsArticles.Add(article);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Article {ArticleId} created by user {UserId} with status {Status}", 
            article.Id, authorId, article.Status);

        // Send notification if pending review
        if (article.Status == ContentStatus.PendingReview)
        {
            await SendContentSubmittedNotificationAsync(article.Id);
        }

        return await GetArticleByIdForManagement(article.Id);
    }

    public async Task<NewsArticleDto> UpdateArticleAsync(Guid id, Guid userId, UpdateNewsArticleRequest request, bool isAdmin)
    {
        var article = await _context.NewsArticles
            .Include(a => a.Category)
            .Include(a => a.Author)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (article == null)
        {
            throw new KeyNotFoundException($"Article with ID {id} not found");
        }

        // Check ownership (non-admins can only edit their own articles)
        if (!isAdmin && article.AuthorId != userId)
        {
            throw new UnauthorizedAccessException("You can only edit your own articles");
        }

        // Verify category exists
        var categoryExists = await _context.NewsCategories.AnyAsync(c => c.Id == request.CategoryId);
        if (!categoryExists)
        {
            throw new ArgumentException("Invalid category ID");
        }

        article.Title = request.Title;
        article.Content = request.Content;
        article.Excerpt = request.Content.Length > 200 ? request.Content.Substring(0, 200) + "..." : request.Content;
        article.CategoryId = request.CategoryId;
        article.ImageUrl = request.ImageUrl;
        article.ThumbnailUrl = request.ThumbnailUrl;
        article.UpdatedAt = DateTime.UtcNow;

        // Only admins can change publish status
        if (isAdmin && request.Publish && article.Status != ContentStatus.Published)
        {
            article.Status = ContentStatus.Published;
            article.PublishedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation("Article {ArticleId} updated by user {UserId}", id, userId);

        return await GetArticleByIdForManagement(id);
    }

    public async Task<bool> DeleteArticleAsync(Guid id, Guid userId, bool isAdmin)
    {
        var article = await _context.NewsArticles.FirstOrDefaultAsync(a => a.Id == id);

        if (article == null)
        {
            return false;
        }

        // Check ownership (non-admins can only delete their own articles)
        if (!isAdmin && article.AuthorId != userId)
        {
            throw new UnauthorizedAccessException("You can only delete your own articles");
        }

        _context.NewsArticles.Remove(article);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Article {ArticleId} deleted by user {UserId}", id, userId);

        return true;
    }

    public async Task<PaginatedResult<NewsArticleSummaryDto>> GetPendingArticlesAsync(int page, int pageSize)
    {
        if (page < 1) page = 1;
        if (pageSize < 1 || pageSize > 50) pageSize = 10;

        var query = _context.NewsArticles
            .Include(a => a.Category)
            .Include(a => a.Author)
                .ThenInclude(u => u.AlumniProfile)
            .Where(a => a.Status == ContentStatus.PendingReview);

        var totalCount = await query.CountAsync();

        var articles = await query
            .OrderBy(a => a.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var articleDtos = articles.Select(a => new NewsArticleSummaryDto
        {
            Id = a.Id,
            Title = a.Title,
            Excerpt = a.Excerpt,
            Category = new NewsCategoryDto
            {
                Id = a.Category.Id,
                Name = a.Category.Name,
                Slug = a.Category.Slug,
                Description = a.Category.Description
            },
            Author = new AuthorDto
            {
                Id = a.Author.Id,
                FirstName = a.Author.FirstName,
                LastName = a.Author.LastName,
                ProfileImageUrl = _urlHelperService.GetAbsoluteUrl(a.Author.AlumniProfile?.ProfileImageUrl)
            },
            ThumbnailUrl = _urlHelperService.GetAbsoluteUrl(a.ThumbnailUrl),
            Status = a.Status,
            PublishedAt = a.PublishedAt,
            CreatedAt = a.CreatedAt,
            ViewCount = a.ViewCount
        }).ToList();

        return new PaginatedResult<NewsArticleSummaryDto>
        {
            Items = articleDtos,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<NewsArticleDto> ApproveArticleAsync(Guid id, Guid adminId)
    {
        var article = await _context.NewsArticles
            .Include(a => a.Author)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (article == null)
        {
            throw new KeyNotFoundException($"Article with ID {id} not found");
        }

        if (article.Status != ContentStatus.PendingReview)
        {
            throw new InvalidOperationException("Only pending articles can be approved");
        }

        article.Status = ContentStatus.Published;
        article.PublishedAt = DateTime.UtcNow;
        article.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Article {ArticleId} approved by admin {AdminId}", id, adminId);

        // Send approval notification to author
        await SendContentApprovedNotificationAsync(id, article.AuthorId);

        return await GetArticleByIdForManagement(id);
    }

    public async Task<bool> RejectArticleAsync(Guid id, Guid adminId, string reason)
    {
        var article = await _context.NewsArticles
            .Include(a => a.Author)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (article == null)
        {
            return false;
        }

        if (article.Status != ContentStatus.PendingReview)
        {
            throw new InvalidOperationException("Only pending articles can be rejected");
        }

        var authorEmail = article.Author.Email;
        var authorName = $"{article.Author.FirstName} {article.Author.LastName}";
        var articleTitle = article.Title;

        _context.NewsArticles.Remove(article);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Article {ArticleId} rejected by admin {AdminId}. Reason: {Reason}", 
            id, adminId, reason);

        // Send rejection notification
        await SendContentRejectedNotificationAsync(authorEmail, authorName, articleTitle, reason);

        return true;
    }

    public async Task<NewsArticleDto> SubmitSuccessStoryAsync(Guid alumniId, CreateSuccessStoryRequest request)
    {
        // Get the Success Story category
        var successStoryCategory = await _context.NewsCategories
            .FirstOrDefaultAsync(c => c.Slug == "success-story");

        if (successStoryCategory == null)
        {
            throw new InvalidOperationException("Success Story category not found");
        }

        var article = new NewsArticle
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Content = request.Content,
            Excerpt = request.Content.Length > 200 ? request.Content.Substring(0, 200) + "..." : request.Content,
            CategoryId = successStoryCategory.Id,
            AuthorId = alumniId,
            ImageUrl = request.ImageUrl,
            ThumbnailUrl = request.ThumbnailUrl,
            Status = ContentStatus.PendingReview,
            CreatedAt = DateTime.UtcNow,
            ViewCount = 0
        };

        _context.NewsArticles.Add(article);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Success story {ArticleId} submitted by alumni {AlumniId}", 
            article.Id, alumniId);

        // Send notification to admins
        await SendContentSubmittedNotificationAsync(article.Id);

        return await GetArticleByIdForManagement(article.Id);
    }

    public async Task<List<NewsCategoryDto>> GetCategoriesAsync()
    {
        return await _context.NewsCategories
            .OrderBy(c => c.Name)
            .Select(c => new NewsCategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Slug = c.Slug,
                Description = c.Description
            })
            .ToListAsync();
    }

    // Helper methods

    private async Task<NewsArticleDto> GetArticleByIdForManagement(Guid id)
    {
        var article = await _context.NewsArticles
            .Include(a => a.Category)
            .Include(a => a.Author)
                .ThenInclude(u => u.AlumniProfile)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (article == null)
        {
            throw new KeyNotFoundException($"Article with ID {id} not found");
        }

        return MapToDto(article);
    }

    private NewsArticleDto MapToDto(NewsArticle article)
    {
        return new NewsArticleDto
        {
            Id = article.Id,
            Title = article.Title,
            Content = article.Content,
            Excerpt = article.Excerpt,
            Category = new NewsCategoryDto
            {
                Id = article.Category.Id,
                Name = article.Category.Name,
                Slug = article.Category.Slug,
                Description = article.Category.Description
            },
            Author = new AuthorDto
            {
                Id = article.Author.Id,
                FirstName = article.Author.FirstName,
                LastName = article.Author.LastName,
                ProfileImageUrl = _urlHelperService.GetAbsoluteUrl(article.Author.AlumniProfile?.ProfileImageUrl)
            },
            ImageUrl = _urlHelperService.GetAbsoluteUrl(article.ImageUrl),
            ThumbnailUrl = _urlHelperService.GetAbsoluteUrl(article.ThumbnailUrl),
            Status = article.Status,
            PublishedAt = article.PublishedAt,
            CreatedAt = article.CreatedAt,
            UpdatedAt = article.UpdatedAt,
            ViewCount = article.ViewCount
        };
    }

    private NewsArticleSummaryDto MapToSummaryDto(NewsArticle article)
    {
        return new NewsArticleSummaryDto
        {
            Id = article.Id,
            Title = article.Title,
            Excerpt = article.Excerpt,
            Category = new NewsCategoryDto
            {
                Id = article.Category.Id,
                Name = article.Category.Name,
                Slug = article.Category.Slug,
                Description = article.Category.Description
            },
            Author = new AuthorDto
            {
                Id = article.Author.Id,
                FirstName = article.Author.FirstName,
                LastName = article.Author.LastName,
                ProfileImageUrl = _urlHelperService.GetAbsoluteUrl(article.Author.AlumniProfile?.ProfileImageUrl)
            },
            ThumbnailUrl = _urlHelperService.GetAbsoluteUrl(article.ThumbnailUrl),
            Status = article.Status,
            PublishedAt = article.PublishedAt,
            CreatedAt = article.CreatedAt,
            ViewCount = article.ViewCount
        };
    }

    private async Task SendContentSubmittedNotificationAsync(Guid articleId)
    {
        try
        {
            var article = await _context.NewsArticles.FindAsync(articleId);
            var articleTitle = article?.Title ?? "New Success Story / Article";

            // Get admin emails
            var adminEmails = await _context.UserRoles
                .Include(ur => ur.User)
                .Include(ur => ur.Role)
                .Where(ur => ur.Role.Name == "Admin")
                .Select(ur => ur.User.Email)
                .ToListAsync();

            foreach (var email in adminEmails)
            {
                await _emailService.SendNewsSubmittedNotificationAsync(
                    email,
                    articleTitle,
                    articleId);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send content submitted notification for article {ArticleId}", articleId);
        }
    }

    private async Task SendContentApprovedNotificationAsync(Guid articleId, Guid authorId)
    {
        try
        {
            var author = await _context.Users.FindAsync(authorId);
            var article = await _context.NewsArticles.FindAsync(articleId);
            if (author != null && article != null)
            {
                await _emailService.SendNewsStatusNotificationAsync(
                    author.Email,
                    author.FirstName,
                    article.Title,
                    "Approved");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send approval notification for article {ArticleId}", articleId);
        }
    }

    private async Task SendContentRejectedNotificationAsync(string email, string name, string title, string reason)
    {
        try
        {
            await _emailService.SendNewsStatusNotificationAsync(
                email,
                name,
                title,
                "Rejected",
                reason);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send rejection notification to {Email}", email);
        }
    }
}

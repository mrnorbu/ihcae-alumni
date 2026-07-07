using IHCAE.Api.Features.Auth.Models.Entities;

namespace IHCAE.Api.Features.News.Models.Entities;

/// <summary>
/// Represents a news article in the system.
/// Can be a regular news article, announcement, or success story.
/// </summary>
public class NewsArticle
{
    /// <summary>
    /// Unique identifier for the article
    /// </summary>
    public int Id { get; set; }
    
    /// <summary>
    /// Title of the article
    /// </summary>
    public string Title { get; set; } = string.Empty;
    
    /// <summary>
    /// URL-friendly slug
    /// </summary>
    public string Slug { get; set; } = string.Empty;
    
    /// <summary>
    /// Full content/body of the article
    /// </summary>
    public string Content { get; set; } = string.Empty;
    
    /// <summary>
    /// Short excerpt (first 200 characters) for list views
    /// </summary>
    public string? Excerpt { get; set; }
    
    /// <summary>
    /// Foreign key to the category
    /// </summary>
    public int CategoryId { get; set; }
    
    /// <summary>
    /// Foreign key to the author (user who created the article)
    /// </summary>
    public int AuthorId { get; set; }
    
    /// <summary>
    /// URL to the full-size image
    /// </summary>
    public string? ImageUrl { get; set; }
    
    /// <summary>
    /// URL to the thumbnail image
    /// </summary>
    public string? ThumbnailUrl { get; set; }
    
    /// <summary>
    /// Publication status of the article
    /// </summary>
    public ContentStatus Status { get; set; }
    
    /// <summary>
    /// Timestamp when the article was published (null if not published)
    /// </summary>
    public DateTime? PublishedAt { get; set; }
    
    /// <summary>
    /// Timestamp when the article was created
    /// </summary>
    public DateTime CreatedAt { get; set; }
    
    /// <summary>
    /// Timestamp when the article was last updated
    /// </summary>
    public DateTime? UpdatedAt { get; set; }
    
    /// <summary>
    /// Reason why the article was rejected during review
    /// </summary>
    public string? RejectionReason { get; set; }
    
    /// <summary>
    /// Number of times the article has been viewed
    /// </summary>
    public int ViewCount { get; set; }
    
    // Navigation properties
    
    /// <summary>
    /// The category this article belongs to
    /// </summary>
    public NewsCategory Category { get; set; } = null!;
    
    /// <summary>
    /// The user who authored this article
    /// </summary>
    public User Author { get; set; } = null!;
}

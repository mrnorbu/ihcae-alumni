using IHCAE.Api.Features.News.Models.Entities;
using IHCAE.Api.Shared.DTOs;

namespace IHCAE.Api.Features.News.Models.DTOs;

/// <summary>
/// DTO for full news article details
/// </summary>
public class NewsArticleDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string? Excerpt { get; set; }
    public NewsCategoryDto Category { get; set; } = null!;
    public AuthorDto Author { get; set; } = null!;
    public string? ImageUrl { get; set; }
    public string? ThumbnailUrl { get; set; }
    public ContentStatus Status { get; set; }
    public string? RejectionReason { get; set; }
    public DateTime? PublishedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public int ViewCount { get; set; }
}

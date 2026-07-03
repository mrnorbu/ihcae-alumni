using IHCAE.Api.Features.News.Models.Entities;
using IHCAE.Api.Shared.DTOs;

namespace IHCAE.Api.Features.News.Models.DTOs;

/// <summary>
/// DTO for news article summary in list views
/// </summary>
public class NewsArticleSummaryDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Excerpt { get; set; }
    public NewsCategoryDto Category { get; set; } = null!;
    public AuthorDto Author { get; set; } = null!;
    public string? ThumbnailUrl { get; set; }
    public ContentStatus Status { get; set; }
    public string? RejectionReason { get; set; }
    public DateTime? PublishedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public int ViewCount { get; set; }
}

namespace IHCAE.Api.Features.News.Models.Entities;

/// <summary>
/// Represents a category for news articles (e.g., General News, Announcement, Success Story).
/// </summary>
public class NewsCategory
{
    /// <summary>
    /// Unique identifier for the category
    /// </summary>
    public int Id { get; set; }
    
    /// <summary>
    /// Display name of the category
    /// </summary>
    public string Name { get; set; } = string.Empty;
    
    /// <summary>
    /// URL-friendly slug for the category
    /// </summary>
    public string Slug { get; set; } = string.Empty;
    
    /// <summary>
    /// Optional description of the category
    /// </summary>
    public string? Description { get; set; }
    
    /// <summary>
    /// Timestamp when the category was created
    /// </summary>
    public DateTime CreatedAt { get; set; }
}

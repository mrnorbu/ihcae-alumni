using System.ComponentModel.DataAnnotations;

namespace IHCAE.Api.Features.News.Models.DTOs;

/// <summary>
/// Request DTO for updating a news article
/// </summary>
public class UpdateNewsArticleRequest
{
    [Required(ErrorMessage = "Title is required")]
    [StringLength(255, ErrorMessage = "Title cannot exceed 255 characters")]
    public string Title { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "Content is required")]
    public string Content { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "Category is required")]
    public int CategoryId { get; set; }
    
    public string? ImageUrl { get; set; }
    public string? ThumbnailUrl { get; set; }
    
    /// <summary>
    /// Whether to publish the article (Admin only)
    /// </summary>
    public bool Publish { get; set; }
}

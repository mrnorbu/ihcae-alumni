using System.ComponentModel.DataAnnotations;

namespace IHCAE.Api.Features.News.Models.DTOs;

/// <summary>
/// Request DTO for alumni to submit news articles or success stories
/// </summary>
public class SubmitContentRequest
{
    [Required(ErrorMessage = "Title is required")]
    [StringLength(255, ErrorMessage = "Title cannot exceed 255 characters")]
    public string Title { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "Content is required")]
    public string Content { get; set; } = string.Empty;
    
    // Optional for general news, but required for success stories in logic
    public string? ImageUrl { get; set; }
    
    public string? ThumbnailUrl { get; set; }

    [Required(ErrorMessage = "Category slug is required")]
    public string CategorySlug { get; set; } = "success-story";
}

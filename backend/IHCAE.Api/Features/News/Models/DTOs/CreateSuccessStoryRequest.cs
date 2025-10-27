using System.ComponentModel.DataAnnotations;

namespace IHCAE.Api.Features.News.Models.DTOs;

/// <summary>
/// Request DTO for alumni to submit success stories
/// </summary>
public class CreateSuccessStoryRequest
{
    [Required(ErrorMessage = "Title is required")]
    [StringLength(255, ErrorMessage = "Title cannot exceed 255 characters")]
    public string Title { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "Story content is required")]
    public string Content { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "Image is required for success stories")]
    public string ImageUrl { get; set; } = string.Empty;
    
    public string? ThumbnailUrl { get; set; }
}

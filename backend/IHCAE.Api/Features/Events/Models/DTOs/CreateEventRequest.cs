using System.ComponentModel.DataAnnotations;

namespace IHCAE.Api.Features.Events.Models.DTOs;

/// <summary>
/// Request DTO for creating an event
/// </summary>
public class CreateEventRequest
{
    [Required(ErrorMessage = "Title is required")]
    [StringLength(255, ErrorMessage = "Title cannot exceed 255 characters")]
    public string Title { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "Description is required")]
    public string Description { get; set; } = string.Empty;
    
    public int? CategoryId { get; set; }
    
    [Required(ErrorMessage = "Location is required")]
    [StringLength(255, ErrorMessage = "Location cannot exceed 255 characters")]
    public string Location { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "Event date is required")]
    public DateTime EventDate { get; set; }
    
    public DateTime? EventEndDate { get; set; }
    
    public string? ImageUrl { get; set; }
    public string? ThumbnailUrl { get; set; }
    
    [Range(1, int.MaxValue, ErrorMessage = "Capacity must be at least 1")]
    public int? Capacity { get; set; }
    
    public DateTime? RegistrationDeadline { get; set; }
    
    /// <summary>
    /// Whether to publish immediately (Admin) or submit for review (ContentCreator)
    /// </summary>
    public bool Publish { get; set; }
}

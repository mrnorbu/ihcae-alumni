using IHCAE.Api.Features.Auth.Models.Entities;
using IHCAE.Api.Features.News.Models.Entities;

namespace IHCAE.Api.Features.Events.Models.Entities;

/// <summary>
/// Represents an event in the system.
/// </summary>
public class Event
{
    /// <summary>
    /// Unique identifier for the event
    /// </summary>
    public Guid Id { get; set; }
    
    /// <summary>
    /// Title of the event
    /// </summary>
    public string Title { get; set; } = string.Empty;
    
    /// <summary>
    /// Full description of the event
    /// </summary>
    public string Description { get; set; } = string.Empty;
    
    /// <summary>
    /// Foreign key to the category (optional)
    /// </summary>
    public Guid? CategoryId { get; set; }
    
    /// <summary>
    /// Location where the event will take place
    /// </summary>
    public string Location { get; set; } = string.Empty;
    
    /// <summary>
    /// Date and time when the event starts
    /// </summary>
    public DateTime EventDate { get; set; }
    
    /// <summary>
    /// Date and time when the event ends (optional)
    /// </summary>
    public DateTime? EventEndDate { get; set; }
    
    /// <summary>
    /// URL to the full-size image
    /// </summary>
    public string? ImageUrl { get; set; }
    
    /// <summary>
    /// URL to the thumbnail image
    /// </summary>
    public string? ThumbnailUrl { get; set; }
    
    /// <summary>
    /// Maximum number of registrations allowed (null = unlimited)
    /// </summary>
    public int? Capacity { get; set; }
    
    /// <summary>
    /// Deadline for registration (optional)
    /// </summary>
    public DateTime? RegistrationDeadline { get; set; }
    
    /// <summary>
    /// Foreign key to the user who created the event
    /// </summary>
    public Guid CreatedById { get; set; }
    
    /// <summary>
    /// Publication status of the event
    /// </summary>
    public ContentStatus Status { get; set; }
    
    /// <summary>
    /// Timestamp when the event was published (null if not published)
    /// </summary>
    public DateTime? PublishedAt { get; set; }
    
    /// <summary>
    /// Timestamp when the event was created
    /// </summary>
    public DateTime CreatedAt { get; set; }
    
    /// <summary>
    /// Timestamp when the event was last updated
    /// </summary>
    public DateTime? UpdatedAt { get; set; }
    
    // Navigation properties
    
    /// <summary>
    /// The category this event belongs to
    /// </summary>
    public EventCategory? Category { get; set; }
    
    /// <summary>
    /// The user who created this event
    /// </summary>
    public User CreatedBy { get; set; } = null!;
    
    /// <summary>
    /// Collection of registrations for this event
    /// </summary>
    public ICollection<EventRegistration> Registrations { get; set; } = new List<EventRegistration>();
}

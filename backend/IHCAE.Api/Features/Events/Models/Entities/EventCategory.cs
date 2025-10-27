namespace IHCAE.Api.Features.Events.Models.Entities;

/// <summary>
/// Represents a category for events (e.g., Workshop, Seminar, Networking).
/// </summary>
public class EventCategory
{
    /// <summary>
    /// Unique identifier for the category
    /// </summary>
    public Guid Id { get; set; }
    
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

using IHCAE.Api.Features.Auth.Models.Entities;

namespace IHCAE.Api.Features.Events.Models.Entities;

/// <summary>
/// Represents a registration for an event.
/// Can be from an authenticated user or a public visitor.
/// </summary>
public class EventRegistration
{
    /// <summary>
    /// Unique identifier for the registration
    /// </summary>
    public Guid Id { get; set; }
    
    /// <summary>
    /// Foreign key to the event
    /// </summary>
    public Guid EventId { get; set; }
    
    /// <summary>
    /// Foreign key to the user (null for public registrations)
    /// </summary>
    public Guid? UserId { get; set; }
    
    /// <summary>
    /// Name of the registrant
    /// </summary>
    public string Name { get; set; } = string.Empty;
    
    /// <summary>
    /// Email of the registrant
    /// </summary>
    public string Email { get; set; } = string.Empty;
    
    /// <summary>
    /// Phone number of the registrant (optional)
    /// </summary>
    public string? Phone { get; set; }
    
    /// <summary>
    /// Timestamp when the registration was made
    /// </summary>
    public DateTime RegistrationDate { get; set; }
    
    /// <summary>
    /// Status of the registration
    /// </summary>
    public RegistrationStatus Status { get; set; }
    
    // Navigation properties
    
    /// <summary>
    /// The event this registration is for
    /// </summary>
    public Event Event { get; set; } = null!;
    
    /// <summary>
    /// The user who registered (null for public registrations)
    /// </summary>
    public User? User { get; set; }
}

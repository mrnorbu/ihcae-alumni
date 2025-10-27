namespace IHCAE.Api.Features.Events.Models.Entities;

/// <summary>
/// Represents the status of an event registration.
/// </summary>
public enum RegistrationStatus
{
    /// <summary>
    /// Registration is confirmed
    /// </summary>
    Confirmed,
    
    /// <summary>
    /// Registration has been cancelled
    /// </summary>
    Cancelled,
    
    /// <summary>
    /// Registration is on the waitlist (event at capacity)
    /// </summary>
    Waitlist
}

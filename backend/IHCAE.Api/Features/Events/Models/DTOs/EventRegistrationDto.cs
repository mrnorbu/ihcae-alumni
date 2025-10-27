using IHCAE.Api.Features.Events.Models.Entities;

namespace IHCAE.Api.Features.Events.Models.DTOs;

/// <summary>
/// DTO for event registration information
/// </summary>
public class EventRegistrationDto
{
    public Guid Id { get; set; }
    public Guid EventId { get; set; }
    public Guid? UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public DateTime RegistrationDate { get; set; }
    public RegistrationStatus Status { get; set; }
    public bool IsAuthenticatedUser { get; set; }
}

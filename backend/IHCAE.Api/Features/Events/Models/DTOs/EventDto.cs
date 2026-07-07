using IHCAE.Api.Features.News.Models.Entities;
using IHCAE.Api.Shared.DTOs;

namespace IHCAE.Api.Features.Events.Models.DTOs;

/// <summary>
/// DTO for full event details
/// </summary>
public class EventDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public EventCategoryDto? Category { get; set; }
    public string Location { get; set; } = string.Empty;
    public DateTime EventDate { get; set; }
    public DateTime? EventEndDate { get; set; }
    public string? ImageUrl { get; set; }
    public string? ThumbnailUrl { get; set; }
    public int? Capacity { get; set; }
    public DateTime? RegistrationDeadline { get; set; }
    public AuthorDto CreatedBy { get; set; } = null!;
    public ContentStatus Status { get; set; }
    public DateTime? PublishedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public int RegistrationCount { get; set; }
    public int? AvailableSpots { get; set; }
}

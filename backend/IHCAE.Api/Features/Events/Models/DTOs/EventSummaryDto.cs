using IHCAE.Api.Features.News.Models.Entities;
using IHCAE.Api.Shared.DTOs;

namespace IHCAE.Api.Features.Events.Models.DTOs;

/// <summary>
/// DTO for event summary in list views
/// </summary>
public class EventSummaryDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public EventCategoryDto? Category { get; set; }
    public string Location { get; set; } = string.Empty;
    public DateTime EventDate { get; set; }
    public DateTime? EventEndDate { get; set; }
    public string? ThumbnailUrl { get; set; }
    public int? Capacity { get; set; }
    public ContentStatus Status { get; set; }
    public DateTime? PublishedAt { get; set; }
    public int RegistrationCount { get; set; }
    public int? AvailableSpots { get; set; }
}

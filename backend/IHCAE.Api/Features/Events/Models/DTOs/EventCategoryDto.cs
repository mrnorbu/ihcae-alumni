namespace IHCAE.Api.Features.Events.Models.DTOs;

/// <summary>
/// DTO for event category information
/// </summary>
public class EventCategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
}

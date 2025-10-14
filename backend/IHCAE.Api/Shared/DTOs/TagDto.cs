namespace IHCAE.Api.Shared.DTOs;

/// <summary>
/// Data Transfer Object for a Tag.
/// </summary>
public class TagDto
{
    /// <summary>
    /// Unique identifier for the tag.
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// The display name of the tag.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// A URL-friendly version of the tag name.
    /// </summary>
    public string Slug { get; set; } = string.Empty;

    /// <summary>
    /// The number of times this tag has been used.
    /// </summary>
    public int UsageCount { get; set; }
}

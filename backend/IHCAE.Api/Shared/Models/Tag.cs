using System.ComponentModel.DataAnnotations;

namespace IHCAE.Api.Shared.Models;

/// <summary>
/// Represents a tag that can be associated with various content types (e.g., forum topics, news articles).
/// </summary>
public class Tag
{
    /// <summary>
    /// Unique identifier for the tag.
    /// </summary>
    [Key]
    public int Id { get; set; }

    /// <summary>
    /// The display name of the tag (e.g., "Alumni Events").
    /// </summary>
    [Required]
    [MaxLength(50)]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// A URL-friendly version of the tag name (e.g., "alumni-events").
    /// </summary>
    [Required]
    [MaxLength(50)]
    public string Slug { get; set; } = string.Empty;

    /// <summary>
    /// The number of times this tag has been used across all content types.
    /// </summary>
    public int UsageCount { get; set; } = 0;

    /// <summary>
    /// When the tag was created.
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

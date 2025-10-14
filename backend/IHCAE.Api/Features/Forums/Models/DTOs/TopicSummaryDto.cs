using IHCAE.Api.Shared.DTOs;

namespace IHCAE.Api.Features.Forums.Models.DTOs;

/// <summary>
/// Summary information about a discussion topic for list views
/// </summary>
public class TopicSummaryDto
{
    /// <summary>
    /// Unique identifier for the topic
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Title of the discussion topic
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Information about the topic creator
    /// </summary>
    public AuthorDto CreatedBy { get; set; } = null!;

    /// <summary>
    /// Total number of posts in this topic (including replies)
    /// </summary>
    public int PostCount { get; set; }

    /// <summary>
    /// When the last reply was posted (null if no replies)
    /// </summary>
    public DateTime? LastReplyAt { get; set; }

    /// <summary>
    /// Whether this topic is pinned to the top
    /// </summary>
    public bool IsPinned { get; set; }

    /// <summary>
    /// Whether this topic is locked from new posts
    /// </summary>
    public bool IsLocked { get; set; }

    /// <summary>
    /// When the topic was created
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// List of tags associated with the topic
    /// </summary>
    public List<TagDto> Tags { get; set; } = new List<TagDto>();
}

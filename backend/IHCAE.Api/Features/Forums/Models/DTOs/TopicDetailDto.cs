using IHCAE.Api.Shared.DTOs;

namespace IHCAE.Api.Features.Forums.Models.DTOs;

/// <summary>
/// Detailed information about a discussion topic including all posts
/// </summary>
public class TopicDetailDto
{
    /// <summary>
    /// Unique identifier for the topic
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Title of the discussion topic
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Information about the topic creator
    /// </summary>
    public AuthorDto CreatedBy { get; set; } = null!;

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
    /// List of all posts in this topic (top-level posts only, replies are nested)
    /// </summary>
    public List<PostDto> Posts { get; set; } = new List<PostDto>();

    /// <summary>
    /// List of tags associated with the topic
    /// </summary>
    public List<TagDto> Tags { get; set; } = new List<TagDto>();
}

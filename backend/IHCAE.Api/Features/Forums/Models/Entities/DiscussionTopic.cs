using System.ComponentModel.DataAnnotations;
using IHCAE.Api.Features.Auth.Models.Entities;

namespace IHCAE.Api.Features.Forums.Models.Entities;

/// <summary>
/// Represents a discussion topic/thread in the community forum.
/// Each topic serves as a container for forum posts and replies.
/// </summary>
public class DiscussionTopic
{
    /// <summary>
    /// Unique identifier for the topic (UUID format)
    /// </summary>
    [Key]
    public Guid Id { get; set; }

    /// <summary>
    /// Title of the discussion topic
    /// </summary>
    [Required]
    [MaxLength(255)]
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// ID of the user who created this topic
    /// </summary>
    [Required]
    public Guid CreatedById { get; set; }

    /// <summary>
    /// Navigation property to the user who created this topic
    /// </summary>
    public User CreatedBy { get; set; } = null!;

    /// <summary>
    /// Whether the topic is locked (no new posts allowed)
    /// </summary>
    public bool IsLocked { get; set; } = false;

    /// <summary>
    /// Whether the topic is pinned to the top of the list
    /// </summary>
    public bool IsPinned { get; set; } = false;

    /// <summary>
    /// When the topic was created
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// When the topic was last updated
    /// </summary>
    public DateTime? UpdatedAt { get; set; }

    /// <summary>
    /// Collection of all posts in this topic
    /// </summary>
    public ICollection<ForumPost> Posts { get; set; } = new List<ForumPost>();

    /// <summary>
    /// Collection of tag associations for this topic
    /// </summary>
    public ICollection<DiscussionTopicTag> TopicTags { get; set; } = new List<DiscussionTopicTag>();
}


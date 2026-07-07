using System.ComponentModel.DataAnnotations;
using IHCAE.Api.Shared.Models; // For Tag entity

namespace IHCAE.Api.Features.Forums.Models.Entities;

/// <summary>
/// Represents the many-to-many relationship between a DiscussionTopic and a Tag.
/// </summary>
public class DiscussionTopicTag
{
    /// <summary>
    /// Foreign key to the DiscussionTopic.
    /// </summary>
    [Required]
    public int TopicId { get; set; }

    /// <summary>
    /// Navigation property to the DiscussionTopic.
    /// </summary>
    public virtual DiscussionTopic Topic { get; set; } = null!;

    /// <summary>
    /// Foreign key to the Tag.
    /// </summary>
    [Required]
    public int TagId { get; set; }

    /// <summary>
    /// Navigation property to the Tag.
    /// </summary>
    public virtual Tag Tag { get; set; } = null!;
}

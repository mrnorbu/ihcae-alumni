using System.ComponentModel.DataAnnotations;
using IHCAE.Api.Features.Auth.Models.Entities;

namespace IHCAE.Api.Features.Forums.Models.Entities;

/// <summary>
/// Represents an individual post or reply within a discussion topic.
/// Supports nested replies through the ParentPostId property.
/// </summary>
public class ForumPost
{
    /// <summary>
    /// Unique identifier for the post (UUID format)
    /// </summary>
    [Key]
    public int Id { get; set; }

    /// <summary>
    /// Content of the post (plain text with auto-linked URLs)
    /// </summary>
    [Required]
    public string Content { get; set; } = string.Empty;

    /// <summary>
    /// ID of the topic this post belongs to
    /// </summary>
    [Required]
    public int TopicId { get; set; }

    /// <summary>
    /// Navigation property to the parent topic
    /// </summary>
    public DiscussionTopic Topic { get; set; } = null!;

    /// <summary>
    /// ID of the user who authored this post
    /// </summary>
    [Required]
    public int AuthorId { get; set; }

    /// <summary>
    /// Navigation property to the post author
    /// </summary>
    public User Author { get; set; } = null!;

    /// <summary>
    /// ID of the parent post (for nested replies, null for top-level posts)
    /// </summary>
    public int? ParentPostId { get; set; }

    /// <summary>
    /// Navigation property to the parent post (for nested replies)
    /// </summary>
    public ForumPost? ParentPost { get; set; }

    /// <summary>
    /// Collection of replies to this post
    /// </summary>
    public ICollection<ForumPost> Replies { get; set; } = new List<ForumPost>();

    /// <summary>
    /// Collection of likes on this post
    /// </summary>
    public ICollection<PostLike> Likes { get; set; } = new List<PostLike>();

    /// <summary>
    /// When the post was created
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// When the post was last updated
    /// </summary>
    public DateTime? UpdatedAt { get; set; }

    /// <summary>
    /// Whether the post has been deleted by the author
    /// </summary>
    public bool IsDeleted { get; set; } = false;

    /// <summary>
    /// When the post was deleted (if applicable)
    /// </summary>
    public DateTime? DeletedAt { get; set; }

    /// <summary>
    /// Who deleted the post (null if deleted by author, UserId if deleted by admin)
    /// </summary>
    public int? DeletedBy { get; set; }

    /// <summary>
    /// Reason for deletion (admin only)
    /// </summary>
    public string? DeletionReason { get; set; }
}

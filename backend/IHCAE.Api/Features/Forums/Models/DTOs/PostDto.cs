using IHCAE.Api.Shared.DTOs;

namespace IHCAE.Api.Features.Forums.Models.DTOs;

/// <summary>
/// Information about a forum post including author and engagement data
/// </summary>
public class PostDto
{
    /// <summary>
    /// Unique identifier for the post
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Content of the post (plain text with auto-linked URLs)
    /// </summary>
    public string Content { get; set; } = string.Empty;

    /// <summary>
    /// Information about the post author
    /// </summary>
    public AuthorDto Author { get; set; } = null!;

    /// <summary>
    /// ID of the parent post (null for top-level posts)
    /// </summary>
    public Guid? ParentPostId { get; set; }

    /// <summary>
    /// Information about the parent post author (for "replying to" context)
    /// </summary>
    public AuthorDto? ParentAuthor { get; set; }

    /// <summary>
    /// When the post was created
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// When the post was last updated (null if never updated)
    /// </summary>
    public DateTime? UpdatedAt { get; set; }

    /// <summary>
    /// Number of likes on this post
    /// </summary>
    public int LikeCount { get; set; }

    /// <summary>
    /// Whether the current user has liked this post
    /// </summary>
    public bool IsLikedByCurrentUser { get; set; }

    /// <summary>
    /// List of replies to this post (nested replies only, 1 level deep)
    /// </summary>
    public List<PostDto> Replies { get; set; } = new List<PostDto>();
}

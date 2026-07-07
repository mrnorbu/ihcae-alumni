using System.ComponentModel.DataAnnotations;
using IHCAE.Api.Features.Auth.Models.Entities;

namespace IHCAE.Api.Features.Forums.Models.Entities;

/// <summary>
/// Represents a like on a forum post.
/// Users can like posts to show appreciation or agreement.
/// </summary>
public class PostLike
{
    /// <summary>
    /// ID of the post that was liked
    /// </summary>
    [Required]
    public int PostId { get; set; }

    /// <summary>
    /// Navigation property to the liked post
    /// </summary>
    public ForumPost Post { get; set; } = null!;

    /// <summary>
    /// ID of the user who liked the post
    /// </summary>
    [Required]
    public int UserId { get; set; }

    /// <summary>
    /// Navigation property to the user who liked the post
    /// </summary>
    public User User { get; set; } = null!;

    /// <summary>
    /// When the like was created
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

using System.ComponentModel.DataAnnotations;
using IHCAE.Api.Features.Auth.Models.Entities;

namespace IHCAE.Api.Features.Forums.Models.Entities;

/// <summary>
/// Represents a flag/report on a forum post by a user.
/// Allows alumni to report inappropriate content for admin review.
/// </summary>
public class ForumFlag
{
    /// <summary>
    /// Unique identifier for the flag
    /// </summary>
    [Key]
    public Guid Id { get; set; }

    /// <summary>
    /// The post being flagged
    /// </summary>
    [Required]
    public Guid PostId { get; set; }

    /// <summary>
    /// Navigation property to the flagged post
    /// </summary>
    public ForumPost Post { get; set; } = null!;

    /// <summary>
    /// The user who flagged the post
    /// </summary>
    [Required]
    public Guid FlaggedById { get; set; }

    /// <summary>
    /// Navigation property to the user who flagged
    /// </summary>
    public User FlaggedBy { get; set; } = null!;

    /// <summary>
    /// Reason for flagging (e.g. "Spam", "Harassment", "Inappropriate", "Other")
    /// </summary>
    [Required]
    [MaxLength(50)]
    public string Reason { get; set; } = string.Empty;

    /// <summary>
    /// Additional details provided by the flagger
    /// </summary>
    [MaxLength(500)]
    public string? Details { get; set; }

    /// <summary>
    /// Current status of the flag
    /// </summary>
    [Required]
    public FlagStatus Status { get; set; } = FlagStatus.Pending;

    /// <summary>
    /// Admin who resolved this flag (if resolved)
    /// </summary>
    public Guid? ResolvedById { get; set; }

    /// <summary>
    /// Navigation property to admin who resolved
    /// </summary>
    public User? ResolvedBy { get; set; }

    /// <summary>
    /// Notes from admin when resolving
    /// </summary>
    [MaxLength(500)]
    public string? ResolutionNotes { get; set; }

    /// <summary>
    /// When the flag was created
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// When the flag was resolved
    /// </summary>
    public DateTime? ResolvedAt { get; set; }
}

/// <summary>
/// Status of a forum flag
/// </summary>
public enum FlagStatus
{
    Pending = 0,
    Reviewed = 1,
    Dismissed = 2,
    ActionTaken = 3
}

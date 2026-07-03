using System;
using System.ComponentModel.DataAnnotations;
using IHCAE.Api.Features.Auth.Models.Entities;

namespace IHCAE.Api.Shared.Models;

/// <summary>
/// Represents an in-app notification in the system.
/// </summary>
public class Notification
{
    /// <summary>
    /// Unique identifier for the notification.
    /// </summary>
    [Key]
    public Guid Id { get; set; }

    /// <summary>
    /// The user ID of the recipient of this notification.
    /// </summary>
    [Required]
    public Guid UserId { get; set; }

    /// <summary>
    /// Navigation property to the recipient.
    /// </summary>
    public User User { get; set; } = null!;

    /// <summary>
    /// Title of the notification.
    /// </summary>
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Detailed message text of the notification.
    /// </summary>
    [Required]
    [MaxLength(500)]
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// Type of notification (e.g. "Reply", "Like", "Moderation", "System").
    /// </summary>
    [Required]
    [MaxLength(50)]
    public string Type { get; set; } = string.Empty;

    /// <summary>
    /// Optional redirect URL/link to view the related item (e.g. "/forums/topic/some-id").
    /// </summary>
    [MaxLength(255)]
    public string? Link { get; set; }

    /// <summary>
    /// Whether the notification has been read by the user.
    /// </summary>
    public bool IsRead { get; set; } = false;

    /// <summary>
    /// The timestamp when the notification was created.
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

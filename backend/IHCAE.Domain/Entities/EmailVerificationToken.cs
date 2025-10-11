using System.ComponentModel.DataAnnotations;

namespace IHCAE.Domain.Entities;

/// <summary>
/// Represents an email verification token for user account verification.
/// </summary>
public class EmailVerificationToken
{
    /// <summary>
    /// Unique identifier for the verification token.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// The user ID associated with this verification token.
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Navigation property to the user.
    /// </summary>
    public User User { get; set; } = null!;

    /// <summary>
    /// The verification token string (hashed for security).
    /// </summary>
    [Required]
    [MaxLength(255)]
    public string TokenHash { get; set; } = string.Empty;

    /// <summary>
    /// When the token was created.
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// When the token expires (24 hours from creation).
    /// </summary>
    public DateTime ExpiresAt { get; set; }

    /// <summary>
    /// Whether this token has been used for verification.
    /// </summary>
    public bool IsUsed { get; set; }

    /// <summary>
    /// When the token was used (if applicable).
    /// </summary>
    public DateTime? UsedAt { get; set; }
}
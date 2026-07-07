using System.ComponentModel.DataAnnotations;

namespace IHCAE.Api.Features.PasswordReset.Models.Entities;

/// <summary>
/// Represents a password reset token for user password reset functionality.
/// </summary>
public class PasswordResetToken
{
    /// <summary>
    /// Unique identifier for the password reset token.
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// The user ID associated with this password reset token.
    /// </summary>
    public int UserId { get; set; }

    /// <summary>
    /// Navigation property to the user.
    /// </summary>
    public IHCAE.Api.Features.Auth.Models.Entities.User User { get; set; } = null!;

    /// <summary>
    /// The password reset token string (hashed for security).
    /// </summary>
    [Required]
    [MaxLength(255)]
    public string TokenHash { get; set; } = string.Empty;

    /// <summary>
    /// When the token was created.
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// When the token expires (1 hour from creation).
    /// </summary>
    public DateTime ExpiresAt { get; set; }

    /// <summary>
    /// Whether this token has been used for password reset.
    /// </summary>
    public bool IsUsed { get; set; }

    /// <summary>
    /// When the token was used (if applicable).
    /// </summary>
    public DateTime? UsedAt { get; set; }
}


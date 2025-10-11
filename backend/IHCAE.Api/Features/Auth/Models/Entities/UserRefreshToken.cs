using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IHCAE.Api.Features.Auth.Models.Entities;

/// <summary>
/// Represents refresh tokens for JWT authentication.
/// These tokens allow users to obtain new access tokens without re-authenticating.
/// </summary>
public class UserRefreshToken
{
    /// <summary>
    /// Unique identifier for the refresh token
    /// </summary>
    [Key]
    public Guid Id { get; set; }

    /// <summary>
    /// Foreign key to the User entity
    /// </summary>
    [Required]
    public Guid UserId { get; set; }

    /// <summary>
    /// Hashed version of the refresh token for security
    /// The actual token is never stored in plain text
    /// </summary>
    [Required]
    [MaxLength(255)]
    public string TokenHash { get; set; } = string.Empty;

    /// <summary>
    /// When this refresh token expires
    /// Typically 7 days from creation
    /// </summary>
    [Required]
    public DateTime ExpiresAt { get; set; }

    /// <summary>
    /// When this refresh token was created
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// When this refresh token was explicitly revoked
    /// Null if still active
    /// </summary>
    public DateTime? RevokedAt { get; set; }

    /// <summary>
    /// Whether this token has been revoked or expired
    /// </summary>
    public bool IsActive => RevokedAt == null && ExpiresAt > DateTime.UtcNow;

    // Navigation properties
    /// <summary>
    /// The user this refresh token belongs to
    /// </summary>
    public virtual User User { get; set; } = null!;
}


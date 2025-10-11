using System.ComponentModel.DataAnnotations;

namespace IHCAE.Api.Features.Auth.Models.Entities;

/// <summary>
/// Represents a user in the IHCAE Alumni Network system.
/// This is the central entity for authentication and core identity management.
/// </summary>
public class User
{
    /// <summary>
    /// Unique identifier for the user (UUID format)
    /// </summary>
    [Key]
    public Guid Id { get; set; }

    /// <summary>
    /// User's email address - must be unique across the system
    /// </summary>
    [Required]
    [EmailAddress]
    [MaxLength(255)]
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Hashed password using BCrypt with cost factor 12
    /// </summary>
    [Required]
    [MaxLength(255)]
    public string PasswordHash { get; set; } = string.Empty;

    /// <summary>
    /// User's first name
    /// </summary>
    [Required]
    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;

    /// <summary>
    /// User's last name
    /// </summary>
    [Required]
    [MaxLength(100)]
    public string LastName { get; set; } = string.Empty;

    /// <summary>
    /// Current status of the user account
    /// Pending: Awaiting admin approval
    /// Approved: Active user account
    /// Rejected: Registration was rejected
    /// </summary>
    [Required]
    public UserStatus Status { get; set; } = UserStatus.Pending;

    /// <summary>
    /// Whether the user's email has been verified
    /// </summary>
    public bool EmailVerified { get; set; } = false;

    /// <summary>
    /// Whether the user is banned from the forum
    /// </summary>
    public bool IsBanned { get; set; } = false;

    /// <summary>
    /// Timestamp of the user's last login
    /// </summary>
    public DateTime? LastLoginAt { get; set; }

    /// <summary>
    /// When the user account was created
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// When the user account was last updated
    /// </summary>
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    /// <summary>
    /// Collection of roles assigned to this user
    /// </summary>
    public virtual ICollection<IHCAE.Api.Shared.Models.UserRole> UserRoles { get; set; } = new List<IHCAE.Api.Shared.Models.UserRole>();

    /// <summary>
    /// Extended profile information for alumni users
    /// </summary>
    public virtual AlumniProfile? AlumniProfile { get; set; }

    /// <summary>
    /// Refresh tokens for this user
    /// </summary>
    public virtual ICollection<UserRefreshToken> RefreshTokens { get; set; } = new List<UserRefreshToken>();

    /// <summary>
    /// Email verification tokens for this user
    /// </summary>
    public virtual ICollection<IHCAE.Api.Features.EmailVerification.Models.Entities.EmailVerificationToken> EmailVerificationTokens { get; set; } = new List<IHCAE.Api.Features.EmailVerification.Models.Entities.EmailVerificationToken>();

    /// <summary>
    /// Password reset tokens for this user
    /// </summary>
    public virtual ICollection<IHCAE.Api.Features.PasswordReset.Models.Entities.PasswordResetToken> PasswordResetTokens { get; set; } = new List<IHCAE.Api.Features.PasswordReset.Models.Entities.PasswordResetToken>();
}

/// <summary>
/// Enumeration of possible user statuses
/// </summary>
public enum UserStatus
{
    /// <summary>
    /// User registration is pending admin approval
    /// </summary>
    Pending = 0,

    /// <summary>
    /// User account is approved and active
    /// </summary>
    Approved = 1,

    /// <summary>
    /// User registration was rejected
    /// </summary>
    Rejected = 2
}


namespace IHCAE.Api.Features.Auth.Models.DTOs;

/// <summary>
/// DTO containing summary information about a user.
/// Used in API responses where full user details are not needed.
/// </summary>
public class UserSummaryDto
{
    /// <summary>
    /// User's unique identifier.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// User's first name.
    /// </summary>
    public string FirstName { get; set; } = string.Empty;

    /// <summary>
    /// User's last name.
    /// </summary>
    public string LastName { get; set; } = string.Empty;

    /// <summary>
    /// User's email address.
    /// </summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// User's account status.
    /// </summary>
    public string Status { get; set; } = string.Empty;

    /// <summary>
    /// Whether the user's email has been verified.
    /// </summary>
    public bool EmailVerified { get; set; }

    /// <summary>
    /// Date when the user account was created.
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Date of the user's last login (if any).
    /// </summary>
    public DateTime? LastLoginAt { get; set; }

    /// <summary>
    /// List of roles assigned to the user.
    /// </summary>
    public List<string> Roles { get; set; } = new();
}


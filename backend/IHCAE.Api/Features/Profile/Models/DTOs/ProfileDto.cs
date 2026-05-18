using System.ComponentModel.DataAnnotations;

namespace IHCAE.Api.Features.Profile.Models.DTOs;

/// <summary>
/// Data transfer object representing a complete user profile.
/// Combines User entity data with AlumniProfile information.
/// This DTO is used for API responses when returning profile data to the frontend.
/// </summary>
public class ProfileDto
{
    /// <summary>
    /// User's unique identifier (UUID)
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// User's first name
    /// </summary>
    public string FirstName { get; set; } = string.Empty;

    /// <summary>
    /// User's last name
    /// </summary>
    public string LastName { get; set; } = string.Empty;

    /// <summary>
    /// User's email address (used for login and contact)
    /// </summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// User's phone number (optional, for contact purposes)
    /// </summary>
    public string? Phone { get; set; }

    /// <summary>
    /// URL to the user's profile image
    /// Points to uploaded image in wwwroot/uploads/profiles/ directory
    /// </summary>
    public string? ProfileImageUrl { get; set; }

    /// <summary>
    /// Year the alumnus graduated from IHCAE
    /// Used for filtering and display in directory
    /// </summary>
    public string? Batch { get; set; }

    /// <summary>
    /// Course/program the alumnus completed at IHCAE
    /// Examples: "Advanced Mountaineering", "Eco-Tourism Management"
    /// </summary>
    public string? Course { get; set; }

    /// <summary>
    /// Personal biography or description
    /// Free-form text allowing users to describe themselves
    /// </summary>
    public string? Bio { get; set; }

    /// <summary>
    /// Current job title or position
    /// Examples: "Mountain Guide", "Eco-Tourism Coordinator"
    /// </summary>
    public string? JobTitle { get; set; }

    /// <summary>
    /// Current location (city, state, country)
    /// Examples: "Gangtok, Sikkim", "Kathmandu, Nepal"
    /// </summary>
    public string? Location { get; set; }

    /// <summary>
    /// Account status: "Pending", "Approved", or "Rejected"
    /// Only approved users can access directory features
    /// </summary>
    public string Status { get; set; } = string.Empty;

    /// <summary>
    /// Whether the user's email address has been verified
    /// Required for full account functionality
    /// </summary>
    public bool EmailVerified { get; set; }

    /// <summary>
    /// When the user account was created
    /// Used for "Member since" display
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// When the profile was last updated
    /// Helps track recent activity
    /// </summary>
    public DateTime? UpdatedAt { get; set; }
}


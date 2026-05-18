using System.ComponentModel.DataAnnotations;

namespace IHCAE.Api.Features.Profile.Models.DTOs;

/// <summary>
/// Request DTO for updating user profile information.
/// Contains only editable fields that users can modify through the profile page.
/// Excludes sensitive fields like email (requires separate process) and system fields like ID.
/// </summary>
public class UpdateProfileRequest
{
    /// <summary>
    /// Personal biography or description
    /// Allows users to write about themselves, their experience, and interests
    /// Maximum 2000 characters to prevent abuse while allowing detailed descriptions
    /// </summary>
    [MaxLength(2000, ErrorMessage = "Bio cannot exceed 2000 characters")]
    public string? Bio { get; set; }

    /// <summary>
    /// Current job title or position
    /// Examples: "Senior Mountain Guide", "Eco-Tourism Coordinator", "Conservation Officer"
    /// </summary>
    [MaxLength(255, ErrorMessage = "Job title cannot exceed 255 characters")]
    public string? JobTitle { get; set; }

    /// <summary>
    /// Current location (city, state, country)
    /// Examples: "Gangtok, Sikkim", "Kathmandu, Nepal", "Darjeeling, West Bengal"
    /// </summary>
    [MaxLength(255, ErrorMessage = "Location cannot exceed 255 characters")]
    public string? Location { get; set; }

    /// <summary>
    /// Course/program the alumnus completed at IHCAE
    /// Examples: "Advanced Mountaineering", "Eco-Tourism Management", "Wildlife Conservation"
    /// </summary>
    [MaxLength(255, ErrorMessage = "Course cannot exceed 255 characters")]
    public string? Course { get; set; }

    /// <summary>
    /// Year the alumnus graduated from IHCAE
    /// Used for filtering alumni by graduation year in directory
    /// Range validation ensures reasonable years (1950-2100)
    /// </summary>
    [Range(1950, 2100, ErrorMessage = "Graduation year must be between 1950 and 2100")]
    public string? Batch { get; set; }

    /// <summary>
    /// Phone number for contact purposes
    /// Optional field allowing alumni to share contact information
    /// Includes phone validation to ensure proper format
    /// </summary>
    [MaxLength(50, ErrorMessage = "Phone cannot exceed 50 characters")]
    [Phone(ErrorMessage = "Invalid phone number format")]
    public string? Phone { get; set; }
}


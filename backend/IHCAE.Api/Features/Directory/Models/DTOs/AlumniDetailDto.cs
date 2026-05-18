namespace IHCAE.Api.Features.Directory.Models.DTOs;

/// <summary>
/// Data Transfer Object for displaying detailed alumni profile information.
/// Contains comprehensive information for the alumni detail page.
/// Includes contact information and quick action capabilities.
/// Used when viewing a specific alumnus's full profile.
/// </summary>
public class AlumniDetailDto
{
    /// <summary>
    /// Unique identifier for the alumnus
    /// Used for API calls and navigation purposes
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// First name of the alumnus
    /// Displayed prominently on the profile page header
    /// </summary>
    public string FirstName { get; set; } = string.Empty;

    /// <summary>
    /// Last name of the alumnus
    /// Displayed prominently on the profile page header
    /// </summary>
    public string LastName { get; set; } = string.Empty;

    /// <summary>
    /// Email address for contact purposes
    /// Displayed directly on the profile for easy access
    /// Used for email quick action button
    /// </summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Phone number for contact purposes
    /// Displayed directly on the profile for easy access
    /// Used for call and WhatsApp quick action buttons
    /// </summary>
    public string? Phone { get; set; }

    /// <summary>
    /// URL to the alumnus's profile image
    /// Points to uploaded image in wwwroot/uploads/profiles/
    /// Displayed prominently on the profile page
    /// </summary>
    public string? ProfileImageUrl { get; set; }

    /// <summary>
    /// Year the alumnus graduated from IHCAE
    /// Displayed in the education section
    /// Used for filtering and display purposes
    /// Examples: 2020, 2021, 2022
    /// </summary>
    public string? Batch { get; set; }

    /// <summary>
    /// Course/program the alumnus completed at IHCAE
    /// Displayed in the education section
    /// Examples: "Advanced Mountaineering", "Eco-Tourism Management", "Wildlife Conservation"
    /// </summary>
    public string? Course { get; set; }

    /// <summary>
    /// Personal biography or description
    /// Displayed in the about section
    /// Contains detailed information about the alumnus's background and experience
    /// </summary>
    public string? Bio { get; set; }

    /// <summary>
    /// Current job title or position
    /// Displayed in the professional information section
    /// Examples: "Senior Mountain Guide", "Eco-Tourism Coordinator", "Conservation Officer"
    /// </summary>
    public string? JobTitle { get; set; }

    /// <summary>
    /// Current location (city, state, country)
    /// Displayed in the location section
    /// Examples: "Gangtok, Sikkim", "Kathmandu, Nepal", "Darjeeling, West Bengal"
    /// </summary>
    public string? Location { get; set; }

    /// <summary>
    /// Date when the alumnus joined the platform
    /// Displayed in the profile information section
    /// Used for sorting and display purposes
    /// </summary>
    public DateTime CreatedAt { get; set; }
}


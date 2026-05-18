namespace IHCAE.Api.Features.Directory.Models.DTOs;

/// <summary>
/// Data Transfer Object for displaying alumni information in directory cards.
/// Contains essential information needed for directory grid display.
/// Used in alumni directory listings and search results.
/// Optimized for performance with minimal data transfer.
/// </summary>
public class AlumniCardDto
{
    /// <summary>
    /// Unique identifier for the alumnus
    /// Used for navigation to detailed profile page and API calls
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// First name of the alumnus
    /// Displayed prominently on the card header
    /// </summary>
    public string FirstName { get; set; } = string.Empty;

    /// <summary>
    /// Last name of the alumnus
    /// Displayed prominently on the card header
    /// </summary>
    public string LastName { get; set; } = string.Empty;

    /// <summary>
    /// URL to the alumnus's profile image
    /// Points to uploaded image in wwwroot/uploads/profiles/
    /// Used for displaying profile picture on the card
    /// </summary>
    public string? ProfileImageUrl { get; set; }

    /// <summary>
    /// Year the alumnus graduated from IHCAE
    /// Used for filtering alumni by graduation year
    /// Examples: 2020, 2021, 2022
    /// </summary>
    public string? Batch { get; set; }

    /// <summary>
    /// Course/program the alumnus completed at IHCAE
    /// Used for filtering alumni by course
    /// Examples: "Advanced Mountaineering", "Eco-Tourism Management", "Wildlife Conservation"
    /// </summary>
    public string? Course { get; set; }

    /// <summary>
    /// Current job title or position
    /// Displayed on the card to show alumnus's current role
    /// Examples: "Senior Mountain Guide", "Eco-Tourism Coordinator", "Conservation Officer"
    /// </summary>
    public string? JobTitle { get; set; }

    /// <summary>
    /// Current location (city, state, country)
    /// Displayed on the card to show alumnus's current location
    /// Examples: "Gangtok, Sikkim", "Kathmandu, Nepal", "Darjeeling, West Bengal"
    /// </summary>
    public string? Location { get; set; }
}


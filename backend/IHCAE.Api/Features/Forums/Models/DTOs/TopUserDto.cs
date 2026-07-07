using IHCAE.Api.Shared.DTOs;

namespace IHCAE.Api.Features.Forums.Models.DTOs;

/// <summary>
/// DTO for top users in the forum based on engagement
/// </summary>
public class TopUserDto
{
    /// <summary>
    /// User ID
    /// </summary>
    public int UserId { get; set; }

    /// <summary>
    /// User's first name
    /// </summary>
    public string FirstName { get; set; } = string.Empty;

    /// <summary>
    /// User's last name
    /// </summary>
    public string LastName { get; set; } = string.Empty;

    /// <summary>
    /// Profile image URL
    /// </summary>
    public string? ProfileImageUrl { get; set; }

    /// <summary>
    /// Total number of likes received across all posts
    /// </summary>
    public int TotalLikes { get; set; }

    /// <summary>
    /// Total number of posts created
    /// </summary>
    public int PostCount { get; set; }
}

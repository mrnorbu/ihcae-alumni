namespace IHCAE.Api.Features.Profile.Models.DTOs;

/// <summary>
/// Response DTO returned after successful profile update.
/// Provides confirmation message and the updated profile data for frontend consumption.
/// </summary>
public class UpdateProfileResponse
{
    /// <summary>
    /// Success message confirming the profile update operation
    /// Used by frontend to display confirmation to user
    /// </summary>
    public string Message { get; set; } = "Profile updated successfully";

    /// <summary>
    /// The updated profile data containing all current profile information
    /// Allows frontend to immediately update UI without additional API call
    /// </summary>
    public ProfileDto Profile { get; set; } = null!;
}


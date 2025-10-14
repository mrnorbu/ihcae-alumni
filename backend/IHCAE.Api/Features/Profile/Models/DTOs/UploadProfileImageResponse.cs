namespace IHCAE.Api.Features.Profile.Models.DTOs;

/// <summary>
/// Response DTO returned after successful profile image upload.
/// Provides confirmation message and the URL to access the uploaded image.
/// </summary>
public class UploadProfileImageResponse
{
    /// <summary>
    /// Success message confirming the image upload operation
    /// Used by frontend to display confirmation to user
    /// </summary>
    public string Message { get; set; } = "Profile image uploaded successfully";

    /// <summary>
    /// URL to access the uploaded profile image
    /// Points to the file in wwwroot/uploads/profiles/ directory
    /// Frontend can immediately use this URL to display the new image
    /// </summary>
    public string ProfileImageUrl { get; set; } = string.Empty;
}


using IHCAE.Api.Features.Profile.Models.DTOs;

namespace IHCAE.Api.Features.Profile.Services;

/// <summary>
/// Service interface for managing user profile operations.
/// Provides methods for retrieving, updating, and managing user profile data.
/// Handles both User entity and AlumniProfile entity operations.
/// </summary>
public interface IProfileService
{
    /// <summary>
    /// Gets the complete profile for the specified user.
    /// Combines User entity data with AlumniProfile information.
    /// Used by the profile page to display all user information.
    /// </summary>
    /// <param name="userId">The user ID to retrieve profile for</param>
    /// <returns>The user's complete profile data</returns>
    /// <exception cref="KeyNotFoundException">Thrown when user is not found</exception>
    Task<ProfileDto> GetProfileAsync(Guid userId);

    /// <summary>
    /// Updates the profile information for the specified user.
    /// Only updates editable fields (bio, job title, location, etc.).
    /// Creates AlumniProfile if it doesn't exist.
    /// </summary>
    /// <param name="userId">The user ID to update profile for</param>
    /// <param name="request">The profile update request containing new values</param>
    /// <returns>The updated profile data</returns>
    /// <exception cref="KeyNotFoundException">Thrown when user is not found</exception>
    Task<ProfileDto> UpdateProfileAsync(Guid userId, UpdateProfileRequest request);

    /// <summary>
    /// Updates the profile image URL for the specified user.
    /// Used after successful image upload to link the image to the user's profile.
    /// Creates AlumniProfile if it doesn't exist.
    /// </summary>
    /// <param name="userId">The user ID to update image for</param>
    /// <param name="imageUrl">The URL to the uploaded image</param>
    /// <returns>The updated profile data with new image URL</returns>
    /// <exception cref="KeyNotFoundException">Thrown when user is not found</exception>
    Task<ProfileDto> UpdateProfileImageAsync(Guid userId, string imageUrl);
}


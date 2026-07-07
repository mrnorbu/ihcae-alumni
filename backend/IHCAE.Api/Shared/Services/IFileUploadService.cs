namespace IHCAE.Api.Shared.Services;

/// <summary>
/// Service interface for handling file uploads to local storage.
/// Provides methods for uploading profile images and content images with validation.
/// In production, this would be replaced with cloud storage (AWS S3, Azure Blob, etc.).
/// </summary>
public interface IFileUploadService
{
    /// <summary>
    /// Uploads a profile image file and returns the URL.
    /// Validates file type, size, and generates unique filename to prevent conflicts.
    /// Stores files in wwwroot/uploads/profiles/ directory for serving via static files.
    /// </summary>
    /// <param name="file">The uploaded file from HTTP form data</param>
    /// <param name="userId">The user ID (used for unique filename generation)</param>
    /// <returns>The URL to access the uploaded file (relative path from wwwroot)</returns>
    Task<string> UploadProfileImageAsync(IFormFile file, int userId);

    /// <summary>
    /// Uploads a content image (for news, events, etc.) and returns the URL.
    /// Used by administrators for uploading images for news articles and events.
    /// Stores files in wwwroot/uploads/content/{contentType}/ directory.
    /// </summary>
    /// <param name="file">The uploaded file from HTTP form data</param>
    /// <param name="contentType">Type of content (news, event, story)</param>
    /// <returns>The URL to access the uploaded file (relative path from wwwroot)</returns>
    Task<string> UploadContentImageAsync(IFormFile file, string contentType);

    /// <summary>
    /// Deletes a file from storage.
    /// Used for cleanup when users change profile images or admins remove content.
    /// </summary>
    /// <param name="fileUrl">The URL of the file to delete (relative path from wwwroot)</param>
    Task DeleteFileAsync(string fileUrl);

    /// <summary>
    /// Validates that the uploaded file is an image and within size limits.
    /// Checks file extension, MIME type, and file size to prevent security issues.
    /// </summary>
    /// <param name="file">The file to validate</param>
    /// <param name="maxSizeInMb">Maximum file size in megabytes (default: 5MB)</param>
    /// <returns>True if valid, throws exception otherwise</returns>
    void ValidateImageFile(IFormFile file, int maxSizeInMb = 5);
    
    /// <summary>
    /// Gets the thumbnail URL for a content image.
    /// Converts the full image URL to its thumbnail version.
    /// </summary>
    /// <param name="imageUrl">The full image URL</param>
    /// <returns>Thumbnail URL</returns>
    string GetThumbnailUrl(string imageUrl);
}


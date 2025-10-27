using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;
using SixLabors.ImageSharp.Formats.Webp;

namespace IHCAE.Api.Shared.Services;

/// <summary>
/// Service for handling file uploads to local block storage.
/// In production, this would be configured to use a CDN or cloud storage.
/// Currently stores files in wwwroot/uploads/ directory structure.
/// 
/// Features:
/// - Automatic WebP conversion for optimal file size
/// - Thumbnail generation for content images
/// - File type validation (only images)
/// - File size limits (5MB max)
/// - Unique filename generation to prevent conflicts
/// - MIME type validation to prevent malicious uploads
/// </summary>
public class FileUploadService : IFileUploadService
{
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<FileUploadService> _logger;
    private readonly string _uploadsPath;
    
    // Image processing settings
    private const int ThumbnailWidth = 400;
    private const int ThumbnailHeight = 300;
    private const int MaxImageWidth = 1920;
    private const int MaxImageHeight = 1080;
    private const int WebPQuality = 85;
    
    // Allowed image file extensions for validation
    private static readonly string[] AllowedImageExtensions = { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
    
    // Allowed MIME types for validation (prevents malicious file uploads)
    private static readonly string[] AllowedImageMimeTypes = { "image/jpeg", "image/png", "image/gif", "image/webp" };

    /// <summary>
    /// Initializes the FileUploadService with environment and logger dependencies.
    /// Sets up the uploads directory path and ensures it exists.
    /// </summary>
    /// <param name="environment">Web host environment for accessing wwwroot path</param>
    /// <param name="logger">Logger for tracking upload operations</param>
    public FileUploadService(IWebHostEnvironment environment, ILogger<FileUploadService> logger)
    {
        _environment = environment;
        _logger = logger;
        
        // Set up uploads directory path relative to wwwroot
        _uploadsPath = Path.Combine(_environment.ContentRootPath, "wwwroot", "uploads");
        
        // Ensure uploads directory exists
        if (!Directory.Exists(_uploadsPath))
        {
            Directory.CreateDirectory(_uploadsPath);
            _logger.LogInformation("Created uploads directory at {Path}", _uploadsPath);
        }
    }

    /// <summary>
    /// Validates uploaded image file for security and size constraints.
    /// Throws ArgumentException if validation fails.
    /// </summary>
    /// <param name="file">The file to validate</param>
    /// <param name="maxSizeInMb">Maximum file size in megabytes (default: 5MB)</param>
    public void ValidateImageFile(IFormFile file, int maxSizeInMb = 5)
    {
        // Check if file is provided and not empty
        if (file == null || file.Length == 0)
        {
            throw new ArgumentException("File is empty or not provided");
        }

        // Check file size against maximum allowed
        var maxSizeInBytes = maxSizeInMb * 1024 * 1024;
        if (file.Length > maxSizeInBytes)
        {
            throw new ArgumentException($"File size exceeds maximum allowed size of {maxSizeInMb}MB");
        }

        // Check file extension against allowed list
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!AllowedImageExtensions.Contains(extension))
        {
            throw new ArgumentException($"File type not allowed. Allowed types: {string.Join(", ", AllowedImageExtensions)}");
        }

        // Check MIME type against allowed list (prevents malicious uploads)
        if (!AllowedImageMimeTypes.Contains(file.ContentType.ToLowerInvariant()))
        {
            throw new ArgumentException($"Invalid image MIME type. Allowed types: {string.Join(", ", AllowedImageMimeTypes)}");
        }
    }

    /// <summary>
    /// Uploads a profile image for a specific user.
    /// Converts to WebP format and resizes if needed.
    /// </summary>
    /// <param name="file">The image file to upload</param>
    /// <param name="userId">The user ID for filename generation</param>
    /// <returns>Relative URL path for accessing the uploaded image</returns>
    public async Task<string> UploadProfileImageAsync(IFormFile file, Guid userId)
    {
        // Validate the uploaded file
        ValidateImageFile(file);

        // Create profile images subdirectory
        var profileImagesPath = Path.Combine(_uploadsPath, "profiles");
        if (!Directory.Exists(profileImagesPath))
        {
            Directory.CreateDirectory(profileImagesPath);
        }

        // Generate unique filename with .webp extension
        var uniqueFileName = $"{userId}_{Guid.NewGuid()}.webp";
        var filePath = Path.Combine(profileImagesPath, uniqueFileName);

        // Load, process, and save image as WebP
        using (var image = await Image.LoadAsync(file.OpenReadStream()))
        {
            // Resize if image is too large
            if (image.Width > MaxImageWidth || image.Height > MaxImageHeight)
            {
                image.Mutate(x => x.Resize(new ResizeOptions
                {
                    Size = new Size(MaxImageWidth, MaxImageHeight),
                    Mode = ResizeMode.Max
                }));
            }

            // Save as WebP with quality setting
            var encoder = new WebpEncoder { Quality = WebPQuality };
            await image.SaveAsync(filePath, encoder);
        }

        _logger.LogInformation("Uploaded and converted profile image for user {UserId} to WebP at {FilePath}", userId, filePath);

        // Return relative URL
        return $"/uploads/profiles/{uniqueFileName}";
    }

    /// <summary>
    /// Uploads a content image for news, events, or success stories.
    /// Converts to WebP format and generates a thumbnail.
    /// </summary>
    /// <param name="file">The image file to upload</param>
    /// <param name="contentType">Type of content (news, event, story)</param>
    /// <returns>Relative URL path for accessing the uploaded image</returns>
    public async Task<string> UploadContentImageAsync(IFormFile file, string contentType)
    {
        // Validate the uploaded file
        ValidateImageFile(file);

        // Create content images subdirectory with content type
        var contentImagesPath = Path.Combine(_uploadsPath, "content", contentType);
        if (!Directory.Exists(contentImagesPath))
        {
            Directory.CreateDirectory(contentImagesPath);
        }

        // Generate unique filename with .webp extension
        var baseFileName = $"{contentType}_{Guid.NewGuid()}";
        var uniqueFileName = $"{baseFileName}.webp";
        var thumbnailFileName = $"{baseFileName}_thumb.webp";
        
        var filePath = Path.Combine(contentImagesPath, uniqueFileName);
        var thumbnailPath = Path.Combine(contentImagesPath, thumbnailFileName);

        // Load and process full-size image
        using (var imageStream = file.OpenReadStream())
        {
            using (var image = await Image.LoadAsync(imageStream))
            {
                // Resize if too large
                if (image.Width > MaxImageWidth || image.Height > MaxImageHeight)
                {
                    image.Mutate(x => x.Resize(new ResizeOptions
                    {
                        Size = new Size(MaxImageWidth, MaxImageHeight),
                        Mode = ResizeMode.Max
                    }));
                }

                var encoder = new WebpEncoder { Quality = WebPQuality };
                await image.SaveAsync(filePath, encoder);
            }
        }

        // Load again for thumbnail generation
        using (var thumbnailStream = file.OpenReadStream())
        {
            using (var thumbnail = await Image.LoadAsync(thumbnailStream))
            {
                thumbnail.Mutate(x => x.Resize(new ResizeOptions
                {
                    Size = new Size(ThumbnailWidth, ThumbnailHeight),
                    Mode = ResizeMode.Crop
                }));

                var thumbnailEncoder = new WebpEncoder { Quality = WebPQuality };
                await thumbnail.SaveAsync(thumbnailPath, thumbnailEncoder);
            }
        }

        _logger.LogInformation("Uploaded and converted {ContentType} image to WebP at {FilePath} with thumbnail", contentType, filePath);

        // Return relative URL for full image
        return $"/uploads/content/{contentType}/{uniqueFileName}";
    }
    
    /// <summary>
    /// Gets the thumbnail URL for a content image.
    /// </summary>
    /// <param name="imageUrl">The full image URL</param>
    /// <returns>Thumbnail URL</returns>
    public string GetThumbnailUrl(string imageUrl)
    {
        if (string.IsNullOrEmpty(imageUrl))
            return imageUrl;
            
        // Replace .webp with _thumb.webp
        return imageUrl.Replace(".webp", "_thumb.webp");
    }

    /// <summary>
    /// Deletes a file from storage.
    /// Used for cleanup when users change profile images or content is removed.
    /// </summary>
    /// <param name="fileUrl">The URL of the file to delete</param>
    public Task DeleteFileAsync(string fileUrl)
    {
        try
        {
            // Convert URL to file path
            var relativePath = fileUrl.TrimStart('/');
            var filePath = Path.Combine(_environment.ContentRootPath, "wwwroot", relativePath);

            // Delete file if it exists
            if (File.Exists(filePath))
            {
                File.Delete(filePath);
                _logger.LogInformation("Deleted file at {FilePath}", filePath);
            }
            else
            {
                _logger.LogWarning("Attempted to delete non-existent file at {FilePath}", filePath);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting file {FileUrl}", fileUrl);
            throw;
        }

        return Task.CompletedTask;
    }
}


namespace IHCAE.Api.Shared.Services;

/// <summary>
/// Service for generating absolute URLs for resources.
/// Converts relative paths to full URLs using the configured base URL.
/// </summary>
public interface IUrlHelperService
{
    /// <summary>
    /// Converts a relative URL to an absolute URL.
    /// </summary>
    /// <param name="relativePath">The relative path (e.g., "/uploads/profiles/image.png")</param>
    /// <returns>The absolute URL (e.g., "http://localhost:5041/uploads/profiles/image.png")</returns>
    string GetAbsoluteUrl(string? relativePath);
}

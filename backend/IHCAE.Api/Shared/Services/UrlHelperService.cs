using Microsoft.Extensions.Configuration;

namespace IHCAE.Api.Shared.Services;

/// <summary>
/// Service for generating absolute URLs for resources.
/// Automatically detects the base URL from the current HTTP request,
/// making it work seamlessly across dev, staging, and production environments.
/// </summary>
public class UrlHelperService : IUrlHelperService
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IConfiguration _configuration;
    private readonly ILogger<UrlHelperService> _logger;

    public UrlHelperService(
        IHttpContextAccessor httpContextAccessor,
        IConfiguration configuration,
        ILogger<UrlHelperService> logger)
    {
        _httpContextAccessor = httpContextAccessor;
        _configuration = configuration;
        _logger = logger;
    }

    /// <summary>
    /// Converts a relative URL to an absolute URL using the current request's base URL.
    /// Automatically works in any environment (dev, staging, prod).
    /// </summary>
    /// <param name="relativePath">The relative path (e.g., "/uploads/profiles/image.png")</param>
    /// <returns>The absolute URL (e.g., "https://api.example.com/uploads/profiles/image.png")</returns>
    public string GetAbsoluteUrl(string? relativePath)
    {
        // Return empty string for null/empty paths
        if (string.IsNullOrWhiteSpace(relativePath))
        {
            return string.Empty;
        }

        // If already an absolute URL, return as-is
        if (relativePath.StartsWith("http://", StringComparison.OrdinalIgnoreCase) ||
            relativePath.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
        {
            return relativePath;
        }

        // Get the current HTTP context
        var httpContext = _httpContextAccessor.HttpContext;
        
        if (httpContext == null)
        {
            _logger.LogWarning("HttpContext is null, returning relative path: {RelativePath}", relativePath);
            return relativePath;
        }

        // Build the base URL from the current request
        var request = httpContext.Request;
        var scheme = request.Scheme; // http or https
        var host = request.Host.Value; // includes port if non-standard
        
        // Ensure relative path starts with /
        var normalizedPath = relativePath.StartsWith("/") ? relativePath : $"/{relativePath}";
        
        // Combine to create absolute URL
        var absoluteUrl = $"{scheme}://{host}{normalizedPath}";
        
        return absoluteUrl;
    }

    /// <summary>
    /// Gets the frontend base URL dynamically from the current request origin/referer or configuration fallback.
    /// </summary>
    /// <returns>The frontend base URL (e.g., "https://ihcae.argiasolutions.website")</returns>
    public string GetFrontendUrl()
    {
        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext != null)
        {
            var request = httpContext.Request;
            
            // 1. Try to read the Origin header (sent by modern browsers for CORS requests)
            var origin = request.Headers["Origin"].ToString();
            if (!string.IsNullOrWhiteSpace(origin))
            {
                return origin.TrimEnd('/');
            }

            // 2. Try to read the Referer header
            var referer = request.Headers["Referer"].ToString();
            if (!string.IsNullOrWhiteSpace(referer))
            {
                try
                {
                    var uri = new Uri(referer);
                    return $"{uri.Scheme}://{uri.Authority}".TrimEnd('/');
                }
                catch (UriFormatException)
                {
                    // Ignore malformed referers
                }
            }
        }

        // 3. Fallback to FrontendUrl configured in appsettings (e.g., Production or Base configuration)
        var configuredUrl = _configuration["FrontendUrl"];
        if (!string.IsNullOrWhiteSpace(configuredUrl))
        {
            return configuredUrl.TrimEnd('/');
        }

        // 4. Absolute fallback for local development
        return "http://localhost:4200";
    }
}

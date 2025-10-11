namespace IHCAE.Api.Shared.DTOs;

/// <summary>
/// Standard error response DTO for API error handling.
/// Provides consistent error response format across all endpoints.
/// </summary>
public class ErrorResponse
{
    /// <summary>
    /// HTTP status code.
    /// </summary>
    public int StatusCode { get; set; }

    /// <summary>
    /// Error message describing what went wrong.
    /// </summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// List of specific validation errors (if applicable).
    /// </summary>
    public List<string>? Errors { get; set; }

    /// <summary>
    /// Timestamp when the error occurred.
    /// </summary>
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}


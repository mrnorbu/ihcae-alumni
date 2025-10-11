namespace IHCAE.Api.Features.Auth.Models.DTOs;

/// <summary>
/// Response DTO for successful login.
/// Contains authentication token and user information.
/// </summary>
public class LoginResponse
{
    /// <summary>
    /// Whether the login was successful.
    /// </summary>
    public bool Success { get; set; }

    /// <summary>
    /// JWT access token for API authentication.
    /// </summary>
    public string Token { get; set; } = string.Empty;

    /// <summary>
    /// Summary information about the authenticated user.
    /// </summary>
    public UserSummaryDto User { get; set; } = null!;
}


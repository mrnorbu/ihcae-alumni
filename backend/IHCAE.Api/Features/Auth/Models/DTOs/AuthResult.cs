using IHCAE.Api.Features.Auth.Models.Entities;

namespace IHCAE.Api.Features.Auth.Models.DTOs;

/// <summary>
/// Result object returned from authentication operations.
/// </summary>
public class AuthResult
{
    /// <summary>
    /// Whether the authentication was successful.
    /// </summary>
    public bool Success { get; set; }

    /// <summary>
    /// The authenticated user (if successful).
    /// </summary>
    public User? User { get; set; }

    /// <summary>
    /// The JWT access token (if successful).
    /// </summary>
    public string? AccessToken { get; set; }

    /// <summary>
    /// The refresh token (if successful).
    /// </summary>
    public string? RefreshToken { get; set; }

    /// <summary>
    /// Error message if authentication failed.
    /// </summary>
    public string? ErrorMessage { get; set; }
}


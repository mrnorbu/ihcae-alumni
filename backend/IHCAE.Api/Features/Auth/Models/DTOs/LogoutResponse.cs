namespace IHCAE.Api.Features.Auth.Models.DTOs;

/// <summary>
/// Response DTO for successful logout.
/// Contains confirmation of logout operation.
/// </summary>
public class LogoutResponse
{
    /// <summary>
    /// Whether the logout was successful.
    /// </summary>
    public bool Success { get; set; }

    /// <summary>
    /// Confirmation message.
    /// </summary>
    public string Message { get; set; } = string.Empty;
}


namespace IHCAE.Api.Features.Auth.Models.DTOs;

/// <summary>
/// Response DTO for successful registration.
/// Contains confirmation details for the newly registered user.
/// </summary>
public class RegisterResponse
{
    /// <summary>
    /// Whether the registration was successful.
    /// </summary>
    public bool Success { get; set; }

    /// <summary>
    /// Confirmation message for the user.
    /// </summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// The ID of the created user.
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// The status of the user account.
    /// </summary>
    public string Status { get; set; } = string.Empty;
}


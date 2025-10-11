namespace IHCAE.Api.Features.Admin.Models.DTOs;

/// <summary>
/// Response DTO for admin actions (approve/reject).
/// Contains confirmation details for administrative operations.
/// </summary>
public class AdminActionResponse
{
    /// <summary>
    /// Whether the action was successful.
    /// </summary>
    public bool Success { get; set; }

    /// <summary>
    /// Confirmation message for the action.
    /// </summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// The ID of the user affected by the action.
    /// </summary>
    public Guid UserId { get; set; }
}


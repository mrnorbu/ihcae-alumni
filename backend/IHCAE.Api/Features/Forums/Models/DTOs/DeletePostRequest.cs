using System.ComponentModel.DataAnnotations;

namespace IHCAE.Api.Features.Forums.Models.DTOs;

/// <summary>
/// Request DTO for deleting a post (Admin only).
/// </summary>
public class DeletePostRequest
{
    /// <summary>
    /// Reason for deleting the post.
    /// </summary>
    [Required]
    [MaxLength(500)]
    public string Reason { get; set; } = string.Empty;
}


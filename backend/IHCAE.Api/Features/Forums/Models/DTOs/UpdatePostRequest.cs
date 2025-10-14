using System.ComponentModel.DataAnnotations;

namespace IHCAE.Api.Features.Forums.Models.DTOs;

/// <summary>
/// Request model for updating an existing post (admin only)
/// </summary>
public class UpdatePostRequest
{
    /// <summary>
    /// Updated content for the post
    /// </summary>
    [Required(ErrorMessage = "Post content is required")]
    [MinLength(1, ErrorMessage = "Content cannot be empty")]
    public string Content { get; set; } = string.Empty;
}



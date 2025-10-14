using System.ComponentModel.DataAnnotations;

namespace IHCAE.Api.Features.Forums.Models.DTOs;

/// <summary>
/// Request model for creating a new discussion topic
/// </summary>
public class CreateTopicRequest
{
    /// <summary>
    /// Title of the discussion topic
    /// </summary>
    [Required(ErrorMessage = "Topic title is required")]
    [MaxLength(255, ErrorMessage = "Title cannot exceed 255 characters")]
    [MinLength(5, ErrorMessage = "Title must be at least 5 characters")]
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Content of the first post in the topic
    /// </summary>
    [Required(ErrorMessage = "Post content is required")]
    [MinLength(10, ErrorMessage = "Content must be at least 10 characters")]
    public string Content { get; set; } = string.Empty;

    /// <summary>
    /// List of tags to associate with the topic (max 5)
    /// </summary>
    [MaxLength(5, ErrorMessage = "Maximum 5 tags allowed")]
    public List<string> Tags { get; set; } = new List<string>();
}


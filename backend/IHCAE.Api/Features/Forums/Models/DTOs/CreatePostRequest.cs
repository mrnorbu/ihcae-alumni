namespace IHCAE.Api.Features.Forums.Models.DTOs;

/// <summary>
/// Request model for creating a new post or reply
/// </summary>
public class CreatePostRequest
{
    /// <summary>
    /// Content of the post
    /// </summary>
    public string Content { get; set; } = string.Empty;

    /// <summary>
    /// ID of the parent post (null for top-level posts)
    /// </summary>
    public Guid? ParentPostId { get; set; }
}

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
    public int? ParentPostId { get; set; }

    /// <summary>
    /// Optional list of user IDs mentioned in this post
    /// </summary>
    public List<int>? MentionedUserIds { get; set; }
}

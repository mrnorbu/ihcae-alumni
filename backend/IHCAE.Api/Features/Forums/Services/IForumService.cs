using IHCAE.Api.Features.Forums.Models.DTOs;
using IHCAE.Api.Shared.DTOs;

namespace IHCAE.Api.Features.Forums.Services;

/// <summary>
/// Interface for forum operations.
/// Defines methods for managing discussion topics, posts, and interactions.
/// </summary>
public interface IForumService
{
    /// <summary>
    /// Gets a paginated list of discussion topics.
    /// </summary>
    Task<PaginatedResult<TopicSummaryDto>> GetTopicsAsync(int page = 1, int pageSize = 20, List<string>? tags = null);

    /// <summary>
    /// Gets a single topic with all its posts.
    /// </summary>
    Task<TopicDetailDto> GetTopicByIdAsync(Guid topicId, Guid currentUserId);

    /// <summary>
    /// Creates a new discussion topic with an initial post.
    /// </summary>
    Task<TopicDetailDto> CreateTopicAsync(Guid userId, string title, string content, List<string>? tags = null);

    /// <summary>
    /// Creates a new post or reply in a topic.
    /// </summary>
    Task<PostDto> CreatePostAsync(Guid topicId, Guid userId, string content, Guid? parentPostId = null);

    /// <summary>
    /// Adds a like to a post.
    /// </summary>
    Task<bool> LikePostAsync(Guid postId, Guid userId);

    /// <summary>
    /// Removes a like from a post.
    /// </summary>
    Task<bool> UnlikePostAsync(Guid postId, Guid userId);

    /// <summary>
    /// Soft deletes a post (user can only delete their own posts).
    /// </summary>
    Task<bool> DeleteOwnPostAsync(Guid postId, Guid userId);

    /// <summary>
    /// Updates a post (Admin only).
    /// </summary>
    Task<PostDto> UpdatePostAsync(Guid postId, string content, Guid adminUserId);

    /// <summary>
    /// Deletes a topic (soft delete, admin only).
    /// </summary>
    Task<bool> DeleteTopicAsync(Guid topicId, Guid adminUserId);

    /// <summary>
    /// Toggles pin status for a topic (admin only).
    /// </summary>
    Task<bool> TogglePinTopicAsync(Guid topicId, Guid adminUserId);

    /// <summary>
    /// Toggles lock status for a topic (admin only).
    /// </summary>
    Task<bool> ToggleLockTopicAsync(Guid topicId, Guid adminUserId);

    /// <summary>
    /// Deletes a post as admin with audit trail (soft delete).
    /// </summary>
    Task<bool> DeletePostAsAdminAsync(Guid postId, Guid adminUserId, string reason);
}

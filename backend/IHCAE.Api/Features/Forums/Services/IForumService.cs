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
    Task<PaginatedResult<TopicSummaryDto>> GetTopicsAsync(int currentUserId, int page = 1, int pageSize = 20, List<string>? tags = null, string? search = null, int? authorId = null, string sortBy = "recent");

    /// <summary>
    /// Gets a single topic with all its posts.
    /// </summary>
    Task<TopicDetailDto> GetTopicByIdAsync(int topicId, int currentUserId);

    /// <summary>
    /// Creates a new discussion topic with an initial post.
    /// </summary>
    Task<TopicDetailDto> CreateTopicAsync(int userId, string title, string content, List<string>? tags = null);

    /// <summary>
    /// Creates a new post or reply in a topic.
    /// </summary>
    Task<PostDto> CreatePostAsync(int topicId, int userId, string content, int? parentPostId = null, List<int>? mentionedUserIds = null);

    /// <summary>
    /// Adds a like to a post.
    /// </summary>
    Task<bool> LikePostAsync(int postId, int userId);

    /// <summary>
    /// Removes a like from a post.
    /// </summary>
    Task<bool> UnlikePostAsync(int postId, int userId);

    /// <summary>
    /// Soft deletes a post (user can only delete their own posts).
    /// </summary>
    Task<bool> DeleteOwnPostAsync(int postId, int userId);

    /// <summary>
    /// Updates a post (Admin only).
    /// </summary>
    Task<PostDto> UpdatePostAsync(int postId, string content, int adminUserId);

    /// <summary>
    /// Deletes a topic (soft delete, admin only).
    /// </summary>
    Task<bool> DeleteTopicAsync(int topicId, int adminUserId);

    /// <summary>
    /// Toggles pin status for a topic (admin only).
    /// </summary>
    Task<bool> TogglePinTopicAsync(int topicId, int adminUserId);

    /// <summary>
    /// Toggles lock status for a topic (admin only).
    /// </summary>
    Task<bool> ToggleLockTopicAsync(int topicId, int adminUserId);

    /// <summary>
    /// Deletes a post as admin with audit trail (soft delete).
    /// </summary>
    Task<bool> DeletePostAsAdminAsync(int postId, int adminUserId, string reason);

    /// <summary>
    /// Restores a soft-deleted post (Admin only).
    /// </summary>
    Task<bool> RestorePostAsync(int postId, int adminUserId);

    /// <summary>
    /// Gets top users by engagement (likes received).
    /// </summary>
    Task<List<TopUserDto>> GetTopUsersAsync(int limit = 5);
}

using Microsoft.EntityFrameworkCore;
using IHCAE.Api.Features.Forums.Models.Entities;
using IHCAE.Api.Features.Forums.Models.DTOs;
using IHCAE.Api.Shared.Data;
using IHCAE.Api.Shared.DTOs;
using IHCAE.Api.Shared.Services;

namespace IHCAE.Api.Features.Forums.Services;

/// <summary>
/// Service implementation for forum operations.
/// Handles business logic for topics, posts, and likes.
/// </summary>
public class ForumService : IForumService
{
    private readonly AppDbContext _context;
    private readonly ILogger<ForumService> _logger;
    private readonly ITagService _tagService;

    public ForumService(AppDbContext context, ILogger<ForumService> logger, ITagService tagService)
    {
        _context = context;
        _logger = logger;
        _tagService = tagService;
    }

    /// <summary>
    /// Gets a paginated list of discussion topics sorted by recent activity.
    /// Pinned topics appear first, then sorted by most recent post activity.
    /// </summary>
    public async Task<PaginatedResult<TopicSummaryDto>> GetTopicsAsync(int page = 1, int pageSize = 20, List<string>? tags = null)
    {
        if (page < 1) page = 1;
        if (pageSize < 1 || pageSize > 100) pageSize = 20;

        var query = _context.DiscussionTopics
            .Include(t => t.CreatedBy)
                .ThenInclude(u => u.AlumniProfile)
            .Include(t => t.Posts)
            .Include(t => t.TopicTags)
                .ThenInclude(tt => tt.Tag)
            .AsQueryable();

        // Filter by tags if provided (OR logic)
        if (tags != null && tags.Any())
        {
            var normalizedTags = tags.Select(t => t.ToLower()).ToList();
            query = query.Where(t => t.TopicTags.Any(tt => normalizedTags.Contains(tt.Tag.Name.ToLower())));
        }

        var totalCount = await query.CountAsync();

        var topics = await query
            .OrderByDescending(t => t.IsPinned)
            .ThenByDescending(t => t.Posts.Max(p => (DateTime?)p.CreatedAt) ?? t.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(t => new TopicSummaryDto
            {
                Id = t.Id,
                Title = t.Title,
                CreatedBy = new AuthorDto
                {
                    Id = t.CreatedBy.Id,
                    FirstName = t.CreatedBy.FirstName,
                    LastName = t.CreatedBy.LastName,
                    ProfileImageUrl = t.CreatedBy.AlumniProfile != null ? t.CreatedBy.AlumniProfile.ProfileImageUrl : null
                },
                PostCount = t.Posts.Count,
                LastReplyAt = t.Posts.Max(p => (DateTime?)p.CreatedAt),
                IsPinned = t.IsPinned,
                IsLocked = t.IsLocked,
                CreatedAt = t.CreatedAt,
                Tags = t.TopicTags.Select(tt => new TagDto
                {
                    Id = tt.Tag.Id,
                    Name = tt.Tag.Name,
                    Slug = tt.Tag.Slug,
                    UsageCount = tt.Tag.UsageCount
                }).ToList()
            })
            .ToListAsync();

        return new PaginatedResult<TopicSummaryDto>
        {
            Items = topics,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    /// <summary>
    /// Gets a single topic with all its posts in nested structure.
    /// Includes author info, like counts, and nested replies (1 level deep).
    /// </summary>
    public async Task<TopicDetailDto> GetTopicByIdAsync(Guid topicId, Guid currentUserId)
    {
        var topic = await _context.DiscussionTopics
            .Include(t => t.CreatedBy)
                .ThenInclude(u => u.AlumniProfile)
            .Include(t => t.TopicTags)
                .ThenInclude(tt => tt.Tag)
            .FirstOrDefaultAsync(t => t.Id == topicId);

        if (topic == null)
        {
            throw new KeyNotFoundException($"Topic with ID {topicId} not found");
        }

        // Load posts separately to avoid complex Include issues
        var posts = await _context.ForumPosts
            .Include(p => p.Author)
                .ThenInclude(a => a.AlumniProfile)
            .Include(p => p.Likes)
            .Where(p => p.TopicId == topicId && p.ParentPostId == null && !p.IsDeleted)
            .OrderBy(p => p.CreatedAt)
            .ToListAsync();

        // Load replies for each post
        var postIds = posts.Select(p => p.Id).ToList();
        var replies = await _context.ForumPosts
            .Include(p => p.Author)
                .ThenInclude(a => a.AlumniProfile)
            .Include(p => p.Likes)
            .Where(p => postIds.Contains(p.ParentPostId!.Value) && !p.IsDeleted)
            .ToListAsync();

        // Map posts to DTOs
        var topLevelPosts = posts.Select(p => MapToPostDto(p, currentUserId, replies.Where(r => r.ParentPostId == p.Id).ToList())).ToList();

        return new TopicDetailDto
        {
            Id = topic.Id,
            Title = topic.Title,
            CreatedBy = new AuthorDto
            {
                Id = topic.CreatedBy.Id,
                FirstName = topic.CreatedBy.FirstName,
                LastName = topic.CreatedBy.LastName,
                ProfileImageUrl = topic.CreatedBy.AlumniProfile?.ProfileImageUrl
            },
            IsPinned = topic.IsPinned,
            IsLocked = topic.IsLocked,
            CreatedAt = topic.CreatedAt,
            Posts = topLevelPosts,
            Tags = topic.TopicTags.Select(tt => new TagDto
            {
                Id = tt.Tag.Id,
                Name = tt.Tag.Name,
                Slug = tt.Tag.Slug,
                UsageCount = tt.Tag.UsageCount
            }).ToList()
        };
    }

    /// <summary>
    /// Creates a new discussion topic with an initial post.
    /// The first post becomes the topic starter and cannot be deleted separately.
    /// </summary>
    public async Task<TopicDetailDto> CreateTopicAsync(Guid userId, string title, string content, List<string>? tags = null)
    {
        var topic = new DiscussionTopic
        {
            Id = Guid.NewGuid(),
            Title = title,
            CreatedById = userId,
            CreatedAt = DateTime.UtcNow
        };

        var firstPost = new ForumPost
        {
            Id = Guid.NewGuid(),
            Content = content,
            TopicId = topic.Id,
            AuthorId = userId,
            CreatedAt = DateTime.UtcNow
        };

        _context.DiscussionTopics.Add(topic);
        _context.ForumPosts.Add(firstPost);

        // Handle tags if provided
        if (tags != null && tags.Any())
        {
            var tagEntities = await _tagService.GetOrCreateTagsAsync(tags);
            
            foreach (var tag in tagEntities)
            {
                var topicTag = new DiscussionTopicTag
                {
                    TopicId = topic.Id,
                    TagId = tag.Id
                };
                _context.DiscussionTopicTags.Add(topicTag);
            }
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation("Topic {TopicId} created by user {UserId} with {TagCount} tags", 
            topic.Id, userId, tags?.Count ?? 0);

        return await GetTopicByIdAsync(topic.Id, userId);
    }

    /// <summary>
    /// Creates a new post or reply in a topic.
    /// Supports nested replies (1 level deep) via parentPostId parameter.
    /// Prevents posting to locked topics.
    /// </summary>
    public async Task<PostDto> CreatePostAsync(Guid topicId, Guid userId, string content, Guid? parentPostId = null)
    {
        var topic = await _context.DiscussionTopics
            .FirstOrDefaultAsync(t => t.Id == topicId);

        if (topic == null)
        {
            throw new KeyNotFoundException($"Topic with ID {topicId} not found");
        }

        if (topic.IsLocked)
        {
            throw new InvalidOperationException("Cannot post to a locked topic");
        }

        // If this is a reply, validate parent post exists and is in the same topic
        if (parentPostId.HasValue)
        {
            var parentPost = await _context.ForumPosts
                .FirstOrDefaultAsync(p => p.Id == parentPostId.Value && p.TopicId == topicId);

            if (parentPost == null)
            {
                throw new KeyNotFoundException($"Parent post with ID {parentPostId} not found in this topic");
            }

            // Prevent deeply nested replies (only 1 level allowed)
            if (parentPost.ParentPostId.HasValue)
            {
                throw new InvalidOperationException("Cannot reply to a nested post. Maximum nesting level is 1.");
            }
        }

        var post = new ForumPost
        {
            Id = Guid.NewGuid(),
            Content = content,
            TopicId = topicId,
            AuthorId = userId,
            ParentPostId = parentPostId,
            CreatedAt = DateTime.UtcNow
        };

        _context.ForumPosts.Add(post);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Post {PostId} created in topic {TopicId} by user {UserId}", post.Id, topicId, userId);

        // Fetch the complete post with all relationships
        var createdPost = await _context.ForumPosts
            .Include(p => p.Author)
                .ThenInclude(a => a.AlumniProfile)
            .Include(p => p.Likes)
            .FirstOrDefaultAsync(p => p.Id == post.Id);

        return MapToPostDto(createdPost!, userId);
    }

    /// <summary>
    /// Adds a like to a post.
    /// </summary>
    public async Task<bool> LikePostAsync(Guid postId, Guid userId)
    {
        var post = await _context.ForumPosts.FirstOrDefaultAsync(p => p.Id == postId);
        if (post == null)
        {
            throw new KeyNotFoundException($"Post with ID {postId} not found");
        }

        var existingLike = await _context.PostLikes
            .FirstOrDefaultAsync(l => l.PostId == postId && l.UserId == userId);

        if (existingLike != null)
        {
            return false; // Already liked
        }

        var like = new PostLike
        {
            PostId = postId,
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        _context.PostLikes.Add(like);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Post {PostId} liked by user {UserId}", postId, userId);

        return true;
    }

    /// <summary>
    /// Removes a like from a post.
    /// </summary>
    public async Task<bool> UnlikePostAsync(Guid postId, Guid userId)
    {
        var like = await _context.PostLikes
            .FirstOrDefaultAsync(l => l.PostId == postId && l.UserId == userId);

        if (like == null)
        {
            return false; // Not liked
        }

        _context.PostLikes.Remove(like);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Post {PostId} unliked by user {UserId}", postId, userId);

        return true;
    }

    /// <summary>
    /// Deletes an entire topic and all its posts (Admin only).
    /// </summary>
    public async Task<bool> DeleteTopicAsync(Guid topicId)
    {
        var topic = await _context.DiscussionTopics
            .FirstOrDefaultAsync(t => t.Id == topicId);

        if (topic == null)
        {
            return false;
        }

        _context.DiscussionTopics.Remove(topic);
        await _context.SaveChangesAsync();

        _logger.LogWarning("Topic {TopicId} deleted by admin", topicId);

        return true;
    }

    /// <summary>
    /// Soft deletes a post (Admin only).
    /// </summary>
    public async Task<bool> DeletePostAsync(Guid postId, Guid deletedBy, string reason)
    {
        var post = await _context.ForumPosts
            .Include(p => p.Replies)
            .FirstOrDefaultAsync(p => p.Id == postId);

        if (post == null)
        {
            throw new KeyNotFoundException($"Post with ID {postId} not found");
        }

        // Soft delete the main post
        post.IsDeleted = true;
        post.DeletedAt = DateTime.UtcNow;
        post.DeletedBy = deletedBy;
        post.DeletionReason = reason;

        // Soft delete all replies as well (admin moderation)
        foreach (var reply in post.Replies.Where(r => !r.IsDeleted))
        {
            reply.IsDeleted = true;
            reply.DeletedAt = DateTime.UtcNow;
            reply.DeletedBy = deletedBy;
            reply.DeletionReason = $"Parent post deleted: {reason}";
        }

        await _context.SaveChangesAsync();

        _logger.LogWarning("Post {PostId} soft deleted by admin {AdminId}. Reason: {Reason}", 
            postId, deletedBy, reason);

        return true;
    }

    /// <summary>
    /// Updates the content of a post (Admin only).
    /// </summary>
    public async Task<PostDto> UpdatePostAsync(Guid postId, string content, Guid currentUserId)
    {
        var post = await _context.ForumPosts
            .Include(p => p.Author)
                .ThenInclude(a => a.AlumniProfile)
            .Include(p => p.Likes)
            .FirstOrDefaultAsync(p => p.Id == postId);

        if (post == null)
        {
            throw new KeyNotFoundException($"Post with ID {postId} not found");
        }

        post.Content = content;
        post.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogWarning("Post {PostId} updated by admin", postId);

        return MapToPostDto(post, currentUserId);
    }

    /// <summary>
    /// Soft deletes a post (user can only delete their own posts).
    /// </summary>
    public async Task<bool> DeleteOwnPostAsync(Guid postId, Guid userId)
    {
        var post = await _context.ForumPosts
            .FirstOrDefaultAsync(p => p.Id == postId);

        if (post == null)
        {
            throw new KeyNotFoundException($"Post with ID {postId} not found");
        }

        // Check if user owns the post
        if (post.AuthorId != userId)
        {
            throw new UnauthorizedAccessException("You can only delete your own posts");
        }

        // Soft delete the post
        post.IsDeleted = true;
        post.DeletedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Post {PostId} soft deleted by user {UserId}", postId, userId);

        return true;
    }

    /// <summary>
    /// Deletes a topic (soft delete, admin only).
    /// </summary>
    public async Task<bool> DeleteTopicAsync(Guid topicId, Guid adminUserId)
    {
        var topic = await _context.DiscussionTopics
            .FirstOrDefaultAsync(t => t.Id == topicId);

        if (topic == null)
        {
            return false;
        }

        // For now, we'll actually delete it. In a real system, you'd add an IsDeleted field
        _context.DiscussionTopics.Remove(topic);
        await _context.SaveChangesAsync();

        _logger.LogWarning("Topic {TopicId} deleted by admin {AdminId}", topicId, adminUserId);

        return true;
    }

    /// <summary>
    /// Toggles pin status for a topic (admin only).
    /// </summary>
    public async Task<bool> TogglePinTopicAsync(Guid topicId, Guid adminUserId)
    {
        var topic = await _context.DiscussionTopics
            .FirstOrDefaultAsync(t => t.Id == topicId);

        if (topic == null)
        {
            throw new KeyNotFoundException($"Topic with ID {topicId} not found");
        }

        topic.IsPinned = !topic.IsPinned;
        topic.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Topic {TopicId} pin status toggled to {IsPinned} by admin {AdminId}", 
            topicId, topic.IsPinned, adminUserId);

        return topic.IsPinned;
    }

    /// <summary>
    /// Toggles lock status for a topic (admin only).
    /// </summary>
    public async Task<bool> ToggleLockTopicAsync(Guid topicId, Guid adminUserId)
    {
        var topic = await _context.DiscussionTopics
            .FirstOrDefaultAsync(t => t.Id == topicId);

        if (topic == null)
        {
            throw new KeyNotFoundException($"Topic with ID {topicId} not found");
        }

        topic.IsLocked = !topic.IsLocked;
        topic.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Topic {TopicId} lock status toggled to {IsLocked} by admin {AdminId}", 
            topicId, topic.IsLocked, adminUserId);

        return topic.IsLocked;
    }

    /// <summary>
    /// Deletes a post as admin with audit trail (soft delete).
    /// </summary>
    public async Task<bool> DeletePostAsAdminAsync(Guid postId, Guid adminUserId, string reason)
    {
        var post = await _context.ForumPosts
            .Include(p => p.Replies)
            .FirstOrDefaultAsync(p => p.Id == postId);

        if (post == null)
        {
            return false;
        }

        // Soft delete the post
        post.IsDeleted = true;
        post.DeletedAt = DateTime.UtcNow;
        post.DeletedBy = adminUserId;
        post.DeletionReason = reason;

        // Cascade soft delete to all replies
        foreach (var reply in post.Replies)
        {
            reply.IsDeleted = true;
            reply.DeletedAt = DateTime.UtcNow;
            reply.DeletedBy = adminUserId;
            reply.DeletionReason = $"Parent post deleted: {reason}";
        }

        await _context.SaveChangesAsync();

        _logger.LogWarning("Post {PostId} and {ReplyCount} replies soft deleted by admin {AdminId} with reason: {Reason}", 
            postId, post.Replies.Count, adminUserId, reason);

        return true;
    }

    /// <summary>
    /// Helper method to map ForumPost entity to PostDto.
    /// </summary>
    private PostDto MapToPostDto(ForumPost post, Guid currentUserId, List<ForumPost>? replies = null)
    {
        var postReplies = replies ?? post.Replies.Where(r => !r.IsDeleted).ToList();
        
        return new PostDto
        {
            Id = post.Id,
            Content = post.IsDeleted ? "[This post has been deleted]" : post.Content,
            Author = new AuthorDto
            {
                Id = post.Author.Id,
                FirstName = post.Author.FirstName,
                LastName = post.Author.LastName,
                ProfileImageUrl = post.Author.AlumniProfile?.ProfileImageUrl
            },
            ParentPostId = post.ParentPostId,
            CreatedAt = post.CreatedAt,
            UpdatedAt = post.UpdatedAt,
            LikeCount = post.Likes.Count,
            IsLikedByCurrentUser = post.Likes.Any(l => l.UserId == currentUserId),
            Replies = postReplies
                .OrderBy(r => r.CreatedAt)
                .Select(r => MapToPostDto(r, currentUserId))
                .ToList()
        };
    }
}


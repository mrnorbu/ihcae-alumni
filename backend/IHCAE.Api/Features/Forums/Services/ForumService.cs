using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using IHCAE.Api.Features.Forums.Models.Entities;
using IHCAE.Api.Features.Forums.Models.DTOs;
using IHCAE.Api.Shared.Data;
using IHCAE.Api.Shared.DTOs;
using IHCAE.Api.Shared.Models;
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
    private readonly IUrlHelperService _urlHelperService;
    private readonly IEmailService _emailService;

    public ForumService(
        AppDbContext context, 
        ILogger<ForumService> logger, 
        ITagService tagService, 
        IUrlHelperService urlHelperService,
        IEmailService emailService)
    {
        _context = context;
        _logger = logger;
        _tagService = tagService;
        _urlHelperService = urlHelperService;
        _emailService = emailService;
    }

    /// <summary>
    /// Gets a paginated list of discussion topics sorted by recent activity.
    /// Pinned topics appear first, then sorted by most recent post activity.
    /// </summary>
    public async Task<PaginatedResult<TopicSummaryDto>> GetTopicsAsync(int currentUserId, int page = 1, int pageSize = 20, List<string>? tags = null, string? search = null, int? authorId = null, string sortBy = "recent")
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

        // Filter by search term (searches in title and post content)
        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.ToLower();
            query = query.Where(t => 
                t.Title.ToLower().Contains(searchLower) || 
                t.Posts.Any(p => p.Content.ToLower().Contains(searchLower) && !p.IsDeleted)
            );
        }

        // Filter by author
        if (authorId.HasValue)
        {
            query = query.Where(t => t.CreatedBy.Id == authorId.Value);
        }

        var totalCount = await query.CountAsync();

        // Apply sorting based on sortBy parameter
        IOrderedQueryable<DiscussionTopic> orderedQuery;
        switch (sortBy.ToLower())
        {
            case "oldest":
                orderedQuery = query
                    .OrderByDescending(t => t.IsPinned)
                    .ThenBy(t => t.CreatedAt);
                break;
            case "popular":
                orderedQuery = query
                    .OrderByDescending(t => t.IsPinned)
                    .ThenByDescending(t => t.Posts.SelectMany(p => p.Likes).Count());
                break;
            case "mostdiscussed":
                orderedQuery = query
                    .OrderByDescending(t => t.IsPinned)
                    .ThenByDescending(t => t.Posts.Count(p => !p.IsDeleted));
                break;
            default: // "recent"
                orderedQuery = query
                    .OrderByDescending(t => t.IsPinned)
                    .ThenByDescending(t => t.Posts.Max(p => (DateTime?)p.CreatedAt) ?? t.CreatedAt);
                break;
        }

        var topicEntities = await orderedQuery
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var topics = topicEntities.Select(t => new TopicSummaryDto
            {
                Id = t.Id,
                Title = t.Title,
                CreatedBy = new AuthorDto
                {
                    Id = t.CreatedBy.Id,
                    FirstName = t.CreatedBy.FirstName,
                    LastName = t.CreatedBy.LastName,
                    ProfileImageUrl = _urlHelperService.GetAbsoluteUrl(t.CreatedBy.AlumniProfile?.ProfileImageUrl)
                },
                PostCount = t.Posts.Count(p => !p.IsDeleted),
                LastReplyAt = t.Posts.Where(p => !p.IsDeleted).Max(p => (DateTime?)p.CreatedAt),
                IsPinned = t.IsPinned,
                IsLocked = t.IsLocked,
                CreatedAt = t.CreatedAt,
                TotalLikes = 0, // Will be calculated separately to avoid loading all likes
                MainPostId = 0, // Will be set separately
                IsMainPostLikedByCurrentUser = false, // Will be set separately
                Tags = t.TopicTags.Select(tt => new TagDto
                {
                    Id = tt.Tag.Id,
                    Name = tt.Tag.Name,
                    Slug = tt.Tag.Slug,
                    UsageCount = tt.Tag.UsageCount
                }).ToList()
            })
            .ToList();

        // Now enrich with like data and main post info for each topic
        foreach (var topic in topics)
        {
            var mainPost = await _context.ForumPosts
                .Include(p => p.Likes)
                .Where(p => p.TopicId == topic.Id && p.ParentPostId == null && !p.IsDeleted)
                .OrderBy(p => p.CreatedAt)
                .FirstOrDefaultAsync();

            if (mainPost != null)
            {
                topic.MainPostId = mainPost.Id;
                topic.IsMainPostLikedByCurrentUser = mainPost.Likes.Any(l => l.UserId == currentUserId);
                topic.Preview = mainPost.Content.Length > 200
                    ? mainPost.Content[..200].TrimEnd() + "…"
                    : mainPost.Content;
            }

            // Calculate total likes for the topic
            topic.TotalLikes = await _context.ForumPosts
                .Where(p => p.TopicId == topic.Id && !p.IsDeleted)
                .SelectMany(p => p.Likes)
                .CountAsync();
        }

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
    public async Task<TopicDetailDto> GetTopicByIdAsync(int topicId, int currentUserId)
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

        // Load the main post (first post in topic - the one without a parent)
        var mainPost = await _context.ForumPosts
            .AsNoTracking()
            .Include(p => p.Author)
                .ThenInclude(a => a.AlumniProfile)
            .Include(p => p.Likes)
            .Where(p => p.TopicId == topicId && p.ParentPostId == null && !p.IsDeleted)
            .OrderBy(p => p.CreatedAt)
            .FirstOrDefaultAsync();

        if (mainPost == null)
        {
            throw new KeyNotFoundException($"No posts found for topic {topicId}");
        }

        // Load ALL replies (flattened) - regardless of which post they're replying to
        // This includes replies to the main post AND replies to other replies
        var allReplies = await _context.ForumPosts
            .AsNoTracking() // Prevent tracking issues
            .Include(p => p.Author)
                .ThenInclude(a => a.AlumniProfile)
            .Include(p => p.Likes)
            .Include(p => p.ParentPost) // Include parent for "replying to" context
                .ThenInclude(pp => pp!.Author)
                    .ThenInclude(a => a.AlumniProfile)
            .Where(p => p.TopicId == topicId && p.ParentPostId.HasValue && !p.IsDeleted)
            .OrderBy(p => p.CreatedAt) // Chronological order (oldest first, newest at bottom)
            .ToListAsync();
        
        _logger.LogInformation("Loaded {ReplyCount} replies for topic {TopicId}", allReplies.Count, topicId);
        foreach (var reply in allReplies)
        {
            _logger.LogInformation("Reply {ReplyId}: ParentPostId={ParentPostId}, ParentPost={HasParent}, ParentAuthor={HasParentAuthor}", 
                reply.Id, reply.ParentPostId, reply.ParentPost != null, reply.ParentPost?.Author != null);
        }

        // Map main post with all replies flattened into a single list
        var mainPostDto = MapToPostDto(mainPost, currentUserId);
        mainPostDto.Replies = allReplies.Select(r => MapToPostDto(r, currentUserId)).ToList();

        var topLevelPosts = new List<PostDto> { mainPostDto };

        return new TopicDetailDto
        {
            Id = topic.Id,
            Title = topic.Title,
            CreatedBy = new AuthorDto
            {
                Id = topic.CreatedBy.Id,
                FirstName = topic.CreatedBy.FirstName,
                LastName = topic.CreatedBy.LastName,
                ProfileImageUrl = _urlHelperService.GetAbsoluteUrl(topic.CreatedBy.AlumniProfile?.ProfileImageUrl)
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
    public async Task<TopicDetailDto> CreateTopicAsync(int userId, string title, string content, List<string>? tags = null)
    {
        var topic = new DiscussionTopic
        {
            
            Title = title,
            CreatedById = userId,
            CreatedAt = DateTime.UtcNow
        };

        var firstPost = new ForumPost
        {
            
            Content = content,
            Topic = topic,
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
                    Topic = topic,
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
    public async Task<PostDto> CreatePostAsync(int topicId, int userId, string content, int? parentPostId = null, List<int>? mentionedUserIds = null)
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
                .Include(p => p.Author) // Include author for reply context
                .FirstOrDefaultAsync(p => p.Id == parentPostId.Value && p.TopicId == topicId);

            if (parentPost == null)
            {
                throw new KeyNotFoundException($"Parent post with ID {parentPostId} not found in this topic");
            }

            // Note: We now allow replying to any post (removed nesting limit)
            // All replies will be flattened to single level in the UI with context
        }

        var post = new ForumPost
        {
            
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
            .Include(p => p.Topic)
                .ThenInclude(t => t.CreatedBy)
            .Include(p => p.ParentPost)
                .ThenInclude(pp => pp!.Author)
            .FirstOrDefaultAsync(p => p.Id == post.Id);

        // Send notifications for new reply
        if (createdPost != null)
        {
            var frontendUrl = _urlHelperService.GetFrontendUrl();
            var postLink = $"{frontendUrl}/forums/topic/{topicId}";
            var authorName = $"{createdPost.Author.FirstName} {createdPost.Author.LastName}";

            if (createdPost.ParentPost != null)
            {
                // Reply to a specific post
                var parentAuthor = createdPost.ParentPost.Author;
                if (parentAuthor.Id != userId)
                {
                    await _emailService.SendNewReplyNotificationAsync(
                        parentAuthor.Email,
                        parentAuthor.FirstName,
                        createdPost.Topic.Title,
                        authorName,
                        postLink
                    );

                    var notification = new Notification
                    {
                        
                        UserId = parentAuthor.Id,
                        Title = "New reply to your post",
                        Message = $"{authorName} replied to your post in: {createdPost.Topic.Title}",
                        Type = "Reply",
                        Link = $"/forums/topic/{topicId}",
                        IsRead = false,
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.Notifications.Add(notification);
                }
            }
            else
            {
                // General reply to the topic
                var topicCreator = createdPost.Topic.CreatedBy;
                if (topicCreator.Id != userId)
                {
                    await _emailService.SendNewReplyNotificationAsync(
                        topicCreator.Email,
                        topicCreator.FirstName,
                        createdPost.Topic.Title,
                        authorName,
                        postLink
                    );

                    var notification = new Notification
                    {
                        
                        UserId = topicCreator.Id,
                        Title = "New reply to your topic",
                        Message = $"{authorName} replied to your topic: {createdPost.Topic.Title}",
                        Type = "Reply",
                        Link = $"/forums/topic/{topicId}",
                        IsRead = false,
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.Notifications.Add(notification);
                }
            }

            // Generate notifications for mentioned users
            if (mentionedUserIds != null && mentionedUserIds.Any())
            {
                var mentionedUsers = await _context.Users
                    .Where(u => mentionedUserIds.Contains(u.Id) && u.Id != userId)
                    .ToListAsync();

                foreach (var mentionedUser in mentionedUsers)
                {
                    // Optionally send an email:
                    // await _emailService.SendMentionNotificationAsync(mentionedUser.Email, mentionedUser.FirstName, createdPost.Topic.Title, authorName, postLink);

                    var mentionNotification = new Notification
                    {
                        
                        UserId = mentionedUser.Id,
                        Title = "You were mentioned in a post",
                        Message = $"{authorName} mentioned you in a post in: {createdPost.Topic.Title}",
                        Type = "Mention",
                        Link = $"/forums/topic/{topicId}",
                        IsRead = false,
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.Notifications.Add(mentionNotification);
                }
            }

            await _context.SaveChangesAsync();
        }

        return MapToPostDto(createdPost!, userId);
    }

    /// <summary>
    /// Adds a like to a post.
    /// </summary>
    public async Task<bool> LikePostAsync(int postId, int userId)
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
    public async Task<bool> UnlikePostAsync(int postId, int userId)
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
    public async Task<bool> DeleteTopicAsync(int topicId)
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
    public async Task<bool> DeletePostAsync(int postId, int deletedBy, string reason)
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
    public async Task<PostDto> UpdatePostAsync(int postId, string content, int currentUserId)
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
    public async Task<bool> DeleteOwnPostAsync(int postId, int userId)
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
    public async Task<bool> DeleteTopicAsync(int topicId, int adminUserId)
    {
        var topic = await _context.DiscussionTopics
            .Include(t => t.CreatedBy)
            .FirstOrDefaultAsync(t => t.Id == topicId);

        if (topic == null)
        {
            return false;
        }

        // For now, we'll actually delete it. In a real system, you'd add an IsDeleted field
        _context.DiscussionTopics.Remove(topic);
        await _context.SaveChangesAsync();

        _logger.LogWarning("Topic {TopicId} deleted by admin {AdminId}", topicId, adminUserId);

        // Send email and in-app notification
        if (topic.CreatedBy != null)
        {
            await _emailService.SendTopicModerationNotificationAsync(
                topic.CreatedBy.Email,
                topic.CreatedBy.FirstName,
                topic.Title,
                "deleted",
                "Topic violated community guidelines or was removed by an administrator."
            );

            var notification = new Notification
            {
                
                UserId = topic.CreatedBy.Id,
                Title = "Topic Deleted by Moderator",
                Message = $"Your topic \"{topic.Title}\" was deleted. Reason: Topic violated community guidelines or was removed by an administrator.",
                Type = "Moderation",
                Link = null,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };
            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();
        }

        return true;
    }

    /// <summary>
    /// Toggles pin status for a topic (admin only).
    /// </summary>
    public async Task<bool> TogglePinTopicAsync(int topicId, int adminUserId)
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
    public async Task<bool> ToggleLockTopicAsync(int topicId, int adminUserId)
    {
        var topic = await _context.DiscussionTopics
            .Include(t => t.CreatedBy)
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

        // Send email and in-app notification if locked
        if (topic.IsLocked && topic.CreatedBy != null)
        {
            await _emailService.SendTopicModerationNotificationAsync(
                topic.CreatedBy.Email,
                topic.CreatedBy.FirstName,
                topic.Title,
                "locked",
                "Topic has been locked by an administrator. No further replies can be added."
            );

            var notification = new Notification
            {
                
                UserId = topic.CreatedBy.Id,
                Title = "Topic Locked by Moderator",
                Message = $"Your topic \"{topic.Title}\" has been locked by an administrator.",
                Type = "Moderation",
                Link = $"/forums/topic/{topicId}",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };
            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();
        }

        return topic.IsLocked;
    }

    /// <summary>
    /// Deletes a post as admin with audit trail (soft delete).
    /// </summary>
    public async Task<bool> DeletePostAsAdminAsync(int postId, int adminUserId, string reason)
    {
        var post = await _context.ForumPosts
            .Include(p => p.Replies)
            .Include(p => p.Topic)
            .Include(p => p.Author)
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

        // Send email and in-app notification
        if (post.Author != null && post.Topic != null)
        {
            await _emailService.SendTopicModerationNotificationAsync(
                post.Author.Email,
                post.Author.FirstName,
                post.Topic.Title,
                "deleted",
                reason
            );

            var notification = new Notification
            {
                
                UserId = post.Author.Id,
                Title = "Post Deleted by Moderator",
                Message = $"Your post in \"{post.Topic.Title}\" was deleted by a moderator. Reason: {reason}",
                Type = "Moderation",
                Link = null,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };
            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();
        }

        return true;
    }

    /// <summary>
    /// Helper method to map ForumPost entity to PostDto.
    /// </summary>
    private PostDto MapToPostDto(ForumPost post, int currentUserId)
    {
        var dto = new PostDto
        {
            Id = post.Id,
            Content = post.IsDeleted ? "[This post has been deleted]" : post.Content,
            Author = new AuthorDto
            {
                Id = post.Author.Id,
                FirstName = post.Author.FirstName,
                LastName = post.Author.LastName,
                ProfileImageUrl = _urlHelperService.GetAbsoluteUrl(post.Author.AlumniProfile?.ProfileImageUrl)
            },
            ParentPostId = post.ParentPostId,
            CreatedAt = post.CreatedAt,
            UpdatedAt = post.UpdatedAt,
            LikeCount = post.Likes.Count,
            IsLikedByCurrentUser = post.Likes.Any(l => l.UserId == currentUserId),
            Replies = new List<PostDto>() // Replies will be added separately for flattened structure
        };

        // Add parent author info if this is a reply (for "replying to" context)
        if (post.ParentPost != null && post.ParentPost.Author != null)
        {
            dto.ParentAuthor = new AuthorDto
            {
                Id = post.ParentPost.Author.Id,
                FirstName = post.ParentPost.Author.FirstName,
                LastName = post.ParentPost.Author.LastName,
                ProfileImageUrl = _urlHelperService.GetAbsoluteUrl(post.ParentPost.Author.AlumniProfile?.ProfileImageUrl)
            };
        }

        return dto;
    }

    /// <summary>
    /// Restores a soft-deleted post (Admin only).
    /// </summary>
    public async Task<bool> RestorePostAsync(int postId, int adminUserId)
    {
        var post = await _context.ForumPosts
            .Include(p => p.Replies)
            .Include(p => p.Topic)
            .Include(p => p.Author)
            .FirstOrDefaultAsync(p => p.Id == postId);

        if (post == null)
        {
            return false;
        }

        // Restore the post
        post.IsDeleted = false;
        post.DeletedAt = null;
        post.DeletedBy = null;
        post.DeletionReason = null;

        // Cascade restore to replies that were cascade soft-deleted
        foreach (var reply in post.Replies)
        {
            if (reply.IsDeleted && reply.DeletionReason != null && reply.DeletionReason.StartsWith("Parent post deleted:"))
            {
                reply.IsDeleted = false;
                reply.DeletedAt = null;
                reply.DeletedBy = null;
                reply.DeletionReason = null;
            }
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation("Post {PostId} restored by admin {AdminId}", postId, adminUserId);

        return true;
    }

    /// <summary>
    /// Gets top users by engagement (total likes received on their posts).
    /// </summary>
    public async Task<List<TopUserDto>> GetTopUsersAsync(int limit = 5)
    {
        var topUsersData = await _context.ForumPosts
            .Where(p => !p.IsDeleted)
            .GroupBy(p => new
            {
                p.Author.Id,
                p.Author.FirstName,
                p.Author.LastName,
                ProfileImageUrl = p.Author.AlumniProfile != null ? p.Author.AlumniProfile.ProfileImageUrl : null
            })
            .Select(g => new
            {
                UserId = g.Key.Id,
                FirstName = g.Key.FirstName,
                LastName = g.Key.LastName,
                ProfileImageUrl = g.Key.ProfileImageUrl,
                TotalLikes = g.Sum(p => p.Likes.Count),
                PostCount = g.Count()
            })
            .OrderByDescending(u => u.TotalLikes)
            .Take(limit)
            .ToListAsync();

        var topUsers = topUsersData.Select(u => new TopUserDto
        {
            UserId = u.UserId,
            FirstName = u.FirstName,
            LastName = u.LastName,
            ProfileImageUrl = _urlHelperService.GetAbsoluteUrl(u.ProfileImageUrl),
            TotalLikes = u.TotalLikes,
            PostCount = u.PostCount
        }).ToList();

        return topUsers;
    }
}


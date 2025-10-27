namespace IHCAE.Api.Features.News.Models.Entities;

/// <summary>
/// Represents the publication status of content (news articles, events).
/// </summary>
public enum ContentStatus
{
    /// <summary>
    /// Content is saved as draft and not visible to public
    /// </summary>
    Draft,
    
    /// <summary>
    /// Content is submitted for admin review (Content Creator submissions)
    /// </summary>
    PendingReview,
    
    /// <summary>
    /// Content is approved and publicly visible
    /// </summary>
    Published
}

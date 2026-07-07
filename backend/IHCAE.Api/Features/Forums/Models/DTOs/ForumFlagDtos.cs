namespace IHCAE.Api.Features.Forums.Models.DTOs;

/// <summary>
/// Request to flag a forum post.
/// </summary>
public class FlagPostRequest
{
    /// <summary>
    /// Reason for flagging (e.g. "Spam", "Harassment", "Inappropriate", "Other")
    /// </summary>
    public string Reason { get; set; } = string.Empty;

    /// <summary>
    /// Optional additional details
    /// </summary>
    public string? Details { get; set; }
}

/// <summary>
/// Request to resolve a flag.
/// </summary>
public class ResolveFlagRequest
{
    /// <summary>
    /// Resolution status: "Dismissed" or "ActionTaken"
    /// </summary>
    public string Status { get; set; } = string.Empty;

    /// <summary>
    /// Admin notes about the resolution
    /// </summary>
    public string? Notes { get; set; }
}

/// <summary>
/// DTO for returning flag details.
/// </summary>
public class ForumFlagDto
{
    public int Id { get; set; }
    public int PostId { get; set; }
    public string PostContent { get; set; } = string.Empty;
    public string TopicTitle { get; set; } = string.Empty;
    public int TopicId { get; set; }
    public string FlaggedByName { get; set; } = string.Empty;
    public int FlaggedById { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string? Details { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? ResolvedByName { get; set; }
    public string? ResolutionNotes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ResolvedAt { get; set; }

    // Post author info
    public string PostAuthorName { get; set; } = string.Empty;
    public int PostAuthorId { get; set; }
}

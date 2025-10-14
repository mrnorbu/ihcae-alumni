using IHCAE.Api.Shared.DTOs;
using IHCAE.Api.Shared.Models;

namespace IHCAE.Api.Shared.Services;

/// <summary>
/// Interface for a shared Tag Service.
/// Handles operations related to tags, such as creation, searching, and retrieving popular tags.
/// </summary>
public interface ITagService
{
    /// <summary>
    /// Gets or creates tags based on a list of tag names.
    /// If a tag already exists, it's retrieved; otherwise, a new one is created.
    /// Increments usage count for existing tags.
    /// </summary>
    /// <param name="tagNames">List of tag names.</param>
    /// <returns>A list of Tag entities.</returns>
    Task<List<Tag>> GetOrCreateTagsAsync(List<string> tagNames);

    /// <summary>
    /// Searches for tags by name, supporting autocomplete functionality.
    /// </summary>
    /// <param name="query">The search query.</param>
    /// <param name="limit">Maximum number of results to return.</param>
    /// <returns>A list of matching Tag DTOs.</returns>
    Task<List<TagDto>> SearchTagsAsync(string query, int limit = 10);

    /// <summary>
    /// Gets the most popular tags based on their usage count.
    /// </summary>
    /// <param name="limit">Maximum number of popular tags to return.</param>
    /// <returns>A list of popular Tag DTOs.</returns>
    Task<List<TagDto>> GetPopularTagsAsync(int limit = 20);
}
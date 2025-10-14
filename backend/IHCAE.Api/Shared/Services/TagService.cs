using Microsoft.EntityFrameworkCore;
using IHCAE.Api.Shared.Data;
using IHCAE.Api.Shared.DTOs;
using IHCAE.Api.Shared.Models;
using IHCAE.Api.Shared.Services;

namespace IHCAE.Api.Shared.Services;

/// <summary>
/// Service for managing tags across the application.
/// Handles tag creation, searching, and usage tracking.
/// </summary>
public class TagService : ITagService
{
    private readonly AppDbContext _context;
    private readonly ILogger<TagService> _logger;

    public TagService(AppDbContext context, ILogger<TagService> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Gets or creates tags based on a list of tag names.
    /// If a tag already exists, it's retrieved; otherwise, a new one is created.
    /// Increments usage count for existing tags.
    /// </summary>
    public async Task<List<Tag>> GetOrCreateTagsAsync(List<string> tagNames)
    {
        if (!tagNames.Any())
            return new List<Tag>();

        var existingTags = await _context.Tags
            .Where(t => tagNames.Select(n => n.ToLower()).Contains(t.Name.ToLower()))
            .ToListAsync();

        var newTags = new List<Tag>();
        foreach (var tagName in tagNames)
        {
            var existingTag = existingTags.FirstOrDefault(t => t.Name.Equals(tagName, StringComparison.OrdinalIgnoreCase));
            if (existingTag == null)
            {
                var newTag = new Tag
                {
                    Name = tagName,
                    Slug = GenerateSlug(tagName),
                    UsageCount = 1, // Initial usage count
                    CreatedAt = DateTime.UtcNow
                };
                _context.Tags.Add(newTag);
                newTags.Add(newTag);
            }
            else
            {
                existingTag.UsageCount++; // Increment usage for existing tags
            }
        }

        await _context.SaveChangesAsync();
        return existingTags.Concat(newTags).ToList();
    }

    /// <summary>
    /// Searches for tags by name, supporting autocomplete functionality.
    /// </summary>
    public async Task<List<TagDto>> SearchTagsAsync(string query, int limit = 10)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            return new List<TagDto>();
        }

        var tags = await _context.Tags
            .Where(t => t.Name.ToLower().Contains(query.ToLower()))
            .OrderByDescending(t => t.UsageCount) // Prioritize popular tags
            .Take(limit)
            .Select(t => new TagDto
            {
                Id = t.Id,
                Name = t.Name,
                Slug = t.Slug,
                UsageCount = t.UsageCount
            })
            .ToListAsync();

        return tags;
    }

    /// <summary>
    /// Gets the most popular tags based on their usage count.
    /// </summary>
    public async Task<List<TagDto>> GetPopularTagsAsync(int limit = 20)
    {
        var tags = await _context.Tags
            .OrderByDescending(t => t.UsageCount)
            .Take(limit)
            .Select(t => new TagDto
            {
                Id = t.Id,
                Name = t.Name,
                Slug = t.Slug,
                UsageCount = t.UsageCount
            })
            .ToListAsync();

        return tags;
    }

    /// <summary>
    /// Generates a URL-friendly slug from a tag name.
    /// </summary>
    private static string GenerateSlug(string tagName)
    {
        return tagName
            .ToLowerInvariant()
            .Replace(" ", "-")
            .Replace("_", "-")
            .Trim('-');
    }
}

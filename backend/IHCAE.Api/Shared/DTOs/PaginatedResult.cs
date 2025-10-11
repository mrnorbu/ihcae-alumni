namespace IHCAE.Api.Shared.DTOs;

/// <summary>
/// Generic paginated result wrapper.
/// Provides pagination information for API responses.
/// </summary>
/// <typeparam name="T">The type of items being paginated</typeparam>
public class PaginatedResult<T>
{
    /// <summary>
    /// The items for the current page.
    /// </summary>
    public IEnumerable<T> Items { get; set; } = new List<T>();

    /// <summary>
    /// Total number of items across all pages.
    /// </summary>
    public int TotalCount { get; set; }

    /// <summary>
    /// Current page number (1-based).
    /// </summary>
    public int Page { get; set; }

    /// <summary>
    /// Number of items per page.
    /// </summary>
    public int PageSize { get; set; }

    /// <summary>
    /// Total number of pages.
    /// </summary>
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);

    /// <summary>
    /// Whether there are more pages available.
    /// </summary>
    public bool HasNextPage => Page < TotalPages;

    /// <summary>
    /// Whether there are previous pages available.
    /// </summary>
    public bool HasPreviousPage => Page > 1;
}


using IHCAE.Domain.Entities;

namespace IHCAE.Application.Interfaces;

/// <summary>
/// Service interface for alumni database import operations.
/// Handles importing alumni data from CSV files for auto-approval matching.
/// </summary>
public interface IAlumniImportService
{
    /// <summary>
    /// Imports alumni data from a CSV file.
    /// </summary>
    /// <param name="csvContent">The CSV file content as a string</param>
    /// <returns>Import result with statistics and any errors</returns>
    Task<AlumniImportResult> ImportAlumniDataAsync(string csvContent);

    /// <summary>
    /// Searches for a matching alumni record by email.
    /// </summary>
    /// <param name="email">Email address to search for</param>
    /// <returns>The matching alumni record if found, null otherwise</returns>
    Task<AlumniDatabase?> FindMatchingAlumniAsync(string email);

    /// <summary>
    /// Gets all alumni records with optional filtering.
    /// </summary>
    /// <param name="searchTerm">Optional search term for name or email</param>
    /// <param name="matchedOnly">Whether to return only matched records</param>
    /// <param name="page">Page number for pagination</param>
    /// <param name="pageSize">Number of records per page</param>
    /// <returns>Paginated collection of alumni records</returns>
    Task<PaginatedResult<AlumniDatabase>> GetAlumniRecordsAsync(
        string? searchTerm = null, 
        bool? matchedOnly = null, 
        int page = 1, 
        int pageSize = 50);

    /// <summary>
    /// Links an alumni record to a user account.
    /// </summary>
    /// <param name="alumniId">The alumni record ID</param>
    /// <param name="userId">The user account ID</param>
    /// <returns>Task representing the async operation</returns>
    Task LinkAlumniToUserAsync(Guid alumniId, Guid userId);
}

/// <summary>
/// Result object returned from alumni import operations.
/// </summary>
public class AlumniImportResult
{
    /// <summary>
    /// Total number of records processed.
    /// </summary>
    public int TotalRecords { get; set; }

    /// <summary>
    /// Number of records successfully imported.
    /// </summary>
    public int ImportedRecords { get; set; }

    /// <summary>
    /// Number of records skipped (duplicates, invalid data).
    /// </summary>
    public int SkippedRecords { get; set; }

    /// <summary>
    /// List of error messages encountered during import.
    /// </summary>
    public List<string> Errors { get; set; } = new();

    /// <summary>
    /// Timestamp when the import was completed.
    /// </summary>
    public DateTime ImportedAt { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// Generic paginated result wrapper.
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

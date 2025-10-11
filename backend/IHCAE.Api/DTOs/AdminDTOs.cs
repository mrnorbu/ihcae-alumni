using System.ComponentModel.DataAnnotations;

namespace IHCAE.Api.DTOs;

/// <summary>
/// Response DTO for admin actions (approve/reject).
/// Contains confirmation details for administrative operations.
/// </summary>
public class AdminActionResponse
{
    /// <summary>
    /// Whether the action was successful.
    /// </summary>
    public bool Success { get; set; }

    /// <summary>
    /// Confirmation message for the action.
    /// </summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// The ID of the user affected by the action.
    /// </summary>
    public Guid UserId { get; set; }
}

/// <summary>
/// Request DTO for alumni data import.
/// Contains CSV content for importing alumni records.
/// </summary>
public class AlumniImportRequest
{
    /// <summary>
    /// CSV content containing alumni data.
    /// Expected format: FirstName,LastName,Email,Course,GraduationYear,Phone,Location
    /// </summary>
    [Required(ErrorMessage = "CSV content is required")]
    public string CsvContent { get; set; } = string.Empty;
}

/// <summary>
/// DTO for alumni database records.
/// Contains information about imported alumni data.
/// </summary>
public class AlumniDatabaseDto
{
    /// <summary>
    /// Unique identifier for the alumni record.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Alumni's first name.
    /// </summary>
    public string FirstName { get; set; } = string.Empty;

    /// <summary>
    /// Alumni's last name.
    /// </summary>
    public string LastName { get; set; } = string.Empty;

    /// <summary>
    /// Alumni's email address.
    /// </summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Course or program completed.
    /// </summary>
    public string? Course { get; set; }

    /// <summary>
    /// Year of graduation.
    /// </summary>
    public int? GraduationYear { get; set; }

    /// <summary>
    /// Phone number.
    /// </summary>
    public string? Phone { get; set; }

    /// <summary>
    /// Location or address.
    /// </summary>
    public string? Location { get; set; }

    /// <summary>
    /// ID of the user account this alumni record is linked to (if matched).
    /// </summary>
    public Guid? MatchedUserId { get; set; }

    /// <summary>
    /// Date when this record was imported.
    /// </summary>
    public DateTime ImportedAt { get; set; }
}

/// <summary>
/// Generic paginated result DTO.
/// Provides pagination information for API responses.
/// </summary>
/// <typeparam name="T">The type of items in the result</typeparam>
public class PaginatedResult<T>
{
    /// <summary>
    /// The items for the current page.
    /// </summary>
    public List<T> Items { get; set; } = new();

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
    /// Whether there is a next page.
    /// </summary>
    public bool HasNextPage => Page < TotalPages;

    /// <summary>
    /// Whether there is a previous page.
    /// </summary>
    public bool HasPreviousPage => Page > 1;
}

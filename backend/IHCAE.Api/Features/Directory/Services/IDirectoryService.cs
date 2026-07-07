using IHCAE.Api.Features.Directory.Models.DTOs;
using IHCAE.Api.Shared.DTOs;

namespace IHCAE.Api.Features.Directory.Services;

/// <summary>
/// Service interface for alumni directory operations.
/// Provides methods for browsing, searching, and viewing alumni profiles.
/// Handles filtering, pagination, and data transformation for directory features.
/// </summary>
public interface IDirectoryService
{
    /// <summary>
    /// Gets a paginated, filtered list of approved alumni for the directory.
    /// Supports search by name/email and filtering by course/graduation year.
    /// Only returns approved alumni (UserStatus.Approved) for security.
    /// </summary>
    /// <param name="searchTerm">Optional search term for name or email filtering</param>
    /// <param name="course">Optional course filter (e.g., "Advanced Mountaineering")</param>
    /// <param name="graduationYear">Optional graduation year filter (e.g., 2020)</param>
    /// <param name="page">Page number (1-based indexing)</param>
    /// <param name="pageSize">Number of records per page (default: 20, max: 100)</param>
    /// <returns>Paginated result containing AlumniCardDto objects and metadata</returns>
    /// <exception cref="ArgumentException">Thrown when page or pageSize parameters are invalid</exception>
    Task<PaginatedResult<AlumniCardDto>> GetAlumniDirectoryAsync(
        string? searchTerm = null,
        string? course = null,
        string? batch = null,
        int page = 1,
        int pageSize = 20);

    /// <summary>
    /// Gets detailed information for a specific alumnus.
    /// Returns comprehensive profile data including contact information.
    /// Used for the alumni detail page with quick action buttons.
    /// </summary>
    /// <param name="userId">The unique identifier of the alumnus</param>
    /// <returns>Detailed alumni information including contact details</returns>
    /// <exception cref="KeyNotFoundException">Thrown when alumnus is not found or not approved</exception>
    Task<AlumniDetailDto> GetAlumniDetailAsync(int userId);
}


using IHCAE.Api.Features.Alumni.Models.Entities;
using IHCAE.Api.Features.Alumni.Models.DTOs;
using IHCAE.Api.Shared.DTOs;

namespace IHCAE.Api.Features.Alumni.Services;

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
        int pageSize = 50,
        string? status = null);

    /// <summary>
    /// Links an alumni record to a user account.
    /// </summary>
    /// <param name="alumniId">The alumni record ID</param>
    /// <param name="userId">The user account ID</param>
    /// <returns>Task representing the async operation</returns>
    Task LinkAlumniToUserAsync(Guid alumniId, Guid userId);

    /// <summary>
    /// Updates multiple alumni database records at once.
    /// </summary>
    /// <param name="records">The list of updated records</param>
    /// <returns>Task representing the async operation</returns>
    Task UpdateAlumniRecordsAsync(IEnumerable<AlumniDatabaseDto> records);

    /// <summary>
    /// Generates user accounts for the specified alumni records.
    /// </summary>
    /// <param name="alumniIds">The list of alumni IDs</param>
    /// <returns>The bulk generation result containing generated and linked counts</returns>
    Task<BulkGenerateResultDto> BulkGenerateUserAccountsAsync(IEnumerable<Guid> alumniIds);

    /// <summary>
    /// Deletes a specific alumni record.
    /// </summary>
    Task<bool> DeleteAlumniRecordAsync(Guid id);

    /// <summary>
    /// Creates a single alumni record.
    /// </summary>
    Task<AlumniDatabase> CreateAlumniRecordAsync(AlumniDatabaseDto record);

    /// <summary>
    /// Resends the account-claim invitation email for an alumni whose account was generated but not yet claimed.
    /// Throws InvalidOperationException if the record is not linked or has already been claimed.
    /// </summary>
    Task ResendInvitationAsync(Guid alumniId);

    /// <summary>
    /// Parses and validates CSV content without writing to the database.
    /// Returns the same AlumniImportResult shape as ImportAlumniDataAsync.
    /// </summary>
    Task<AlumniImportResult> PreviewImportAsync(string csvContent);
}


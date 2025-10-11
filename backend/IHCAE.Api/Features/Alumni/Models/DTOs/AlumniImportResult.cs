namespace IHCAE.Api.Features.Alumni.Models.DTOs;

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


using System.ComponentModel.DataAnnotations;

namespace IHCAE.Api.Features.Alumni.Models.DTOs;

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


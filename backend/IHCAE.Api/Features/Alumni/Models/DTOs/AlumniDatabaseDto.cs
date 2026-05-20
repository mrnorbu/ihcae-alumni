namespace IHCAE.Api.Features.Alumni.Models.DTOs;

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
    public string? Batch { get; set; }

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

    /// <summary>
    /// Last login time of the matched user. Null means account exists but has never been claimed.
    /// </summary>
    public DateTime? LastLoginAt { get; set; }
}


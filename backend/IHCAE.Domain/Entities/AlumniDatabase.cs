using System.ComponentModel.DataAnnotations;

namespace IHCAE.Domain.Entities;

/// <summary>
/// Represents imported alumni data from external sources (CSV files).
/// This is used for auto-approval matching during user registration.
/// </summary>
public class AlumniDatabase
{
    /// <summary>
    /// Unique identifier for the alumni record
    /// </summary>
    [Key]
    public Guid Id { get; set; }

    /// <summary>
    /// Alumni's first name
    /// </summary>
    [Required]
    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;

    /// <summary>
    /// Alumni's last name
    /// </summary>
    [Required]
    [MaxLength(100)]
    public string LastName { get; set; } = string.Empty;

    /// <summary>
    /// Alumni's email address - used for matching during registration
    /// </summary>
    [Required]
    [EmailAddress]
    [MaxLength(255)]
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Course/program the alumnus completed
    /// </summary>
    [MaxLength(255)]
    public string? Course { get; set; }

    /// <summary>
    /// Year the alumnus graduated
    /// </summary>
    public int? GraduationYear { get; set; }

    /// <summary>
    /// Phone number if available
    /// </summary>
    [MaxLength(50)]
    public string? Phone { get; set; }

    /// <summary>
    /// Location if available
    /// </summary>
    [MaxLength(255)]
    public string? Location { get; set; }

    /// <summary>
    /// When this record was imported into the system
    /// </summary>
    public DateTime ImportedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// ID of the user account that matched this alumni record
    /// Null if no match has been found yet
    /// </summary>
    public Guid? MatchedUserId { get; set; }

    // Navigation properties
    /// <summary>
    /// The user account that matched this alumni record
    /// </summary>
    public virtual User? MatchedUser { get; set; }
}

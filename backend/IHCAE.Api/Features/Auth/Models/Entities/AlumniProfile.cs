using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IHCAE.Api.Features.Auth.Models.Entities;

/// <summary>
/// Represents extended profile information specific to alumni users.
/// This contains additional details beyond the basic User entity.
/// </summary>
public class AlumniProfile
{
    /// <summary>
    /// Foreign key to the User entity - one-to-one relationship
    /// </summary>
    [Key]
    public Guid UserId { get; set; }

    /// <summary>
    /// URL to the user's profile image
    /// Stored as CDN URL after upload to block storage
    /// </summary>
    [MaxLength(1024)]
    public string? ProfileImageUrl { get; set; }

    /// <summary>
    /// Batch or graduation period (e.g., "Batch 1", "Jan 2024")
    /// </summary>
    [MaxLength(100)]
    public string? Batch { get; set; }

    /// <summary>
    /// Course/program the alumnus completed at IHCAE
    /// </summary>
    [MaxLength(255)]
    public string? Course { get; set; }

    /// <summary>
    /// Personal biography or description
    /// </summary>
    public string? Bio { get; set; }

    /// <summary>
    /// Current job title or position
    /// </summary>
    [MaxLength(255)]
    public string? JobTitle { get; set; }

    /// <summary>
    /// Current location (city, state, country)
    /// </summary>
    [MaxLength(255)]
    public string? Location { get; set; }

    /// <summary>
    /// When this profile was created
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// When this profile was last updated
    /// </summary>
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    /// <summary>
    /// The user this profile belongs to
    /// </summary>
    public virtual User User { get; set; } = null!;
}


using System.ComponentModel.DataAnnotations;

namespace IHCAE.Domain.Entities;

/// <summary>
/// Represents a role in the IHCAE Alumni Network system.
/// Roles define what permissions and access levels a user has.
/// </summary>
public class Role
{
    /// <summary>
    /// Unique identifier for the role
    /// </summary>
    [Key]
    public int Id { get; set; }

    /// <summary>
    /// Name of the role - must be unique
    /// Valid values: 'Admin', 'Alumnus', 'Trainee'
    /// </summary>
    [Required]
    [MaxLength(50)]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Description of what this role can do
    /// </summary>
    [MaxLength(255)]
    public string? Description { get; set; }

    /// <summary>
    /// When this role was created
    /// </summary>
    public DateTime CreatedAt { get; set; }

    // Navigation properties
    /// <summary>
    /// Collection of users who have this role
    /// </summary>
    public virtual ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
}

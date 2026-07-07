using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IHCAE.Api.Shared.Models;

/// <summary>
/// Represents the many-to-many relationship between Users and Roles.
/// This allows users to have multiple roles and roles to be assigned to multiple users.
/// </summary>
public class UserRole
{
    /// <summary>
    /// Foreign key to the User entity
    /// </summary>
    [Key, Column(Order = 0)]
    public int UserId { get; set; }

    /// <summary>
    /// Foreign key to the Role entity
    /// </summary>
    [Key, Column(Order = 1)]
    public int RoleId { get; set; }

    /// <summary>
    /// When this role was assigned to the user
    /// </summary>
    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Who assigned this role to the user (Admin user ID)
    /// </summary>
    public int? AssignedBy { get; set; }

    // Navigation properties
    /// <summary>
    /// The user who has this role
    /// </summary>
    public virtual IHCAE.Api.Features.Auth.Models.Entities.User User { get; set; } = null!;

    /// <summary>
    /// The role assigned to the user
    /// </summary>
    public virtual Role Role { get; set; } = null!;
}


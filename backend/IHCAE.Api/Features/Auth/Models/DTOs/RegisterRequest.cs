using System.ComponentModel.DataAnnotations;

namespace IHCAE.Api.Features.Auth.Models.DTOs;

/// <summary>
/// Request DTO for user registration.
/// Contains all required fields for creating a new user account.
/// </summary>
public class RegisterRequest
{
    /// <summary>
    /// User's first name.
    /// </summary>
    [Required(ErrorMessage = "First name is required")]
    [StringLength(100, ErrorMessage = "First name cannot exceed 100 characters")]
    public string FirstName { get; set; } = string.Empty;

    /// <summary>
    /// User's last name.
    /// </summary>
    [Required(ErrorMessage = "Last name is required")]
    [StringLength(100, ErrorMessage = "Last name cannot exceed 100 characters")]
    public string LastName { get; set; } = string.Empty;

    /// <summary>
    /// User's email address.
    /// </summary>
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    [StringLength(255, ErrorMessage = "Email cannot exceed 255 characters")]
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// User's password.
    /// </summary>
    [Required(ErrorMessage = "Password is required")]
    [MinLength(8, ErrorMessage = "Password must be at least 8 characters long")]
    public string Password { get; set; } = string.Empty;

    /// <summary>
    /// User's phone number.
    /// </summary>
    [Required(ErrorMessage = "Phone number is required")]
    [StringLength(50, ErrorMessage = "Phone number cannot exceed 50 characters")]
    public string Phone { get; set; } = string.Empty;

    /// <summary>
    /// Course completed by user.
    /// </summary>
    [Required(ErrorMessage = "Course is required")]
    [StringLength(255, ErrorMessage = "Course name cannot exceed 255 characters")]
    public string Course { get; set; } = string.Empty;

    /// <summary>
    /// Batch completed by user.
    /// </summary>
    [Required(ErrorMessage = "Batch is required")]
    [StringLength(100, ErrorMessage = "Batch details cannot exceed 100 characters")]
    public string Batch { get; set; } = string.Empty;

    /// <summary>
    /// User's location (optional).
    /// </summary>
    [StringLength(255, ErrorMessage = "Location cannot exceed 255 characters")]
    public string? Location { get; set; }

    /// <summary>
    /// User's personal bio (optional).
    /// </summary>
    public string? Bio { get; set; }
}


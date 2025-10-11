using System.ComponentModel.DataAnnotations;

namespace IHCAE.Api.DTOs;

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
}

/// <summary>
/// Request DTO for user login.
/// Contains credentials for authentication.
/// </summary>
public class LoginRequest
{
    /// <summary>
    /// User's email address.
    /// </summary>
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// User's password.
    /// </summary>
    [Required(ErrorMessage = "Password is required")]
    public string Password { get; set; } = string.Empty;
}

/// <summary>
/// Response DTO for successful registration.
/// Contains confirmation details for the newly registered user.
/// </summary>
public class RegisterResponse
{
    /// <summary>
    /// Whether the registration was successful.
    /// </summary>
    public bool Success { get; set; }

    /// <summary>
    /// Confirmation message for the user.
    /// </summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// The ID of the created user.
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// The status of the user account.
    /// </summary>
    public string Status { get; set; } = string.Empty;
}

/// <summary>
/// Response DTO for successful login.
/// Contains authentication token and user information.
/// </summary>
public class LoginResponse
{
    /// <summary>
    /// Whether the login was successful.
    /// </summary>
    public bool Success { get; set; }

    /// <summary>
    /// JWT access token for API authentication.
    /// </summary>
    public string Token { get; set; } = string.Empty;

    /// <summary>
    /// Summary information about the authenticated user.
    /// </summary>
    public UserSummaryDto User { get; set; } = null!;
}

/// <summary>
/// Response DTO for successful logout.
/// Contains confirmation of logout operation.
/// </summary>
public class LogoutResponse
{
    /// <summary>
    /// Whether the logout was successful.
    /// </summary>
    public bool Success { get; set; }

    /// <summary>
    /// Confirmation message.
    /// </summary>
    public string Message { get; set; } = string.Empty;
}

/// <summary>
/// DTO containing summary information about a user.
/// Used in API responses where full user details are not needed.
/// </summary>
public class UserSummaryDto
{
    /// <summary>
    /// User's unique identifier.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// User's first name.
    /// </summary>
    public string FirstName { get; set; } = string.Empty;

    /// <summary>
    /// User's last name.
    /// </summary>
    public string LastName { get; set; } = string.Empty;

    /// <summary>
    /// User's email address.
    /// </summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// User's account status.
    /// </summary>
    public string Status { get; set; } = string.Empty;

    /// <summary>
    /// Whether the user's email has been verified.
    /// </summary>
    public bool EmailVerified { get; set; }

    /// <summary>
    /// Date when the user account was created.
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Date of the user's last login (if any).
    /// </summary>
    public DateTime? LastLoginAt { get; set; }

    /// <summary>
    /// List of roles assigned to the user.
    /// </summary>
    public List<string> Roles { get; set; } = new();
}

/// <summary>
/// Request DTO for forgot password functionality.
/// Contains email address for password reset.
/// </summary>
public class ForgotPasswordRequest
{
    /// <summary>
    /// User's email address.
    /// </summary>
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    public string Email { get; set; } = string.Empty;
}

/// <summary>
/// Request DTO for password reset functionality.
/// Contains token and new password.
/// </summary>
public class ResetPasswordRequest
{
    /// <summary>
    /// Password reset token.
    /// </summary>
    [Required(ErrorMessage = "Reset token is required")]
    public string Token { get; set; } = string.Empty;

    /// <summary>
    /// New password.
    /// </summary>
    [Required(ErrorMessage = "Password is required")]
    [MinLength(8, ErrorMessage = "Password must be at least 8 characters long")]
    public string Password { get; set; } = string.Empty;
}

/// <summary>
/// Request DTO for changing password.
/// Contains current and new password.
/// </summary>
public class ChangePasswordRequest
{
    /// <summary>
    /// Current password.
    /// </summary>
    [Required(ErrorMessage = "Current password is required")]
    public string CurrentPassword { get; set; } = string.Empty;

    /// <summary>
    /// New password.
    /// </summary>
    [Required(ErrorMessage = "New password is required")]
    [MinLength(8, ErrorMessage = "Password must be at least 8 characters long")]
    public string NewPassword { get; set; } = string.Empty;
}

/// <summary>
/// Request DTO for email verification.
/// Contains verification token.
/// </summary>
public class VerifyEmailRequest
{
    /// <summary>
    /// Email verification token.
    /// </summary>
    [Required(ErrorMessage = "Verification token is required")]
    public string Token { get; set; } = string.Empty;
}

/// <summary>
/// Request DTO for resending email verification.
/// Contains email address.
/// </summary>
public class ResendVerificationRequest
{
    /// <summary>
    /// User's email address.
    /// </summary>
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    public string Email { get; set; } = string.Empty;
}

/// <summary>
/// Request DTO for updating user profile.
/// Contains editable user information.
/// </summary>
public class UpdateProfileRequest
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
}

/// <summary>
/// Response DTO for authentication operations.
/// Contains success status and message.
/// </summary>
public class AuthResponse
{
    /// <summary>
    /// Whether the operation was successful.
    /// </summary>
    public bool Success { get; set; }

    /// <summary>
    /// Response message.
    /// </summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// Additional data (optional).
    /// </summary>
    public object? Data { get; set; }
}

/// <summary>
/// Request DTO for user filtering in admin operations.
/// Contains filter criteria for user queries.
/// </summary>
public class UserFilterDto
{
    /// <summary>
    /// Filter by user status.
    /// </summary>
    public string? Status { get; set; }

    /// <summary>
    /// Filter by email verification status.
    /// </summary>
    public bool? EmailVerified { get; set; }

    /// <summary>
    /// Filter by ban status.
    /// </summary>
    public bool? IsBanned { get; set; }

    /// <summary>
    /// Search term for name or email.
    /// </summary>
    public string? SearchTerm { get; set; }

    /// <summary>
    /// Page number for pagination.
    /// </summary>
    public int Page { get; set; } = 1;

    /// <summary>
    /// Page size for pagination.
    /// </summary>
    public int PageSize { get; set; } = 10;
}

/// <summary>
/// Request DTO for updating user status.
/// Contains new status for user account.
/// </summary>
public class UserUpdateStatusRequest
{
    /// <summary>
    /// New status for the user account.
    /// </summary>
    [Required(ErrorMessage = "Status is required")]
    public string Status { get; set; } = string.Empty;
}

/// <summary>
/// Request DTO for updating user roles.
/// Contains list of role names to assign.
/// </summary>
public class UserUpdateRolesRequest
{
    /// <summary>
    /// List of role names to assign to the user.
    /// </summary>
    [Required(ErrorMessage = "Roles are required")]
    public List<string> Roles { get; set; } = new();
}

/// <summary>
/// Standard error response DTO for API error handling.
/// Provides consistent error response format across all endpoints.
/// </summary>
public class ErrorResponse
{
    /// <summary>
    /// HTTP status code.
    /// </summary>
    public int StatusCode { get; set; }

    /// <summary>
    /// Error message describing what went wrong.
    /// </summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// List of specific validation errors (if applicable).
    /// </summary>
    public List<string>? Errors { get; set; }

    /// <summary>
    /// Timestamp when the error occurred.
    /// </summary>
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}

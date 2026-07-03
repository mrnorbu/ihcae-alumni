using Microsoft.AspNetCore.Mvc;
using IHCAE.Api.Features.PasswordReset.Services;
using Microsoft.Extensions.Logging;

namespace IHCAE.Api.Features.PasswordReset.Controllers;

/// <summary>
/// Controller for handling password reset operations.
/// Provides secure endpoints for initiating and completing password resets.
/// </summary>
[ApiController]
[Route("api/v1/[controller]")]
public class PasswordResetController : ControllerBase
{
    private readonly IPasswordResetService _passwordResetService;
    private readonly ILogger<PasswordResetController> _logger;

    public PasswordResetController(
        IPasswordResetService passwordResetService,
        ILogger<PasswordResetController> logger)
    {
        _passwordResetService = passwordResetService;
        _logger = logger;
    }

    /// <summary>
    /// Initiates a password reset by sending a reset email to the user.
    /// </summary>
    /// <param name="request">The password reset request containing the email address</param>
    /// <returns>Success response if email was sent</returns>
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        if (string.IsNullOrEmpty(request.Email))
        {
            return BadRequest(new { success = false, message = "Email address is required" });
        }

        try
        {
            var result = await _passwordResetService.InitiatePasswordResetAsync(request.Email);
            
            // Always return success to prevent email enumeration attacks
            _logger.LogInformation("Password reset request processed for email {Email}", request.Email);
            return Ok(new { 
                success = true, 
                message = "If an account with that email exists, a password reset link has been sent." 
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing password reset request for email {Email}", request.Email);
            return StatusCode(500, new { success = false, message = "An error occurred while processing your request" });
        }
    }

    /// <summary>
    /// Resets the user's password using the provided token.
    /// </summary>
    /// <param name="request">The password reset request containing token and new password</param>
    /// <returns>Success response if password was reset</returns>
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        if (string.IsNullOrEmpty(request.Token))
        {
            return BadRequest(new { success = false, message = "Reset token is required" });
        }

        if (string.IsNullOrEmpty(request.NewPassword))
        {
            return BadRequest(new { success = false, message = "New password is required" });
        }

        // Validate password strength
        if (!_passwordResetService.IsValidPassword(request.NewPassword))
        {
            _logger.LogWarning("Password validation failed: password does not meet requirements.");
            return BadRequest(new { 
                success = false, 
                message = "Password must be at least 8 characters long" 
            });
        }

        try
        {
            var result = await _passwordResetService.ResetPasswordAsync(request.Token, request.NewPassword);
            
            if (result)
            {
                _logger.LogInformation("Password reset completed successfully");
                return Ok(new { success = true, message = "Password has been reset successfully" });
            }
            else
            {
                _logger.LogWarning("Password reset failed - invalid or expired token");
                return BadRequest(new { success = false, message = "Invalid or expired reset token" });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error resetting password with token");
            return StatusCode(500, new { success = false, message = "An error occurred while resetting your password" });
        }
    }

    /// <summary>
    /// Checks whether a token is valid and unused, without consuming it.
    /// Used by the frontend to show the expired state immediately on page load.
    /// </summary>
    [HttpGet("validate-token")]
    public async Task<IActionResult> ValidateToken([FromQuery] string token)
    {
        if (string.IsNullOrEmpty(token))
            return BadRequest(new { valid = false });

        try
        {
            var isValid = await _passwordResetService.ValidateTokenAsync(token);
            return Ok(new { valid = isValid });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating token");
            return Ok(new { valid = false });
        }
    }

    /// <summary>
    /// Validates a password against security requirements.
    /// </summary>
    /// <param name="request">The password validation request</param>
    /// <returns>Validation result</returns>
    [HttpPost("validate-password")]
    public IActionResult ValidatePassword([FromBody] ValidatePasswordRequest request)
    {
        if (string.IsNullOrEmpty(request.Password))
        {
            return BadRequest(new { success = false, message = "Password is required" });
        }

        try
        {
            var isValid = _passwordResetService.IsValidPassword(request.Password);
            
            return Ok(new { 
                success = true, 
                isValid = isValid,
                message = isValid ? "Password meets security requirements" : "Password does not meet security requirements"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating password");
            return StatusCode(500, new { success = false, message = "An error occurred while validating the password" });
        }
    }
}

/// <summary>
/// Request model for forgot password endpoint.
/// </summary>
public class ForgotPasswordRequest
{
    /// <summary>
    /// The email address of the user requesting password reset.
    /// </summary>
    public string Email { get; set; } = string.Empty;
}

/// <summary>
/// Request model for reset password endpoint.
/// </summary>
public class ResetPasswordRequest
{
    /// <summary>
    /// The password reset token from the email.
    /// </summary>
    public string Token { get; set; } = string.Empty;

    /// <summary>
    /// The new password to set.
    /// </summary>
    public string NewPassword { get; set; } = string.Empty;
}

/// <summary>
/// Request model for password validation endpoint.
/// </summary>
public class ValidatePasswordRequest
{
    /// <summary>
    /// The password to validate.
    /// </summary>
    public string Password { get; set; } = string.Empty;
}

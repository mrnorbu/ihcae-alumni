using Microsoft.AspNetCore.Mvc;
using IHCAE.Api.Features.EmailVerification.Services;
using Microsoft.Extensions.Logging;

namespace IHCAE.Api.Features.EmailVerification.Controllers;

/// <summary>
/// Controller for handling email verification operations.
/// </summary>
[ApiController]
[Route("api/v1/[controller]")]
public class EmailVerificationController : ControllerBase
{
    private readonly IEmailVerificationService _emailVerificationService;
    private readonly ILogger<EmailVerificationController> _logger;

    public EmailVerificationController(
        IEmailVerificationService emailVerificationService,
        ILogger<EmailVerificationController> logger)
    {
        _emailVerificationService = emailVerificationService;
        _logger = logger;
    }

    /// <summary>
    /// Sends a verification email to the specified user.
    /// </summary>
    /// <param name="userId">The ID of the user to send verification email to</param>
    /// <returns>Success response if email was sent</returns>
    [HttpPost("send/{userId}")]
    public async Task<IActionResult> SendVerificationEmail(Guid userId)
    {
        try
        {
            var result = await _emailVerificationService.SendVerificationEmailAsync(userId);
            
            if (result)
            {
                _logger.LogInformation("Verification email sent successfully for user {UserId}", userId);
                return Ok(new { success = true, message = "Verification email sent successfully" });
            }
            else
            {
                _logger.LogWarning("Failed to send verification email for user {UserId}", userId);
                return BadRequest(new { success = false, message = "Failed to send verification email" });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending verification email for user {UserId}", userId);
            return StatusCode(500, new { success = false, message = "An error occurred while sending verification email" });
        }
    }

    /// <summary>
    /// Verifies an email address using the provided token.
    /// </summary>
    /// <param name="token">The verification token from the email</param>
    /// <returns>Success response if verification was successful</returns>
    [HttpPost("verify")]
    public async Task<IActionResult> VerifyEmail([FromQuery] string token)
    {
        if (string.IsNullOrEmpty(token))
        {
            return BadRequest(new { success = false, message = "Verification token is required" });
        }

        try
        {
            var result = await _emailVerificationService.VerifyEmailAsync(token);
            
            if (result)
            {
                _logger.LogInformation("Email verified successfully with token");
                return Ok(new { success = true, message = "Email verified successfully" });
            }
            else
            {
                _logger.LogWarning("Email verification failed with token");
                return BadRequest(new { success = false, message = "Invalid or expired verification token" });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying email with token");
            return StatusCode(500, new { success = false, message = "An error occurred while verifying email" });
        }
    }

    /// <summary>
    /// Checks if a user's email is verified.
    /// </summary>
    /// <param name="userId">The user ID to check</param>
    /// <returns>Email verification status</returns>
    [HttpGet("status/{userId}")]
    public async Task<IActionResult> GetEmailVerificationStatus(Guid userId)
    {
        try
        {
            var isVerified = await _emailVerificationService.IsEmailVerifiedAsync(userId);
            
            return Ok(new { 
                success = true, 
                isVerified = isVerified,
                message = isVerified ? "Email is verified" : "Email is not verified"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking email verification status for user {UserId}", userId);
            return StatusCode(500, new { success = false, message = "An error occurred while checking verification status" });
        }
    }
}

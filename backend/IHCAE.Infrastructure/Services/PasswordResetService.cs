using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using IHCAE.Domain.Entities;
using IHCAE.Infrastructure.Data;
using IHCAE.Application.Interfaces;
using System.Security.Cryptography;
using System.Text;
using BCrypt.Net;

namespace IHCAE.Infrastructure.Services;

/// <summary>
/// Service for handling password reset functionality.
/// Provides secure password reset token generation, validation, and password updates.
/// </summary>
public class PasswordResetService : IPasswordResetService
{
    private readonly AppDbContext _context;
    private readonly IEmailService _emailService;
    private readonly ILogger<PasswordResetService> _logger;

    public PasswordResetService(
        AppDbContext context,
        IEmailService emailService,
        ILogger<PasswordResetService> logger)
    {
        _context = context;
        _emailService = emailService;
        _logger = logger;
    }

    /// <summary>
    /// Initiates a password reset by sending a reset email to the user.
    /// </summary>
    /// <param name="email">The email address of the user requesting password reset</param>
    /// <returns>True if the reset email was sent successfully, false otherwise</returns>
    public async Task<bool> InitiatePasswordResetAsync(string email)
    {
        try
        {
            // Find user by email
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null)
            {
                // Don't reveal if email exists or not for security
                _logger.LogWarning("Password reset requested for non-existent email: {Email}", email);
                return true; // Return true to prevent email enumeration attacks
            }

            // Invalidate any existing unused reset tokens for this user
            await InvalidateExistingTokensAsync(user.Id);

            // Generate new reset token
            var token = GenerateSecureToken();
            var tokenHash = HashToken(token);

            var resetToken = new PasswordResetToken
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                TokenHash = tokenHash,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddHours(1), // 1 hour expiration
                IsUsed = false
            };

            _context.PasswordResetTokens.Add(resetToken);
            await _context.SaveChangesAsync();

            // Send password reset email
            var resetUrl = GenerateResetUrl(token);
            var emailBody = GenerateResetEmailBody(user.FirstName, resetUrl);

            await _emailService.SendEmailAsync(
                user.Email,
                "Reset Your IHCAE Alumni Network Password",
                emailBody
            );

            _logger.LogInformation("Password reset email sent to {Email} for user {UserId}", user.Email, user.Id);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to initiate password reset for email {Email}", email);
            return false;
        }
    }

    /// <summary>
    /// Resets the user's password using the provided token.
    /// </summary>
    /// <param name="token">The password reset token</param>
    /// <param name="newPassword">The new password</param>
    /// <returns>True if password was reset successfully, false otherwise</returns>
    public async Task<bool> ResetPasswordAsync(string token, string newPassword)
    {
        try
        {
            var tokenHash = HashToken(token);
            var resetToken = await _context.PasswordResetTokens
                .Include(rt => rt.User)
                .FirstOrDefaultAsync(rt => rt.TokenHash == tokenHash && !rt.IsUsed);

            if (resetToken == null)
            {
                _logger.LogWarning("Invalid or expired password reset token used");
                return false;
            }

            if (resetToken.ExpiresAt < DateTime.UtcNow)
            {
                _logger.LogWarning("Expired password reset token used for user {UserId}", resetToken.UserId);
                return false;
            }

            // Validate new password meets requirements
            if (!IsValidPassword(newPassword))
            {
                _logger.LogWarning("Invalid password provided for reset for user {UserId}", resetToken.UserId);
                return false;
            }

            // Mark token as used
            resetToken.IsUsed = true;
            resetToken.UsedAt = DateTime.UtcNow;

            // Update user password
            resetToken.User.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword, 12);
            resetToken.User.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Send confirmation email
            await _emailService.SendEmailAsync(
                resetToken.User.Email,
                "Password Reset Successful - IHCAE Alumni Network",
                GeneratePasswordResetConfirmationEmailBody(resetToken.User.FirstName)
            );

            _logger.LogInformation("Password reset successfully for user {UserId}", resetToken.UserId);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to reset password with token");
            return false;
        }
    }

    /// <summary>
    /// Validates if a password meets the security requirements.
    /// </summary>
    /// <param name="password">The password to validate</param>
    /// <returns>True if password is valid, false otherwise</returns>
    public bool IsValidPassword(string password)
    {
        if (string.IsNullOrEmpty(password))
            return false;

        // Password requirements:
        // - At least 8 characters
        // - At least one uppercase letter
        // - At least one lowercase letter
        // - At least one digit
        // - At least one special character
        if (password.Length < 8)
            return false;

        bool hasUpper = password.Any(char.IsUpper);
        bool hasLower = password.Any(char.IsLower);
        bool hasDigit = password.Any(char.IsDigit);
        bool hasSpecial = password.Any(c => !char.IsLetterOrDigit(c));

        return hasUpper && hasLower && hasDigit && hasSpecial;
    }

    /// <summary>
    /// Invalidates all unused password reset tokens for a user.
    /// </summary>
    /// <param name="userId">The user ID</param>
    private async Task InvalidateExistingTokensAsync(Guid userId)
    {
        var existingTokens = await _context.PasswordResetTokens
            .Where(rt => rt.UserId == userId && !rt.IsUsed)
            .ToListAsync();

        foreach (var token in existingTokens)
        {
            token.IsUsed = true;
            token.UsedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
    }

    /// <summary>
    /// Generates a secure random token.
    /// </summary>
    /// <returns>A base64-encoded random token</returns>
    private static string GenerateSecureToken()
    {
        var randomBytes = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);
        return Convert.ToBase64String(randomBytes);
    }

    /// <summary>
    /// Hashes a token using SHA256 for secure storage.
    /// </summary>
    /// <param name="token">The token to hash</param>
    /// <returns>The hashed token</returns>
    private static string HashToken(string token)
    {
        using var sha256 = SHA256.Create();
        var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(token));
        return Convert.ToBase64String(hashedBytes);
    }

    /// <summary>
    /// Generates the password reset URL for the token.
    /// </summary>
    /// <param name="token">The reset token</param>
    /// <returns>The complete reset URL</returns>
    private static string GenerateResetUrl(string token)
    {
        // In production, this should come from configuration
        var baseUrl = "http://localhost:4200"; // Frontend URL
        return $"{baseUrl}/reset-password?token={Uri.EscapeDataString(token)}";
    }

    /// <summary>
    /// Generates the HTML email body for password reset.
    /// </summary>
    /// <param name="firstName">The user's first name</param>
    /// <param name="resetUrl">The reset URL</param>
    /// <returns>The HTML email body</returns>
    private static string GenerateResetEmailBody(string firstName, string resetUrl)
    {
        return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Reset Your Password - IHCAE Alumni Network</title>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #059669, #047857); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
        .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
        .button {{ display: inline-block; background: #059669; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
        .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 14px; }}
        .warning {{ background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>🏔️ IHCAE Alumni Network</h1>
            <p>Password Reset Request</p>
        </div>
        <div class='content'>
            <h2>Hello {firstName}!</h2>
            <p>We received a request to reset your password for your IHCAE Alumni Network account.</p>
            <p>If you made this request, click the button below to reset your password:</p>
            <div style='text-align: center;'>
                <a href='{resetUrl}' class='button'>Reset My Password</a>
            </div>
            <div class='warning'>
                <p><strong>⚠️ Important Security Information:</strong></p>
                <ul>
                    <li>This link will expire in <strong>1 hour</strong> for security reasons</li>
                    <li>If you didn't request this reset, please ignore this email</li>
                    <li>Your password will remain unchanged until you click the link above</li>
                </ul>
            </div>
            <p><strong>Password Requirements:</strong></p>
            <ul>
                <li>At least 8 characters long</li>
                <li>Contains uppercase and lowercase letters</li>
                <li>Contains at least one number</li>
                <li>Contains at least one special character</li>
            </ul>
            <hr style='margin: 30px 0; border: none; border-top: 1px solid #ddd;'>
            <p><strong>Need Help?</strong></p>
            <p>If you're having trouble with the link above, copy and paste the following URL into your browser:</p>
            <p style='word-break: break-all; background: #f0f0f0; padding: 10px; border-radius: 3px; font-family: monospace;'>{resetUrl}</p>
        </div>
        <div class='footer'>
            <p>© 2024 IHCAE Alumni Network. All rights reserved.</p>
            <p>Gangtok, Sikkim, India</p>
        </div>
    </div>
</body>
</html>";
    }

    /// <summary>
    /// Generates the HTML email body for password reset confirmation.
    /// </summary>
    /// <param name="firstName">The user's first name</param>
    /// <returns>The HTML email body</returns>
    private static string GeneratePasswordResetConfirmationEmailBody(string firstName)
    {
        return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Password Reset Successful - IHCAE Alumni Network</title>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #059669, #047857); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
        .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
        .success {{ background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0; }}
        .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 14px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>🏔️ IHCAE Alumni Network</h1>
            <p>Password Reset Successful</p>
        </div>
        <div class='content'>
            <h2>Hello {firstName}!</h2>
            <div class='success'>
                <p><strong>✅ Your password has been successfully reset!</strong></p>
            </div>
            <p>Your IHCAE Alumni Network account password has been updated. You can now sign in with your new password.</p>
            <p><strong>Security Tips:</strong></p>
            <ul>
                <li>Use a unique password that you don't use elsewhere</li>
                <li>Consider using a password manager</li>
                <li>Never share your password with anyone</li>
                <li>Sign out of your account when using shared computers</li>
            </ul>
            <hr style='margin: 30px 0; border: none; border-top: 1px solid #ddd;'>
            <p><strong>Didn't make this change?</strong></p>
            <p>If you didn't reset your password, please contact our support team immediately as your account may have been compromised.</p>
        </div>
        <div class='footer'>
            <p>© 2024 IHCAE Alumni Network. All rights reserved.</p>
            <p>Gangtok, Sikkim, India</p>
        </div>
    </div>
</body>
</html>";
    }
}

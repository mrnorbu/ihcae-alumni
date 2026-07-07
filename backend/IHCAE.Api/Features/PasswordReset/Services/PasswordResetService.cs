using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using IHCAE.Api.Features.Auth.Models.Entities;
using IHCAE.Api.Features.PasswordReset.Models.Entities;
using IHCAE.Api.Shared.Data;
using IHCAE.Api.Features.PasswordReset.Services;
using IHCAE.Api.Features.Auth.Repositories;
using IHCAE.Api.Shared.Services;
using System.Security.Cryptography;
using System.Text;
using BCrypt.Net;

namespace IHCAE.Api.Features.PasswordReset.Services;

/// <summary>
/// Service for handling password reset functionality.
/// Provides secure password reset token generation, validation, and password updates.
/// </summary>
public class PasswordResetService : IPasswordResetService
{
    private readonly AppDbContext _context;
    private readonly IEmailService _emailService;
    private readonly ILogger<PasswordResetService> _logger;
    private readonly IUrlHelperService _urlHelperService;

    public PasswordResetService(
        AppDbContext context,
        IEmailService emailService,
        ILogger<PasswordResetService> logger,
        IUrlHelperService urlHelperService)
    {
        _context = context;
        _emailService = emailService;
        _logger = logger;
        _urlHelperService = urlHelperService;
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

            await _emailService.SendPasswordResetAsync(
                user.Email,
                user.FirstName,
                resetUrl
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
            await _emailService.SendPasswordResetConfirmationAsync(
                resetToken.User.Email,
                resetToken.User.FirstName
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
        return password.Length >= 8;
    }

    /// <summary>
    /// Invalidates all unused password reset tokens for a user.
    /// </summary>
    /// <param name="userId">The user ID</param>
    private async Task InvalidateExistingTokensAsync(int userId)
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
        // URL-safe base64: survives email clients and URL encoding round-trips
        return Convert.ToBase64String(randomBytes)
            .Replace('+', '-').Replace('/', '_').TrimEnd('=');
    }

    public async Task<bool> ValidateTokenAsync(string token)
    {
        var tokenHash = HashToken(token);
        var resetToken = await _context.PasswordResetTokens
            .FirstOrDefaultAsync(rt => rt.TokenHash == tokenHash && !rt.IsUsed);
        return resetToken != null && resetToken.ExpiresAt >= DateTime.UtcNow;
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
    private string GenerateResetUrl(string token)
    {
        var baseUrl = _urlHelperService.GetFrontendUrl();
        return $"{baseUrl}/reset-password?token={Uri.EscapeDataString(token)}";
    }
}

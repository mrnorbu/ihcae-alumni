using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using IHCAE.Api.Features.Auth.Models.Entities;
using IHCAE.Api.Features.EmailVerification.Models.Entities;
using IHCAE.Api.Shared.Data;
using IHCAE.Api.Features.EmailVerification.Services;
using IHCAE.Api.Features.Auth.Repositories;
using IHCAE.Api.Shared.Services;
using System.Security.Cryptography;
using System.Text;

namespace IHCAE.Api.Features.EmailVerification.Services;

/// <summary>
/// Service for handling email verification functionality.
/// </summary>
public class EmailVerificationService : IEmailVerificationService
{
    private readonly AppDbContext _context;
    private readonly IEmailService _emailService;
    private readonly ILogger<EmailVerificationService> _logger;

    public EmailVerificationService(
        AppDbContext context,
        IEmailService emailService,
        ILogger<EmailVerificationService> logger)
    {
        _context = context;
        _emailService = emailService;
        _logger = logger;
    }

    /// <summary>
    /// Generates and sends an email verification token for the specified user.
    /// </summary>
    /// <param name="userId">The ID of the user to send verification email to</param>
    /// <returns>True if the email was sent successfully, false otherwise</returns>
    public async Task<bool> SendVerificationEmailAsync(Guid userId)
    {
        try
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                _logger.LogWarning("User {UserId} not found for email verification", userId);
                return false;
            }

            // Invalidate any existing unused verification tokens for this user
            await InvalidateExistingTokensAsync(userId);

            // Generate new verification token
            var token = GenerateSecureToken();
            var tokenHash = HashToken(token);

            var verificationToken = new EmailVerificationToken
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                TokenHash = tokenHash,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddHours(24), // 24 hours expiration
                IsUsed = false
            };

            _context.EmailVerificationTokens.Add(verificationToken);
            await _context.SaveChangesAsync();

            // Send verification email
            var verificationUrl = GenerateVerificationUrl(token);
            var emailBody = GenerateVerificationEmailBody(user.FirstName, verificationUrl);

            await _emailService.SendEmailAsync(
                user.Email,
                "Verify Your IHCAE Alumni Network Account",
                emailBody
            );

            _logger.LogInformation("Verification email sent to {Email} for user {UserId}", user.Email, userId);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send verification email for user {UserId}", userId);
            return false;
        }
    }

    /// <summary>
    /// Verifies an email using the provided token.
    /// </summary>
    /// <param name="token">The verification token</param>
    /// <returns>True if verification was successful, false otherwise</returns>
    public async Task<bool> VerifyEmailAsync(string token)
    {
        try
        {
            var tokenHash = HashToken(token);
            var verificationToken = await _context.EmailVerificationTokens
                .Include(vt => vt.User)
                .FirstOrDefaultAsync(vt => vt.TokenHash == tokenHash && !vt.IsUsed);

            if (verificationToken == null)
            {
                _logger.LogWarning("Invalid or expired verification token used");
                return false;
            }

            if (verificationToken.ExpiresAt < DateTime.UtcNow)
            {
                _logger.LogWarning("Expired verification token used for user {UserId}", verificationToken.UserId);
                return false;
            }

            // Mark token as used
            verificationToken.IsUsed = true;
            verificationToken.UsedAt = DateTime.UtcNow;

            // Mark user email as verified
            verificationToken.User.EmailVerified = true;
            verificationToken.User.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Email verified successfully for user {UserId}", verificationToken.UserId);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to verify email with token");
            return false;
        }
    }

    /// <summary>
    /// Checks if a user's email is verified.
    /// </summary>
    /// <param name="userId">The user ID to check</param>
    /// <returns>True if the user's email is verified, false otherwise</returns>
    public async Task<bool> IsEmailVerifiedAsync(Guid userId)
    {
        var user = await _context.Users.FindAsync(userId);
        return user?.EmailVerified ?? false;
    }

    /// <summary>
    /// Invalidates all unused verification tokens for a user.
    /// </summary>
    /// <param name="userId">The user ID</param>
    private async Task InvalidateExistingTokensAsync(Guid userId)
    {
        var existingTokens = await _context.EmailVerificationTokens
            .Where(vt => vt.UserId == userId && !vt.IsUsed)
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
    /// Generates the verification URL for the token.
    /// </summary>
    /// <param name="token">The verification token</param>
    /// <returns>The complete verification URL</returns>
    private static string GenerateVerificationUrl(string token)
    {
        // In production, this should come from configuration
        var baseUrl = "http://localhost:4200"; // Frontend URL
        return $"{baseUrl}/verify-email?token={Uri.EscapeDataString(token)}";
    }

    /// <summary>
    /// Generates the HTML email body for verification.
    /// </summary>
    /// <param name="firstName">The user's first name</param>
    /// <param name="verificationUrl">The verification URL</param>
    /// <returns>The HTML email body</returns>
    private static string GenerateVerificationEmailBody(string firstName, string verificationUrl)
    {
        return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Verify Your Email - IHCAE Alumni Network</title>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #059669, #047857); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
        .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
        .button {{ display: inline-block; background: #059669; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
        .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 14px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>🏔️ IHCAE Alumni Network</h1>
            <p>Email Verification Required</p>
        </div>
        <div class='content'>
            <h2>Hello {firstName}!</h2>
            <p>Welcome to the IHCAE Alumni Network! We're excited to have you join our community of mountaineers, eco-tourism professionals, and conservation champions.</p>
            <p>To complete your registration and access all features, please verify your email address by clicking the button below:</p>
            <div style='text-align: center;'>
                <a href='{verificationUrl}' class='button'>Verify My Email Address</a>
            </div>
            <p><strong>Important:</strong> This verification link will expire in 24 hours for security reasons.</p>
            <p>If you didn't create an account with us, please ignore this email.</p>
            <hr style='margin: 30px 0; border: none; border-top: 1px solid #ddd;'>
            <p><strong>What's Next?</strong></p>
            <ul>
                <li>✅ Verify your email (this step)</li>
                <li>⏳ Wait for admin approval</li>
                <li>🎉 Access the full alumni network</li>
            </ul>
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

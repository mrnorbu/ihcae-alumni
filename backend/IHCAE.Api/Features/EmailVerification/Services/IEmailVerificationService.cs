namespace IHCAE.Api.Features.EmailVerification.Services;

/// <summary>
/// Interface for email verification functionality.
/// </summary>
public interface IEmailVerificationService
{
    /// <summary>
    /// Generates and sends an email verification token for the specified user.
    /// </summary>
    /// <param name="userId">The ID of the user to send verification email to</param>
    /// <returns>True if the email was sent successfully, false otherwise</returns>
    Task<bool> SendVerificationEmailAsync(Guid userId);

    /// <summary>
    /// Verifies an email using the provided token.
    /// </summary>
    /// <param name="token">The verification token</param>
    /// <returns>True if verification was successful, false otherwise</returns>
    Task<bool> VerifyEmailAsync(string token);

    /// <summary>
    /// Checks if a user's email is verified.
    /// </summary>
    /// <param name="userId">The user ID to check</param>
    /// <returns>True if the user's email is verified, false otherwise</returns>
    Task<bool> IsEmailVerifiedAsync(Guid userId);
}

namespace IHCAE.Api.Features.PasswordReset.Services;

/// <summary>
/// Interface for password reset functionality.
/// Provides secure password reset operations including token generation and validation.
/// </summary>
public interface IPasswordResetService
{
    /// <summary>
    /// Initiates a password reset by sending a reset email to the user.
    /// </summary>
    /// <param name="email">The email address of the user requesting password reset</param>
    /// <returns>True if the reset email was sent successfully, false otherwise</returns>
    Task<bool> InitiatePasswordResetAsync(string email);

    /// <summary>
    /// Resets the user's password using the provided token.
    /// </summary>
    /// <param name="token">The password reset token</param>
    /// <param name="newPassword">The new password</param>
    /// <returns>True if password was reset successfully, false otherwise</returns>
    Task<bool> ResetPasswordAsync(string token, string newPassword);

    /// <summary>
    /// Checks whether a token exists, is unused, and has not expired — without consuming it.
    /// </summary>
    Task<bool> ValidateTokenAsync(string token);

    /// <summary>
    /// Validates if a password meets the security requirements.
    /// </summary>
    /// <param name="password">The password to validate</param>
    /// <returns>True if password is valid, false otherwise</returns>
    bool IsValidPassword(string password);
}

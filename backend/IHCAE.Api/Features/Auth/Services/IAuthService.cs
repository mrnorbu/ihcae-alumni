using IHCAE.Api.Features.Auth.Models.Entities;
using IHCAE.Api.Features.Auth.Models.DTOs;

namespace IHCAE.Api.Features.Auth.Services;

/// <summary>
/// Service interface for authentication operations.
/// Handles user registration, login, and token management.
/// </summary>
public interface IAuthService
{
    /// <summary>
    /// Registers a new user with auto-approval logic based on alumni database matching.
    /// </summary>
    /// <param name="firstName">User's first name</param>
    /// <param name="lastName">User's last name</param>
    /// <param name="email">User's email address</param>
    /// <param name="password">User's plain text password</param>
    /// <returns>The created user entity</returns>
    Task<User> RegisterAsync(
        string firstName,
        string lastName,
        string email,
        string password,
        string phone,
        string course,
        string batch,
        string? location = null,
        string? bio = null
    );

    /// <summary>
    /// Authenticates a user with email and password.
    /// </summary>
    /// <param name="email">User's email address</param>
    /// <param name="password">User's plain text password</param>
    /// <returns>Authentication result with user and tokens if successful</returns>
    Task<AuthResult> LoginAsync(string email, string password);

    /// <summary>
    /// Refreshes an access token using a valid refresh token.
    /// </summary>
    /// <param name="refreshToken">The refresh token to use</param>
    /// <returns>New authentication result with fresh tokens</returns>
    Task<AuthResult> RefreshTokenAsync(string refreshToken);

    /// <summary>
    /// Revokes a refresh token, invalidating it.
    /// </summary>
    /// <param name="refreshToken">The refresh token to revoke</param>
    /// <returns>True if token was revoked, false if not found</returns>
    Task<bool> RevokeRefreshTokenAsync(string refreshToken);

    /// <summary>
    /// Generates a JWT access token for a user.
    /// </summary>
    /// <param name="user">The user to generate token for</param>
    /// <returns>The JWT access token</returns>
    string GenerateAccessToken(User user);

    /// <summary>
    /// Generates a refresh token for a user.
    /// </summary>
    /// <param name="user">The user to generate token for</param>
    /// <returns>The refresh token</returns>
    Task<string> GenerateRefreshTokenAsync(User user);

    /// <summary>
    /// Verifies a password against a user's stored hash.
    /// </summary>
    /// <param name="password">Plain text password to verify</param>
    /// <param name="hash">Stored password hash</param>
    /// <returns>True if password matches, false otherwise</returns>
    bool VerifyPassword(string password, string hash);

    /// <summary>
    /// Hashes a plain text password using BCrypt.
    /// </summary>
    /// <param name="password">Plain text password to hash</param>
    /// <returns>The hashed password</returns>
    string HashPassword(string password);
}


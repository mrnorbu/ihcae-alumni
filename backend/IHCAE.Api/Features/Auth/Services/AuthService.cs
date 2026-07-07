using IHCAE.Api.Shared.Constants;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;
using IHCAE.Api.Features.Auth.Models.Entities;
using IHCAE.Api.Features.Auth.Models.DTOs;
using IHCAE.Api.Features.Auth.Repositories;
using IHCAE.Api.Features.Alumni.Services;
using IHCAE.Api.Shared.Services;
using IHCAE.Api.Features.EmailVerification.Services;
using IHCAE.Api.Shared.Data;
using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace IHCAE.Api.Features.Auth.Services;

/// <summary>
/// Service implementation for authentication operations.
/// Handles user registration, login, token management, and password operations.
/// </summary>
public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IAlumniImportService _alumniImportService;
    private readonly IEmailService _emailService;
    private readonly IEmailVerificationService _emailVerificationService;
    private readonly IConfiguration _configuration;
    private readonly AppDbContext _context;
    private readonly ILogger<AuthService> _logger;

    /// <summary>
    /// Initializes a new instance of the AuthService.
    /// </summary>
    /// <param name="userRepository">Repository for user operations</param>
    /// <param name="alumniImportService">Service for alumni database operations</param>
    /// <param name="emailService">Service for email operations</param>
    /// <param name="emailVerificationService">Service for email verification operations</param>
    /// <param name="configuration">Application configuration</param>
    /// <param name="context">Database context for refresh token operations</param>
    /// <param name="logger">Logger for authentication operations</param>
    public AuthService(
        IUserRepository userRepository,
        IAlumniImportService alumniImportService,
        IEmailService emailService,
        IEmailVerificationService emailVerificationService,
        IConfiguration configuration,
        AppDbContext context,
        ILogger<AuthService> logger)
    {
        _userRepository = userRepository;
        _alumniImportService = alumniImportService;
        _emailService = emailService;
        _emailVerificationService = emailVerificationService;
        _configuration = configuration;
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Registers a new user with auto-approval logic based on alumni database matching.
    /// </summary>
    /// <param name="firstName">User's first name</param>
    /// <param name="lastName">User's last name</param>
    /// <param name="email">User's email address</param>
    /// <param name="password">User's plain text password</param>
    /// <returns>The created user entity</returns>
    public async Task<User> RegisterAsync(
        string firstName,
        string lastName,
        string email,
        string password,
        string phone,
        string course,
        string batch,
        string? location = null,
        string? bio = null)
    {
        // Check if email already exists
        if (await _userRepository.EmailExistsAsync(email))
        {
            throw new InvalidOperationException("Email address is already in use.");
        }

        // Check for alumni database match for auto-approval
        var matchingAlumni = await _alumniImportService.FindMatchingAlumniAsync(email);
        var userStatus = matchingAlumni != null ? UserStatus.Approved : UserStatus.Pending;

        // Create user entity — assign AlumniProfile as nav property so EF cascade-saves it
        var user = new User
        {
            FirstName = firstName,
            LastName = lastName,
            Email = email.ToLower(),
            PasswordHash = HashPassword(password),
            Phone = phone,
            Status = userStatus,
            EmailVerified = false,
            IsBanned = false,
            CreatedAt = DateTime.UtcNow,
            AlumniProfile = new AlumniProfile
            {

                Course = course,
                Batch = batch,
                Location = location,
                Bio = bio,
                CreatedAt = DateTime.UtcNow
            }
        };

        // Add user to database (cascade-saves AlumniProfile via nav property)
        var createdUser = await _userRepository.AddAsync(user);

        // Link alumni record to user if match found
        if (matchingAlumni != null)
        {
            await _alumniImportService.LinkAlumniToUserAsync(matchingAlumni.Id, createdUser.Id);
            await _userRepository.AssignRoleAsync(createdUser.Id, RoleConstants.Alumni);
        }

        // Send appropriate email notification
        await _emailService.SendRegistrationConfirmationAsync(email, firstName, userStatus == UserStatus.Approved);

        // Send email verification
        await _emailVerificationService.SendVerificationEmailAsync(createdUser.Id);

        return createdUser;
    }

    /// <summary>
    /// Authenticates a user with email and password.
    /// </summary>
    /// <param name="email">User's email address</param>
    /// <param name="password">User's plain text password</param>
    /// <returns>Authentication result with user and tokens if successful</returns>
    public async Task<AuthResult> LoginAsync(string email, string password)
    {
        var user = await _userRepository.GetByEmailAsync(email);
        
        if (user == null || !VerifyPassword(password, user.PasswordHash))
        {
            return new AuthResult
            {
                Success = false,
                ErrorMessage = "Invalid email or password."
            };
        }

        if (user.Status != UserStatus.Approved)
        {
            return new AuthResult
            {
                Success = false,
                ErrorMessage = "Your account is pending approval. Please wait for an administrator to approve your registration."
            };
        }

        if (!user.EmailVerified)
        {
            return new AuthResult
            {
                Success = false,
                ErrorMessage = "Please verify your email before logging in. Check your inbox for a verification link."
            };
        }

        if (user.IsBanned)
        {
            return new AuthResult
            {
                Success = false,
                ErrorMessage = "Your account has been banned. Please contact an administrator."
            };
        }

        // Update last login time
        user.LastLoginAt = DateTime.UtcNow;
        await _userRepository.UpdateAsync(user);

        // Generate tokens
        var accessToken = GenerateAccessToken(user);
        var refreshToken = await GenerateRefreshTokenAsync(user);

        return new AuthResult
        {
            Success = true,
            User = user,
            AccessToken = accessToken,
            RefreshToken = refreshToken
        };
    }

    /// <summary>
    /// Refreshes an access token using a valid refresh token.
    /// </summary>
    /// <param name="refreshToken">The refresh token to use</param>
    /// <returns>New authentication result with fresh tokens</returns>
    public async Task<AuthResult> RefreshTokenAsync(string refreshToken)
    {
        try
        {
            // Find the refresh token in database
            var tokenHash = BCrypt.Net.BCrypt.HashPassword(refreshToken);
            var userRefreshToken = await _context.UserRefreshTokens
                .Include(rt => rt.User)
                    .ThenInclude(u => u.UserRoles)
                        .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(rt => rt.TokenHash == tokenHash && rt.ExpiresAt > DateTime.UtcNow);

            if (userRefreshToken == null)
            {
                return new AuthResult
                {
                    Success = false,
                    ErrorMessage = "Invalid or expired refresh token."
                };
            }

            var user = userRefreshToken.User;
            if (user.Status != UserStatus.Approved || user.IsBanned)
            {
                return new AuthResult
                {
                    Success = false,
                    ErrorMessage = "User account is not active."
                };
            }

            // Generate new tokens
            var newAccessToken = GenerateAccessToken(user);
            var newRefreshToken = await GenerateRefreshTokenAsync(user);

            // Revoke old refresh token
            await RevokeRefreshTokenAsync(refreshToken);

            return new AuthResult
            {
                Success = true,
                User = user,
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error refreshing token");
            return new AuthResult
            {
                Success = false,
                ErrorMessage = "An error occurred while refreshing the token."
            };
        }
    }

    /// <summary>
    /// Revokes a refresh token, invalidating it.
    /// </summary>
    /// <param name="refreshToken">The refresh token to revoke</param>
    /// <returns>True if token was revoked, false if not found</returns>
    public async Task<bool> RevokeRefreshTokenAsync(string refreshToken)
    {
        try
        {
            var tokenHash = BCrypt.Net.BCrypt.HashPassword(refreshToken);
            var userRefreshToken = await _context.UserRefreshTokens
                .FirstOrDefaultAsync(rt => rt.TokenHash == tokenHash);

            if (userRefreshToken != null)
            {
                _context.UserRefreshTokens.Remove(userRefreshToken);
                await _context.SaveChangesAsync();
                return true;
            }

            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error revoking refresh token");
            return false;
        }
    }

    /// <summary>
    /// Generates a JWT access token for a user.
    /// </summary>
    /// <param name="user">The user to generate token for</param>
    /// <returns>The JWT access token</returns>
    public string GenerateAccessToken(User user)
    {
        var jwtSettings = _configuration.GetSection("Jwt");
        var key = Encoding.ASCII.GetBytes(jwtSettings["Key"]!);
        var expiryMinutes = int.Parse(jwtSettings["AccessTokenExpiryMinutes"]!);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Name, $"{user.FirstName} {user.LastName}"),
            new("firstName", user.FirstName),
            new("lastName", user.LastName)
        };

        // Add role claims
        var userWithRoles = _userRepository.GetWithRolesAsync(user.Id).Result;
        if (userWithRoles?.UserRoles != null)
        {
            foreach (var userRole in userWithRoles.UserRoles)
            {
                if (userRole.Role != null)
                {
                    claims.Add(new Claim(ClaimTypes.Role, userRole.Role.Name));
                }
            }
        }

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(expiryMinutes),
            Issuer = jwtSettings["Issuer"],
            Audience = jwtSettings["Audience"],
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    /// <summary>
    /// Generates a refresh token for a user.
    /// </summary>
    /// <param name="user">The user to generate token for</param>
    /// <returns>The refresh token</returns>
    public async Task<string> GenerateRefreshTokenAsync(User user)
    {
        var jwtSettings = _configuration.GetSection("Jwt");
        var expiryDays = int.Parse(jwtSettings["RefreshTokenExpiryDays"]!);
        
        var refreshToken = System.Guid.NewGuid().ToString();
        var tokenHash = BCrypt.Net.BCrypt.HashPassword(refreshToken);

        var userRefreshToken = new UserRefreshToken
        {
            
            UserId = user.Id,
            TokenHash = tokenHash,
            ExpiresAt = DateTime.UtcNow.AddDays(expiryDays),
            CreatedAt = DateTime.UtcNow
        };

        _context.UserRefreshTokens.Add(userRefreshToken);
        await _context.SaveChangesAsync();

        return refreshToken;
    }

    /// <summary>
    /// Verifies a password against a user's stored hash.
    /// </summary>
    /// <param name="password">Plain text password to verify</param>
    /// <param name="hash">Stored password hash</param>
    /// <returns>True if password matches, false otherwise</returns>
    public bool VerifyPassword(string password, string hash)
    {
        return BCrypt.Net.BCrypt.Verify(password, hash);
    }

    /// <summary>
    /// Hashes a plain text password using BCrypt.
    /// </summary>
    /// <param name="password">Plain text password to hash</param>
    /// <returns>The hashed password</returns>
    public string HashPassword(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password, 12); // Cost factor 12 for security
    }
}


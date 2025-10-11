using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using IHCAE.Api.Features.Auth.Services;
using IHCAE.Api.Features.Auth.Models.DTOs;
using IHCAE.Api.Shared.DTOs;

namespace IHCAE.Api.Features.Auth.Controllers;

/// <summary>
/// Controller for authentication operations including registration, login, and password management.
/// Handles all user authentication-related endpoints for the IHCAE Alumni Network.
/// </summary>
[ApiController]
[Route("api/v1/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    /// <summary>
    /// Initializes a new instance of the AuthController.
    /// </summary>
    /// <param name="authService">Service for authentication operations</param>
    /// <param name="logger">Logger for authentication operations</param>
    public AuthController(IAuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    /// <summary>
    /// Registers a new user with auto-approval logic based on alumni database matching.
    /// </summary>
    /// <param name="request">Registration request containing user details</param>
    /// <returns>Registration result</returns>
    [HttpPost("register")]
    [ProducesResponseType(typeof(RegisterResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new ErrorResponse
                {
                    StatusCode = 400,
                    Message = "Invalid input data",
                    Errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage)).ToList()
                });
            }

            var user = await _authService.RegisterAsync(
                request.FirstName,
                request.LastName,
                request.Email,
                request.Password
            );

            _logger.LogInformation("User registered successfully: {Email}", request.Email);

            return CreatedAtAction(nameof(Register), new RegisterResponse
            {
                Success = true,
                Message = user.Status == Models.Entities.UserStatus.Approved 
                    ? "Registration successful! Your account has been automatically approved."
                    : "Registration successful! Your account is pending approval.",
                UserId = user.Id,
                Status = user.Status.ToString()
            });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Registration failed for {Email}: {Error}", request.Email, ex.Message);
            return BadRequest(new ErrorResponse
            {
                StatusCode = 400,
                Message = ex.Message
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during registration for {Email}", request.Email);
            return StatusCode(500, new ErrorResponse
            {
                StatusCode = 500,
                Message = "An unexpected error occurred during registration."
            });
        }
    }

    /// <summary>
    /// Authenticates a user with email and password.
    /// </summary>
    /// <param name="request">Login request containing credentials</param>
    /// <returns>Authentication result with JWT token</returns>
    [HttpPost("login")]
    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new ErrorResponse
                {
                    StatusCode = 400,
                    Message = "Invalid input data",
                    Errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage)).ToList()
                });
            }

            var result = await _authService.LoginAsync(request.Email, request.Password);

            if (!result.Success)
            {
                _logger.LogWarning("Login failed for {Email}: {Error}", request.Email, result.ErrorMessage);
                return Unauthorized(new ErrorResponse
                {
                    StatusCode = 401,
                    Message = result.ErrorMessage ?? "Authentication failed"
                });
            }

            _logger.LogInformation("User logged in successfully: {Email}", request.Email);

            // Set refresh token as HttpOnly cookie
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddDays(7) // Match refresh token expiry
            };
            Response.Cookies.Append("refreshToken", result.RefreshToken ?? string.Empty, cookieOptions);

            return Ok(new LoginResponse
            {
                Success = true,
                Token = result.AccessToken!,
                User = new UserSummaryDto
                {
                    Id = result.User!.Id,
                    FirstName = result.User.FirstName,
                    LastName = result.User.LastName,
                    Email = result.User.Email,
                    Status = result.User.Status.ToString(),
                    EmailVerified = result.User.EmailVerified,
                    CreatedAt = result.User.CreatedAt,
                    LastLoginAt = result.User.LastLoginAt,
                    Roles = result.User.UserRoles.Select(ur => ur.Role.Name).ToList()
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during login for {Email}", request.Email);
            return StatusCode(500, new ErrorResponse
            {
                StatusCode = 500,
                Message = "An unexpected error occurred during login."
            });
        }
    }

    /// <summary>
    /// Refreshes an access token using a valid refresh token.
    /// </summary>
    /// <returns>New authentication result with fresh tokens</returns>
    [HttpPost("refresh")]
    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> RefreshToken()
    {
        try
        {
            var refreshToken = Request.Cookies["refreshToken"];
            
            if (string.IsNullOrEmpty(refreshToken))
            {
                return Unauthorized(new ErrorResponse
                {
                    StatusCode = 401,
                    Message = "Refresh token not found."
                });
            }

            var result = await _authService.RefreshTokenAsync(refreshToken);

            if (!result.Success)
            {
                return Unauthorized(new ErrorResponse
                {
                    StatusCode = 401,
                    Message = result.ErrorMessage ?? "Authentication failed"
                });
            }

            // Set new refresh token as HttpOnly cookie
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddDays(7)
            };
            Response.Cookies.Append("refreshToken", result.RefreshToken ?? string.Empty, cookieOptions);

            return Ok(new LoginResponse
            {
                Success = true,
                Token = result.AccessToken!,
                User = new UserSummaryDto
                {
                    Id = result.User!.Id,
                    FirstName = result.User.FirstName,
                    LastName = result.User.LastName,
                    Email = result.User.Email,
                    Status = result.User.Status.ToString(),
                    EmailVerified = result.User.EmailVerified,
                    CreatedAt = result.User.CreatedAt,
                    LastLoginAt = result.User.LastLoginAt,
                    Roles = result.User.UserRoles.Select(ur => ur.Role.Name).ToList()
                }
            });
        }
        catch (NotImplementedException)
        {
            return StatusCode(501, new ErrorResponse
            {
                StatusCode = 501,
                Message = "Refresh token functionality is not yet implemented."
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during token refresh");
            return StatusCode(500, new ErrorResponse
            {
                StatusCode = 500,
                Message = "An unexpected error occurred during token refresh."
            });
        }
    }

    /// <summary>
    /// Logs out a user by revoking their refresh token.
    /// </summary>
    /// <returns>Logout confirmation</returns>
    [HttpPost("logout")]
    [Authorize]
    [ProducesResponseType(typeof(LogoutResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> Logout()
    {
        try
        {
            var refreshToken = Request.Cookies["refreshToken"];
            
            if (!string.IsNullOrEmpty(refreshToken))
            {
                await _authService.RevokeRefreshTokenAsync(refreshToken);
            }

            // Clear the refresh token cookie
            Response.Cookies.Delete("refreshToken");

            return Ok(new LogoutResponse
            {
                Success = true,
                Message = "Logged out successfully."
            });
        }
        catch (NotImplementedException)
        {
            return StatusCode(501, new ErrorResponse
            {
                StatusCode = 501,
                Message = "Logout functionality is not yet implemented."
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during logout");
            return StatusCode(500, new ErrorResponse
            {
                StatusCode = 500,
                Message = "An unexpected error occurred during logout."
            });
        }
    }
}


using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using IHCAE.Application.Interfaces;
using IHCAE.Api.DTOs;
using IHCAE.Domain.Entities;

namespace IHCAE.Api.Controllers;

/// <summary>
/// Controller for administrative operations including user management and alumni data import.
/// Provides endpoints for administrators to manage user registrations and system data.
/// </summary>
[ApiController]
[Route("api/v1/admin")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IUserRepository _userRepository;
    private readonly IAlumniImportService _alumniImportService;
    private readonly IEmailService _emailService;
    private readonly ILogger<AdminController> _logger;

    /// <summary>
    /// Initializes a new instance of the AdminController.
    /// </summary>
    /// <param name="userRepository">Repository for user operations</param>
    /// <param name="alumniImportService">Service for alumni database operations</param>
    /// <param name="emailService">Service for email operations</param>
    /// <param name="logger">Logger for admin operations</param>
    public AdminController(
        IUserRepository userRepository,
        IAlumniImportService alumniImportService,
        IEmailService emailService,
        ILogger<AdminController> logger)
    {
        _userRepository = userRepository;
        _alumniImportService = alumniImportService;
        _emailService = emailService;
        _logger = logger;
    }

    /// <summary>
    /// Gets all pending user registrations for admin review.
    /// </summary>
    /// <param name="page">Page number for pagination</param>
    /// <param name="pageSize">Number of records per page</param>
    /// <returns>Paginated list of pending users</returns>
    [HttpGet("users/pending")]
    [ProducesResponseType(typeof(DTOs.PaginatedResult<UserSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPendingUsers(int page = 1, int pageSize = 20)
    {
        try
        {
            var pendingUsers = await _userRepository.GetByStatusAsync(UserStatus.Pending);
            var totalCount = pendingUsers.Count();
            
            var pagedUsers = pendingUsers
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(u => new UserSummaryDto
                {
                    Id = u.Id,
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    Email = u.Email,
                    Status = u.Status.ToString(),
                    CreatedAt = u.CreatedAt,
                    Roles = u.UserRoles.Select(ur => ur.Role.Name).ToList()
                })
                .ToList();

            var result = new DTOs.PaginatedResult<UserSummaryDto>
            {
                Items = pagedUsers,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving pending users");
            return StatusCode(500, new ErrorResponse
            {
                StatusCode = 500,
                Message = "An error occurred while retrieving pending users."
            });
        }
    }

    /// <summary>
    /// Approves a pending user registration.
    /// </summary>
    /// <param name="userId">The ID of the user to approve</param>
    /// <returns>Confirmation of approval</returns>
    [HttpPost("users/{userId}/approve")]
    [ProducesResponseType(typeof(AdminActionResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ApproveUser(Guid userId)
    {
        try
        {
            var user = await _userRepository.GetByIdAsync(userId);
            
            if (user == null)
            {
                return NotFound(new ErrorResponse
                {
                    StatusCode = 404,
                    Message = "User not found."
                });
            }

            if (user.Status != UserStatus.Pending)
            {
                return BadRequest(new ErrorResponse
                {
                    StatusCode = 400,
                    Message = $"User is not in pending status. Current status: {user.Status}"
                });
            }

            user.Status = UserStatus.Approved;
            user.UpdatedAt = DateTime.UtcNow;
            
            await _userRepository.UpdateAsync(user);

            // Send approval email
            await _emailService.SendRegistrationApprovedAsync(user.Email, user.FirstName);

            _logger.LogInformation("User {UserId} ({Email}) approved by admin", userId, user.Email);

            return Ok(new AdminActionResponse
            {
                Success = true,
                Message = $"User {user.FirstName} {user.LastName} has been approved successfully.",
                UserId = userId
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error approving user {UserId}", userId);
            return StatusCode(500, new ErrorResponse
            {
                StatusCode = 500,
                Message = "An error occurred while approving the user."
            });
        }
    }

    /// <summary>
    /// Rejects a pending user registration.
    /// </summary>
    /// <param name="userId">The ID of the user to reject</param>
    /// <returns>Confirmation of rejection</returns>
    [HttpPost("users/{userId}/reject")]
    [ProducesResponseType(typeof(AdminActionResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RejectUser(Guid userId)
    {
        try
        {
            var user = await _userRepository.GetByIdAsync(userId);
            
            if (user == null)
            {
                return NotFound(new ErrorResponse
                {
                    StatusCode = 404,
                    Message = "User not found."
                });
            }

            if (user.Status != UserStatus.Pending)
            {
                return BadRequest(new ErrorResponse
                {
                    StatusCode = 400,
                    Message = $"User is not in pending status. Current status: {user.Status}"
                });
            }

            user.Status = UserStatus.Rejected;
            user.UpdatedAt = DateTime.UtcNow;
            
            await _userRepository.UpdateAsync(user);

            // Send rejection email
            await _emailService.SendRegistrationRejectedAsync(user.Email, user.FirstName);

            _logger.LogInformation("User {UserId} ({Email}) rejected by admin", userId, user.Email);

            return Ok(new AdminActionResponse
            {
                Success = true,
                Message = $"User {user.FirstName} {user.LastName} has been rejected.",
                UserId = userId
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error rejecting user {UserId}", userId);
            return StatusCode(500, new ErrorResponse
            {
                StatusCode = 500,
                Message = "An error occurred while rejecting the user."
            });
        }
    }

    /// <summary>
    /// Gets all users with optional filtering and pagination.
    /// </summary>
    /// <param name="searchTerm">Optional search term for name or email</param>
    /// <param name="status">Optional status filter</param>
    /// <param name="page">Page number for pagination</param>
    /// <param name="pageSize">Number of records per page</param>
    /// <returns>Paginated list of users</returns>
    [HttpGet("users")]
    [ProducesResponseType(typeof(DTOs.PaginatedResult<UserSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllUsers(
        string? searchTerm = null,
        string? status = null,
        int page = 1,
        int pageSize = 20)
    {
        try
        {
            IEnumerable<User> users;

            if (!string.IsNullOrEmpty(searchTerm))
            {
                users = await _userRepository.SearchAsync(searchTerm);
            }
            else if (!string.IsNullOrEmpty(status) && Enum.TryParse<UserStatus>(status, true, out var userStatus))
            {
                users = await _userRepository.GetByStatusAsync(userStatus);
            }
            else
            {
                // Get all users (this would need to be implemented in the repository)
                users = new List<User>(); // Placeholder - would need GetAllAsync method
            }

            var totalCount = users.Count();
            
            var pagedUsers = users
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(u => new UserSummaryDto
                {
                    Id = u.Id,
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    Email = u.Email,
                    Status = u.Status.ToString(),
                    CreatedAt = u.CreatedAt,
                    LastLoginAt = u.LastLoginAt,
                    Roles = u.UserRoles.Select(ur => ur.Role.Name).ToList()
                })
                .ToList();

            var result = new DTOs.PaginatedResult<UserSummaryDto>
            {
                Items = pagedUsers,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving users");
            return StatusCode(500, new ErrorResponse
            {
                StatusCode = 500,
                Message = "An error occurred while retrieving users."
            });
        }
    }

    /// <summary>
    /// Imports alumni data from CSV content.
    /// </summary>
    /// <param name="request">CSV import request containing the data</param>
    /// <returns>Import result with statistics</returns>
    [HttpPost("alumni/import")]
    [ProducesResponseType(typeof(AlumniImportResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ImportAlumniData([FromBody] AlumniImportRequest request)
    {
        try
        {
            if (string.IsNullOrEmpty(request.CsvContent))
            {
                return BadRequest(new ErrorResponse
                {
                    StatusCode = 400,
                    Message = "CSV content is required."
                });
            }

            var result = await _alumniImportService.ImportAlumniDataAsync(request.CsvContent);

            _logger.LogInformation("Alumni data import completed: {ImportedCount} imported, {SkippedCount} skipped", 
                result.ImportedRecords, result.SkippedRecords);

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error importing alumni data");
            return StatusCode(500, new ErrorResponse
            {
                StatusCode = 500,
                Message = "An error occurred while importing alumni data."
            });
        }
    }

    /// <summary>
    /// Gets alumni database records with optional filtering and pagination.
    /// </summary>
    /// <param name="searchTerm">Optional search term for name or email</param>
    /// <param name="matchedOnly">Whether to return only matched records</param>
    /// <param name="page">Page number for pagination</param>
    /// <param name="pageSize">Number of records per page</param>
    /// <returns>Paginated list of alumni records</returns>
    [HttpGet("alumni")]
    [ProducesResponseType(typeof(DTOs.PaginatedResult<AlumniDatabaseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAlumniRecords(
        string? searchTerm = null,
        bool? matchedOnly = null,
        int page = 1,
        int pageSize = 20)
    {
        try
        {
            var result = await _alumniImportService.GetAlumniRecordsAsync(searchTerm, matchedOnly, page, pageSize);

            var alumniDtos = result.Items.Select(a => new AlumniDatabaseDto
            {
                Id = a.Id,
                FirstName = a.FirstName,
                LastName = a.LastName,
                Email = a.Email,
                Course = a.Course,
                GraduationYear = a.GraduationYear,
                Phone = a.Phone,
                Location = a.Location,
                MatchedUserId = a.MatchedUserId,
                ImportedAt = a.ImportedAt
            }).ToList();

            var response = new DTOs.PaginatedResult<AlumniDatabaseDto>
            {
                Items = alumniDtos,
                TotalCount = result.TotalCount,
                Page = result.Page,
                PageSize = result.PageSize
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving alumni records");
            return StatusCode(500, new ErrorResponse
            {
                StatusCode = 500,
                Message = "An error occurred while retrieving alumni records."
            });
        }
    }
}

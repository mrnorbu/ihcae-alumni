using IHCAE.Api.Features.Directory.Models.DTOs;
using IHCAE.Api.Features.Auth.Repositories;
using IHCAE.Api.Features.Auth.Models.Entities;
using IHCAE.Api.Shared.DTOs;
using IHCAE.Api.Shared.Constants;
using IHCAE.Api.Shared.Services;

namespace IHCAE.Api.Features.Directory.Services;

/// <summary>
/// Service for managing alumni directory operations.
/// Handles business logic for browsing, searching, and viewing alumni profiles.
/// Provides data transformation between entities and DTOs for API responses.
/// Implements security by only returning approved alumni members.
/// </summary>
public class DirectoryService : IDirectoryService
{
    private readonly IUserRepository _userRepository;
    private readonly ILogger<DirectoryService> _logger;
    private readonly IUrlHelperService _urlHelperService;

    /// <summary>
    /// Initializes the DirectoryService with required dependencies.
    /// </summary>
    /// <param name="userRepository">Repository for User entity operations</param>
    /// <param name="logger">Logger for tracking directory operations</param>
    /// <param name="urlHelperService">Service for converting relative URLs to absolute URLs</param>
    public DirectoryService(
        IUserRepository userRepository,
        ILogger<DirectoryService> logger,
        IUrlHelperService urlHelperService)
    {
        _userRepository = userRepository;
        _logger = logger;
        _urlHelperService = urlHelperService;
    }

    /// <summary>
    /// Gets a paginated, filtered list of approved alumni for the directory.
    /// Delegates to UserRepository for data access and applies business logic.
    /// Transforms User entities to AlumniCardDto objects for API responses.
    /// </summary>
    /// <param name="searchTerm">Optional search term for name or email filtering</param>
    /// <param name="course">Optional course filter (e.g., "Advanced Mountaineering")</param>
    /// <param name="graduationYear">Optional graduation year filter (e.g., 2020)</param>
    /// <param name="page">Page number (1-based indexing)</param>
    /// <param name="pageSize">Number of records per page (default: 20, max: 100)</param>
    /// <returns>Paginated result containing AlumniCardDto objects and metadata</returns>
    /// <exception cref="ArgumentException">Thrown when page or pageSize parameters are invalid</exception>
    public async Task<PaginatedResult<AlumniCardDto>> GetAlumniDirectoryAsync(
        string? searchTerm = null,
        string? course = null,
        string? batch = null,
        int page = 1,
        int pageSize = 20)
    {
        // Validate pagination parameters
        if (page < 1)
        {
            throw new ArgumentException("Page number must be greater than 0", nameof(page));
        }
        
        if (pageSize < 1 || pageSize > 100)
        {
            throw new ArgumentException("Page size must be between 1 and 100", nameof(pageSize));
        }

        // Retrieve filtered alumni data from repository
        var (users, totalCount) = await _userRepository.GetApprovedAlumniAsync(
            searchTerm, course, batch, page, pageSize);

        // Transform User entities to AlumniCardDto objects
        var alumniCards = users.Select(MapToAlumniCardDto).ToList();

        _logger.LogInformation("Retrieved {Count} alumni for directory page {Page}", alumniCards.Count, page);

        // Return paginated result with metadata
        return new PaginatedResult<AlumniCardDto>
        {
            Items = alumniCards,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    /// <summary>
    /// Gets detailed information for a specific alumnus.
    /// Validates that the user exists and is an approved alumni member.
    /// Returns comprehensive profile data including contact information.
    /// </summary>
    /// <param name="userId">The unique identifier of the alumnus</param>
    /// <returns>Detailed alumni information including contact details</returns>
    /// <exception cref="KeyNotFoundException">Thrown when alumnus is not found</exception>
    /// <exception cref="UnauthorizedAccessException">Thrown when user is not approved</exception>
    public async Task<AlumniDetailDto> GetAlumniDetailAsync(Guid userId)
    {
        // Retrieve user with profile data
        var user = await _userRepository.GetWithProfileAsync(userId);

        if (user == null)
        {
            throw new KeyNotFoundException($"Alumni with ID {userId} not found");
        }

        // Ensure user is an approved alumni member with "Alumni" role
        if (user.Status != UserStatus.Approved)
        {
            throw new UnauthorizedAccessException("User is not an approved alumni member");
        }

        // Check if user has "Alumni" role (exclude administrators and other roles)
        if (!user.UserRoles.Any(ur => ur.Role.Name == RoleConstants.Alumni))
        {
            throw new UnauthorizedAccessException("User is not an alumni member");
        }

        _logger.LogInformation("Retrieved detailed profile for alumni {UserId}", userId);

        // Transform User entity to AlumniDetailDto
        return MapToAlumniDetailDto(user);
    }

    /// <summary>
    /// Maps a User entity to an AlumniCardDto for directory card display.
    /// Extracts essential information needed for directory grid view.
    /// Handles null AlumniProfile gracefully by providing default values.
    /// </summary>
    /// <param name="user">The User entity to map</param>
    /// <returns>AlumniCardDto containing card display information</returns>
    private AlumniCardDto MapToAlumniCardDto(User user)
    {
        return new AlumniCardDto
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            ProfileImageUrl = _urlHelperService.GetAbsoluteUrl(user.AlumniProfile?.ProfileImageUrl),
            Batch = user.AlumniProfile?.Batch,
            Course = user.AlumniProfile?.Course,
            JobTitle = user.AlumniProfile?.JobTitle,
            Location = user.AlumniProfile?.Location
        };
    }

    /// <summary>
    /// Maps a User entity to an AlumniDetailDto for detailed profile view.
    /// Includes all available information including contact details.
    /// Handles null AlumniProfile gracefully by providing default values.
    /// </summary>
    /// <param name="user">The User entity to map</param>
    /// <returns>AlumniDetailDto containing complete profile information</returns>
    private AlumniDetailDto MapToAlumniDetailDto(User user)
    {
        return new AlumniDetailDto
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email,
            Phone = user.Phone,
            ProfileImageUrl = _urlHelperService.GetAbsoluteUrl(user.AlumniProfile?.ProfileImageUrl),
            Batch = user.AlumniProfile?.Batch,
            Course = user.AlumniProfile?.Course,
            Bio = user.AlumniProfile?.Bio,
            JobTitle = user.AlumniProfile?.JobTitle,
            Location = user.AlumniProfile?.Location,
            CreatedAt = user.CreatedAt
        };
    }
}


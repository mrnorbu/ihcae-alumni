using Microsoft.EntityFrameworkCore;
using IHCAE.Api.Features.Profile.Models.DTOs;
using IHCAE.Api.Features.Auth.Repositories;
using IHCAE.Api.Features.Auth.Models.Entities;
using IHCAE.Api.Shared.Data;
using IHCAE.Api.Shared.Services;

namespace IHCAE.Api.Features.Profile.Services;

/// <summary>
/// Service for managing user profile operations.
/// Handles CRUD operations for user profiles, combining User and AlumniProfile entities.
/// Provides business logic for profile management features.
/// </summary>
public class ProfileService : IProfileService
{
    private readonly IUserRepository _userRepository;
    private readonly AppDbContext _context;
    private readonly ILogger<ProfileService> _logger;
    private readonly IUrlHelperService _urlHelperService;

    /// <summary>
    /// Initializes the ProfileService with required dependencies.
    /// </summary>
    /// <param name="userRepository">Repository for User entity operations</param>
    /// <param name="context">Database context for AlumniProfile operations</param>
    /// <param name="logger">Logger for tracking profile operations</param>
    /// <param name="urlHelperService">Service for converting relative URLs to absolute URLs</param>
    public ProfileService(
        IUserRepository userRepository,
        AppDbContext context,
        ILogger<ProfileService> logger,
        IUrlHelperService urlHelperService)
    {
        _userRepository = userRepository;
        _context = context;
        _logger = logger;
        _urlHelperService = urlHelperService;
    }

    /// <summary>
    /// Gets the complete profile for the specified user.
    /// Loads both User and AlumniProfile data and combines them into a DTO.
    /// </summary>
    /// <param name="userId">The user ID to retrieve profile for</param>
    /// <returns>The user's complete profile data</returns>
    /// <exception cref="KeyNotFoundException">Thrown when user is not found</exception>
    public async Task<ProfileDto> GetProfileAsync(Guid userId)
    {
        // Retrieve user with all related data
        var user = await _userRepository.GetByIdAsync(userId);
        
        if (user == null)
        {
            throw new KeyNotFoundException($"User with ID {userId} not found");
        }

        // Ensure AlumniProfile is loaded (it might be null for new users)
        if (user.AlumniProfile == null)
        {
            await _context.Entry(user)
                .Reference(u => u.AlumniProfile)
                .LoadAsync();
        }

        // Map User entity to ProfileDto
        return MapToProfileDto(user);
    }

    /// <summary>
    /// Updates the profile information for the specified user.
    /// Handles both User entity fields (like Phone) and AlumniProfile fields.
    /// Creates AlumniProfile if it doesn't exist for the user.
    /// </summary>
    /// <param name="userId">The user ID to update profile for</param>
    /// <param name="request">The profile update request containing new values</param>
    /// <returns>The updated profile data</returns>
    /// <exception cref="KeyNotFoundException">Thrown when user is not found</exception>
    public async Task<ProfileDto> UpdateProfileAsync(Guid userId, UpdateProfileRequest request)
    {
        // Retrieve user with all related data
        var user = await _userRepository.GetByIdAsync(userId);
        
        if (user == null)
        {
            throw new KeyNotFoundException($"User with ID {userId} not found");
        }

        // Ensure AlumniProfile is loaded
        if (user.AlumniProfile == null)
        {
            await _context.Entry(user)
                .Reference(u => u.AlumniProfile)
                .LoadAsync();
        }

        // Update User entity fields
        if (request.Phone != null)
        {
            user.Phone = request.Phone;
        }
        user.UpdatedAt = DateTime.UtcNow;

        // Update or create AlumniProfile
        if (user.AlumniProfile == null)
        {
            // Create new AlumniProfile for user
            user.AlumniProfile = new AlumniProfile
            {
                UserId = userId,
                CreatedAt = DateTime.UtcNow
            };
            _context.Set<AlumniProfile>().Add(user.AlumniProfile);
        }

        // Update AlumniProfile fields with new values
        if (request.Bio != null)
        {
            user.AlumniProfile.Bio = request.Bio;
        }
        if (request.JobTitle != null)
        {
            user.AlumniProfile.JobTitle = request.JobTitle;
        }
        if (request.Location != null)
        {
            user.AlumniProfile.Location = request.Location;
        }
        if (request.Course != null)
        {
            user.AlumniProfile.Course = request.Course;
        }
        if (request.GraduationYear.HasValue)
        {
            user.AlumniProfile.GraduationYear = request.GraduationYear;
        }
        
        // Update timestamp
        user.AlumniProfile.UpdatedAt = DateTime.UtcNow;

        // Save changes to database
        await _context.SaveChangesAsync();

        _logger.LogInformation("Updated profile for user {UserId}", userId);

        // Return updated profile data
        return MapToProfileDto(user);
    }

    /// <summary>
    /// Updates the profile image URL for the specified user.
    /// Used after successful image upload to link the image to the user's profile.
    /// Creates AlumniProfile if it doesn't exist.
    /// </summary>
    /// <param name="userId">The user ID to update image for</param>
    /// <param name="imageUrl">The URL to the uploaded image</param>
    /// <returns>The updated profile data with new image URL</returns>
    /// <exception cref="KeyNotFoundException">Thrown when user is not found</exception>
    public async Task<ProfileDto> UpdateProfileImageAsync(Guid userId, string imageUrl)
    {
        // Retrieve user with all related data
        var user = await _userRepository.GetByIdAsync(userId);
        
        if (user == null)
        {
            throw new KeyNotFoundException($"User with ID {userId} not found");
        }

        // Ensure AlumniProfile is loaded
        if (user.AlumniProfile == null)
        {
            await _context.Entry(user)
                .Reference(u => u.AlumniProfile)
                .LoadAsync();
        }

        // Create AlumniProfile if it doesn't exist
        if (user.AlumniProfile == null)
        {
            user.AlumniProfile = new AlumniProfile
            {
                UserId = userId,
                CreatedAt = DateTime.UtcNow
            };
            _context.Set<AlumniProfile>().Add(user.AlumniProfile);
        }

        // Update profile image URL
        user.AlumniProfile.ProfileImageUrl = imageUrl;
        user.AlumniProfile.UpdatedAt = DateTime.UtcNow;
        user.UpdatedAt = DateTime.UtcNow;

        // Save changes to database
        await _context.SaveChangesAsync();

        _logger.LogInformation("Updated profile image for user {UserId}", userId);

        // Return updated profile data
        return MapToProfileDto(user);
    }

    /// <summary>
    /// Maps a User entity to a ProfileDto.
    /// Combines User and AlumniProfile data into a single DTO for API responses.
    /// Handles null AlumniProfile gracefully by providing default values.
    /// </summary>
    /// <param name="user">The User entity to map</param>
    /// <returns>ProfileDto containing all profile information</returns>
    private ProfileDto MapToProfileDto(User user)
    {
        // Convert relative image URL to absolute URL
        var profileImageUrl = _urlHelperService.GetAbsoluteUrl(user.AlumniProfile?.ProfileImageUrl);
        
        return new ProfileDto
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email,
            Phone = user.Phone,
            ProfileImageUrl = profileImageUrl,
            GraduationYear = user.AlumniProfile?.GraduationYear,
            Course = user.AlumniProfile?.Course,
            Bio = user.AlumniProfile?.Bio,
            JobTitle = user.AlumniProfile?.JobTitle,
            Location = user.AlumniProfile?.Location,
            Status = user.Status.ToString(),
            EmailVerified = user.EmailVerified,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.AlumniProfile?.UpdatedAt ?? user.UpdatedAt
        };
    }
}


using Microsoft.EntityFrameworkCore;
using IHCAE.Api.Features.Auth.Models.Entities;
using IHCAE.Api.Shared.Data;
using IHCAE.Api.Shared.Models;
using IHCAE.Api.Shared.Constants;

namespace IHCAE.Api.Features.Auth.Repositories;

/// <summary>
/// Repository implementation for User entity operations.
/// Provides data access methods for user management functionality using Entity Framework Core.
/// </summary>
public class UserRepository : IUserRepository
{
    private readonly AppDbContext _context;

    /// <summary>
    /// Initializes a new instance of the UserRepository.
    /// </summary>
    /// <param name="context">The database context</param>
    public UserRepository(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Gets a user by their unique identifier.
    /// </summary>
    /// <param name="id">The user's unique identifier</param>
    /// <returns>The user if found, null otherwise</returns>
    public async Task<User?> GetByIdAsync(int id)
    {
        return await _context.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .Include(u => u.AlumniProfile)
            .FirstOrDefaultAsync(u => u.Id == id);
    }

    /// <summary>
    /// Gets a user by their email address.
    /// </summary>
    /// <param name="email">The user's email address</param>
    /// <returns>The user if found, null otherwise</returns>
    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _context.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .Include(u => u.AlumniProfile)
            .FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());
    }

    /// <summary>
    /// Gets all users with a specific status.
    /// </summary>
    /// <param name="status">The user status to filter by</param>
    /// <returns>Collection of users with the specified status</returns>
    public async Task<IEnumerable<User>> GetByStatusAsync(UserStatus status)
    {
        return await _context.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .Include(u => u.AlumniProfile)
            .Where(u => u.Status == status)
            .OrderBy(u => u.CreatedAt)
            .ToListAsync();
    }

    /// <summary>
    /// Searches users by name or email.
    /// </summary>
    /// <param name="searchTerm">The search term to match against name or email</param>
    /// <returns>Collection of matching users</returns>
    public async Task<IEnumerable<User>> SearchAsync(string searchTerm)
    {
        var lowerSearchTerm = searchTerm.ToLower();
        
        return await _context.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .Include(u => u.AlumniProfile)
            .Where(u => 
                u.FirstName.ToLower().Contains(lowerSearchTerm) ||
                u.LastName.ToLower().Contains(lowerSearchTerm) ||
                u.Email.ToLower().Contains(lowerSearchTerm) ||
                (u.FirstName + " " + u.LastName).ToLower().Contains(lowerSearchTerm))
            .OrderBy(u => u.FirstName)
            .ThenBy(u => u.LastName)
            .ToListAsync();
    }

    /// <summary>
    /// Adds a new user to the database.
    /// </summary>
    /// <param name="user">The user entity to add</param>
    /// <returns>The added user entity</returns>
    public async Task<User> AddAsync(User user)
    {
        user.CreatedAt = DateTime.UtcNow;
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return user;
    }

    /// <summary>
    /// Updates an existing user in the database.
    /// </summary>
    /// <param name="user">The user entity to update</param>
    /// <returns>The updated user entity</returns>
    public async Task<User> UpdateAsync(User user)
    {
        user.UpdatedAt = DateTime.UtcNow;
        _context.Users.Update(user);
        await _context.SaveChangesAsync();
        return user;
    }

    /// <summary>
    /// Checks if an email address is already in use.
    /// </summary>
    /// <param name="email">The email address to check</param>
    /// <returns>True if email is in use, false otherwise</returns>
    public async Task<bool> EmailExistsAsync(string email)
    {
        return await _context.Users
            .AnyAsync(u => u.Email.ToLower() == email.ToLower());
    }

    /// <summary>
    /// Gets all users with their roles and profiles included.
    /// </summary>
    /// <returns>Collection of all users</returns>
    public async Task<IEnumerable<User>> GetAllAsync()
    {
        return await _context.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .Include(u => u.AlumniProfile)
            .OrderBy(u => u.CreatedAt)
            .ToListAsync();
    }

    /// <summary>
    /// Gets a user with their roles included.
    /// </summary>
    /// <param name="id">The user's unique identifier</param>
    /// <returns>The user with roles if found, null otherwise</returns>
    public async Task<User?> GetWithRolesAsync(int id)
    {
        return await _context.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Id == id);
    }

    /// <summary>
    /// Gets approved alumni with optional filtering and pagination.
    /// Only returns users with "Alumni" role, excluding administrators and other roles.
    /// </summary>
    public async Task<(IEnumerable<User> Users, int TotalCount)> GetApprovedAlumniAsync(
        string? searchTerm = null,
        string? course = null,
        string? batch = null,
        int page = 1,
        int pageSize = 20)
    {
        var query = _context.Users
            .Include(u => u.AlumniProfile)
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .Where(u => u.Status == UserStatus.Approved &&
                       u.UserRoles.Any(ur => ur.Role.Name == RoleConstants.Alumni));

        // Apply search filter
        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var lowerSearchTerm = searchTerm.ToLower();
            query = query.Where(u =>
                u.FirstName.ToLower().Contains(lowerSearchTerm) ||
                u.LastName.ToLower().Contains(lowerSearchTerm) ||
                u.Email.ToLower().Contains(lowerSearchTerm) ||
                (u.FirstName + " " + u.LastName).ToLower().Contains(lowerSearchTerm));
        }

        // Apply course filter
        if (!string.IsNullOrWhiteSpace(course))
        {
            query = query.Where(u => u.AlumniProfile != null && 
                                   u.AlumniProfile.Course != null &&
                                   u.AlumniProfile.Course.ToLower().Contains(course.ToLower()));
        }

        // Apply graduation year filter
        if (batch != null)
        {
            query = query.Where(u => u.AlumniProfile != null && 
                                   u.AlumniProfile.Batch == batch);
        }

        // Get total count before pagination
        var totalCount = await query.CountAsync();

        // Apply pagination
        var users = await query
            .OrderBy(u => u.FirstName)
            .ThenBy(u => u.LastName)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (users, totalCount);
    }

    /// <summary>
    /// Gets a user by ID with AlumniProfile included.
    /// </summary>
    public async Task<User?> GetWithProfileAsync(int id)
    {
        return await _context.Users
            .Include(u => u.AlumniProfile)
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Id == id);
    }

    /// <summary>
    /// Assigns a role to a user.
    /// </summary>
    /// <param name="userId">The user's unique identifier</param>
    /// <param name="roleName">The name of the role to assign</param>
    /// <returns>True if role was assigned successfully, false if user or role not found</returns>
    public async Task<bool> AssignRoleAsync(int userId, string roleName)
    {
        // Get the user
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null) return false;

        // Get the role
        var role = await _context.Roles.FirstOrDefaultAsync(r => r.Name == roleName);
        if (role == null) return false;

        // Check if user already has this role
        var existingUserRole = await _context.UserRoles
            .FirstOrDefaultAsync(ur => ur.UserId == userId && ur.RoleId == role.Id);
        
        if (existingUserRole != null) return true; // Role already assigned

        // Create new user role assignment
        var userRole = new UserRole
        {
            UserId = userId,
            RoleId = role.Id,
            AssignedAt = DateTime.UtcNow,
            AssignedBy = userId // Self-assigned during registration
        };

        _context.UserRoles.Add(userRole);
        await _context.SaveChangesAsync();
        return true;
    }

    /// <summary>
    /// Removes a role from a user.
    /// </summary>
    /// <param name="userId">The user's unique identifier</param>
    /// <param name="roleName">The name of the role to remove</param>
    /// <returns>True if role was removed successfully, false if user or role not found</returns>
    public async Task<bool> RemoveRoleAsync(int userId, string roleName)
    {
        var role = await _context.Roles.FirstOrDefaultAsync(r => r.Name == roleName);
        if (role == null) return false;

        var userRole = await _context.UserRoles
            .FirstOrDefaultAsync(ur => ur.UserId == userId && ur.RoleId == role.Id);

        if (userRole == null) return true; // Role not assigned, nothing to remove

        _context.UserRoles.Remove(userRole);
        await _context.SaveChangesAsync();
        return true;
    }
}


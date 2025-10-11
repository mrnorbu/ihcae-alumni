using Microsoft.EntityFrameworkCore;
using IHCAE.Api.Features.Auth.Models.Entities;
using IHCAE.Api.Shared.Data;

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
    public async Task<User?> GetByIdAsync(Guid id)
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
    public async Task<User?> GetWithRolesAsync(Guid id)
    {
        return await _context.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Id == id);
    }
}


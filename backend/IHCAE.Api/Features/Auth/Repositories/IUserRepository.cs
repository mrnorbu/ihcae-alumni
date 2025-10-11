using IHCAE.Api.Features.Auth.Models.Entities;

namespace IHCAE.Api.Features.Auth.Repositories;

/// <summary>
/// Repository interface for User entity operations.
/// Provides data access methods for user management functionality.
/// </summary>
public interface IUserRepository
{
    /// <summary>
    /// Gets a user by their unique identifier.
    /// </summary>
    /// <param name="id">The user's unique identifier</param>
    /// <returns>The user if found, null otherwise</returns>
    Task<User?> GetByIdAsync(Guid id);

    /// <summary>
    /// Gets a user by their email address.
    /// </summary>
    /// <param name="email">The user's email address</param>
    /// <returns>The user if found, null otherwise</returns>
    Task<User?> GetByEmailAsync(string email);

    /// <summary>
    /// Gets all users with their roles and profiles included.
    /// </summary>
    /// <returns>Collection of all users</returns>
    Task<IEnumerable<User>> GetAllAsync();

    /// <summary>
    /// Gets all users with a specific status.
    /// </summary>
    /// <param name="status">The user status to filter by</param>
    /// <returns>Collection of users with the specified status</returns>
    Task<IEnumerable<User>> GetByStatusAsync(UserStatus status);

    /// <summary>
    /// Searches users by name or email.
    /// </summary>
    /// <param name="searchTerm">The search term to match against name or email</param>
    /// <returns>Collection of matching users</returns>
    Task<IEnumerable<User>> SearchAsync(string searchTerm);

    /// <summary>
    /// Adds a new user to the database.
    /// </summary>
    /// <param name="user">The user entity to add</param>
    /// <returns>The added user entity</returns>
    Task<User> AddAsync(User user);

    /// <summary>
    /// Updates an existing user in the database.
    /// </summary>
    /// <param name="user">The user entity to update</param>
    /// <returns>The updated user entity</returns>
    Task<User> UpdateAsync(User user);

    /// <summary>
    /// Checks if an email address is already in use.
    /// </summary>
    /// <param name="email">The email address to check</param>
    /// <returns>True if email is in use, false otherwise</returns>
    Task<bool> EmailExistsAsync(string email);

    /// <summary>
    /// Gets a user with their roles included.
    /// </summary>
    /// <param name="id">The user's unique identifier</param>
    /// <returns>The user with roles if found, null otherwise</returns>
    Task<User?> GetWithRolesAsync(Guid id);
}


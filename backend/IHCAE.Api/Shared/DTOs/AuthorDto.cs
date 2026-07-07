namespace IHCAE.Api.Shared.DTOs;

/// <summary>
/// Data Transfer Object for author information.
/// Used in forum posts and topics to represent the author.
/// </summary>
public class AuthorDto
{
    /// <summary>
    /// Unique identifier for the author.
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// First name of the author.
    /// </summary>
    public string FirstName { get; set; } = string.Empty;

    /// <summary>
    /// Last name of the author.
    /// </summary>
    public string LastName { get; set; } = string.Empty;

    /// <summary>
    /// Optional profile image URL for the author.
    /// </summary>
    public string? ProfileImageUrl { get; set; }
}

namespace IHCAE.Api.Shared.Constants;

/// <summary>
/// Constants for role names used throughout the application.
/// These should match the role names in the database.
/// </summary>
public static class RoleConstants
{
    /// <summary>
    /// Administrator role - full system access
    /// </summary>
    public const string Admin = "Admin";

    /// <summary>
    /// Alumni role - graduated IHCAE students with full member access
    /// </summary>
    public const string Alumni = "Alumni";

    /// <summary>
    /// Applicant role - job applicants with limited access
    /// </summary>
    public const string Applicant = "Applicant";
}

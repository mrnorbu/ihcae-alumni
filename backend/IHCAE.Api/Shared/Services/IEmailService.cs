namespace IHCAE.Api.Shared.Services;

/// <summary>
/// Service interface for email operations.
/// Handles sending various types of emails to users.
/// </summary>
public interface IEmailService
{
    /// <summary>
    /// Sends an email to a recipient.
    /// </summary>
    /// <param name="to">Recipient's email address</param>
    /// <param name="subject">Email subject line</param>
    /// <param name="htmlBody">Email body in HTML format</param>
    /// <returns>Task representing the async operation</returns>
    Task SendEmailAsync(string to, string subject, string htmlBody);

    /// <summary>
    /// Sends a registration confirmation email to a new user.
    /// </summary>
    /// <param name="to">Recipient's email address</param>
    /// <param name="firstName">User's first name</param>
    /// <param name="isApproved">Whether the user was auto-approved</param>
    /// <returns>Task representing the async operation</returns>
    Task SendRegistrationConfirmationAsync(string to, string firstName, bool isApproved);

    /// <summary>
    /// Sends an email verification token to a user.
    /// </summary>
    /// <param name="to">Recipient's email address</param>
    /// <param name="firstName">User's first name</param>
    /// <param name="verificationLink">The verification link with token</param>
    /// <returns>Task representing the async operation</returns>
    Task SendEmailVerificationAsync(string to, string firstName, string verificationLink);

    /// <summary>
    /// Sends a password reset email to a user.
    /// </summary>
    /// <param name="to">Recipient's email address</param>
    /// <param name="firstName">User's first name</param>
    /// <param name="resetLink">The password reset link with token</param>
    /// <returns>Task representing the async operation</returns>
    Task SendPasswordResetAsync(string to, string firstName, string resetLink);

    /// <summary>
    /// Sends a registration approval notification to a user.
    /// </summary>
    /// <param name="to">Recipient's email address</param>
    /// <param name="firstName">User's first name</param>
    /// <returns>Task representing the async operation</returns>
    Task SendRegistrationApprovedAsync(string to, string firstName);

    /// <summary>
    /// Sends a registration rejection notification to a user.
    /// </summary>
    /// <param name="to">Recipient's email address</param>
    /// <param name="firstName">User's first name</param>
    /// <param name="reason">Optional reason for rejection</param>
    /// <returns>Task representing the async operation</returns>
    Task SendRegistrationRejectedAsync(string to, string firstName, string? reason = null);

    /// <summary>
    /// Sends a password reset success confirmation email to a user.
    /// </summary>
    /// <param name="to">Recipient's email address</param>
    /// <param name="firstName">User's first name</param>
    /// <returns>Task representing the async operation</returns>
    Task SendPasswordResetConfirmationAsync(string to, string firstName);

    /// <summary>
    /// Sends a claim account link to a bulk-imported legacy user.
    /// </summary>
    /// <param name="to">Recipient's email address</param>
    /// <param name="firstName">User's first name</param>
    /// <param name="setupUrl">The security setup URL containing the token</param>
    /// <returns>Task representing the async operation</returns>
    Task SendClaimAccountEmailAsync(string to, string firstName, string setupUrl);

    /// <summary>
    /// Sends a notification when a user receives a new reply to their topic or post.
    /// </summary>
    /// <param name="to">Recipient's email address</param>
    /// <param name="firstName">Recipient's first name</param>
    /// <param name="topicTitle">The title of the discussion topic</param>
    /// <param name="replyAuthorName">The name of the user who replied</param>
    /// <param name="postLink">A link to view the post</param>
    /// <returns>Task representing the async operation</returns>
    Task SendNewReplyNotificationAsync(string to, string firstName, string topicTitle, string replyAuthorName, string postLink);

    /// <summary>
    /// Sends a notification when a topic or post is moderated (deleted or locked) by an admin.
    /// </summary>
    /// <param name="to">Recipient's email address</param>
    /// <param name="firstName">Recipient's first name</param>
    /// <param name="topicTitle">The title of the discussion topic</param>
    /// <param name="action">The moderation action (e.g., 'deleted', 'locked')</param>
    /// <param name="reason">The reason provided by the admin</param>
    /// <returns>Task representing the async operation</returns>
    Task SendTopicModerationNotificationAsync(string to, string firstName, string topicTitle, string action, string reason);

    /// <summary>
    /// Sends an admin notification that a new event has been submitted.
    /// </summary>
    Task SendEventSubmittedNotificationAsync(string to, string eventTitle, Guid eventId);

    /// <summary>
    /// Sends a notification to a user regarding the approval or rejection of their event.
    /// </summary>
    Task SendEventStatusNotificationAsync(string to, string firstName, string eventTitle, string status, string? reason = null);

    /// <summary>
    /// Sends an event registration confirmation.
    /// </summary>
    Task SendEventRegistrationConfirmationAsync(string to, string name, string eventTitle);

    /// <summary>
    /// Sends an admin notification that a new article has been submitted.
    /// </summary>
    Task SendNewsSubmittedNotificationAsync(string to, string articleTitle, Guid articleId);

    /// <summary>
    /// Sends a notification to a user regarding the approval or rejection of their article.
    /// </summary>
    Task SendNewsStatusNotificationAsync(string to, string firstName, string articleTitle, string status, string? reason = null);
}

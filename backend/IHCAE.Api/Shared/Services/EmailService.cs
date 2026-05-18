using System.Net;
using System.Net.Mail;
using IHCAE.Api.Shared.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace IHCAE.Api.Shared.Services;

/// <summary>
/// Service implementation for email operations.
/// Handles sending various types of emails to users using SMTP.
/// </summary>
public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;

    /// <summary>
    /// Initializes a new instance of the EmailService.
    /// </summary>
    /// <param name="configuration">Application configuration</param>
    /// <param name="logger">Logger for email operations</param>
    public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    /// <summary>
    /// Sends an email to a recipient.
    /// </summary>
    /// <param name="to">Recipient's email address</param>
    /// <param name="subject">Email subject line</param>
    /// <param name="htmlBody">Email body in HTML format</param>
    /// <returns>Task representing the async operation</returns>
    public async Task SendEmailAsync(string to, string subject, string htmlBody)
    {
        try
        {
            var smtpSettings = _configuration.GetSection("Smtp");
            
            using var smtpClient = new SmtpClient(smtpSettings["Host"])
            {
                Port = int.Parse(smtpSettings["Port"]!),
                Credentials = new NetworkCredential(
                    smtpSettings["Username"], 
                    smtpSettings["Password"]
                ),
                EnableSsl = true,
                Timeout = 30000 // 30 seconds timeout
            };

            var message = new MailMessage
            {
                From = new MailAddress(smtpSettings["FromEmail"]!, smtpSettings["FromName"]),
                Subject = subject,
                Body = htmlBody,
                IsBodyHtml = true
            };
            message.To.Add(to);

            await smtpClient.SendMailAsync(message);
            
            _logger.LogInformation("Email sent successfully to {Email} with subject: {Subject}", to, subject);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {Email} with subject: {Subject}", to, subject);
            // Don't throw exception - email failures shouldn't break user operations
        }
    }

    /// <summary>
    /// Sends a registration confirmation email to a new user.
    /// </summary>
    /// <param name="to">Recipient's email address</param>
    /// <param name="firstName">User's first name</param>
    /// <param name="isApproved">Whether the user was auto-approved</param>
    /// <returns>Task representing the async operation</returns>
    public async Task SendRegistrationConfirmationAsync(string to, string firstName, bool isApproved)
    {
        var subject = "Welcome to IHCAE Alumni Network!";
        var htmlBody = isApproved 
            ? GetApprovedRegistrationTemplate(firstName)
            : GetPendingRegistrationTemplate(firstName);

        await SendEmailAsync(to, subject, htmlBody);
    }

    /// <summary>
    /// Sends an email verification token to a user.
    /// </summary>
    /// <param name="to">Recipient's email address</param>
    /// <param name="firstName">User's first name</param>
    /// <param name="verificationLink">The verification link with token</param>
    /// <returns>Task representing the async operation</returns>
    public async Task SendEmailVerificationAsync(string to, string firstName, string verificationLink)
    {
        var subject = "Verify Your Email - IHCAE Alumni Network";
        var htmlBody = GetEmailVerificationTemplate(firstName, verificationLink);

        await SendEmailAsync(to, subject, htmlBody);
    }

    /// <summary>
    /// Sends a password reset email to a user.
    /// </summary>
    /// <param name="to">Recipient's email address</param>
    /// <param name="firstName">User's first name</param>
    /// <param name="resetLink">The password reset link with token</param>
    /// <returns>Task representing the async operation</returns>
    public async Task SendPasswordResetAsync(string to, string firstName, string resetLink)
    {
        var subject = "Reset Your Password - IHCAE Alumni Network";
        var htmlBody = GetPasswordResetTemplate(firstName, resetLink);

        await SendEmailAsync(to, subject, htmlBody);
    }

    /// <summary>
    /// Sends a registration approval notification to a user.
    /// </summary>
    /// <param name="to">Recipient's email address</param>
    /// <param name="firstName">User's first name</param>
    /// <returns>Task representing the async operation</returns>
    public async Task SendRegistrationApprovedAsync(string to, string firstName)
    {
        var subject = "Registration Approved - IHCAE Alumni Network";
        var htmlBody = GetRegistrationApprovedTemplate(firstName);

        await SendEmailAsync(to, subject, htmlBody);
    }

    /// <summary>
    /// Sends a registration rejection notification to a user.
    /// </summary>
    /// <param name="to">Recipient's email address</param>
    /// <param name="firstName">User's first name</param>
    /// <returns>Task representing the async operation</returns>
    public async Task SendRegistrationRejectedAsync(string to, string firstName)
    {
        var subject = "Registration Update - IHCAE Alumni Network";
        var htmlBody = GetRegistrationRejectedTemplate(firstName);

        await SendEmailAsync(to, subject, htmlBody);
    }

    /// <summary>
    /// Sends a notification when a user receives a new reply to their topic or post.
    /// </summary>
    public async Task SendNewReplyNotificationAsync(string to, string firstName, string topicTitle, string replyAuthorName, string postLink)
    {
        var subject = $"New Reply to: {topicTitle}";
        var htmlBody = GetNewReplyTemplate(firstName, topicTitle, replyAuthorName, postLink);

        await SendEmailAsync(to, subject, htmlBody);
    }

    /// <summary>
    /// Sends a notification when a topic or post is moderated (deleted or locked) by an admin.
    /// </summary>
    public async Task SendTopicModerationNotificationAsync(string to, string firstName, string topicTitle, string action, string reason)
    {
        var subject = $"Moderation Notice: {topicTitle}";
        var htmlBody = GetTopicModerationTemplate(firstName, topicTitle, action, reason);

        await SendEmailAsync(to, subject, htmlBody);
    }

    #region Email Templates

    /// <summary>
    /// Gets the HTML template for approved registration confirmation.
    /// </summary>
    private static string GetApprovedRegistrationTemplate(string firstName)
    {
        return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <title>Welcome to IHCAE Alumni Network</title>
</head>
<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
    <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
        <h2 style='color: #16a34a;'>Welcome to IHCAE Alumni Network!</h2>
        <p>Dear {firstName},</p>
        <p>Congratulations! Your registration has been approved and your account is now active.</p>
        <p>You can now:</p>
        <ul>
            <li>Access the alumni directory</li>
            <li>Participate in forum discussions</li>
            <li>Submit job postings and success stories</li>
            <li>Connect with fellow alumni</li>
        </ul>
        <p>We're excited to have you as part of our community!</p>
        <p>Best regards,<br>IHCAE Alumni Network Team</p>
    </div>
</body>
</html>";
    }

    /// <summary>
    /// Gets the HTML template for pending registration confirmation.
    /// </summary>
    private static string GetPendingRegistrationTemplate(string firstName)
    {
        return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <title>Registration Received - IHCAE Alumni Network</title>
</head>
<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
    <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
        <h2 style='color: #2563eb;'>Registration Received</h2>
        <p>Dear {firstName},</p>
        <p>Thank you for registering with the IHCAE Alumni Network!</p>
        <p>Your registration is currently pending approval. Our administrators will review your application and notify you once it's been processed.</p>
        <p>This usually takes 1-2 business days.</p>
        <p>If you have any questions, please don't hesitate to contact us.</p>
        <p>Best regards,<br>IHCAE Alumni Network Team</p>
    </div>
</body>
</html>";
    }

    /// <summary>
    /// Gets the HTML template for email verification.
    /// </summary>
    private static string GetEmailVerificationTemplate(string firstName, string verificationLink)
    {
        return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <title>Verify Your Email - IHCAE Alumni Network</title>
</head>
<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
    <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
        <h2 style='color: #2563eb;'>Verify Your Email Address</h2>
        <p>Dear {firstName},</p>
        <p>Please click the button below to verify your email address:</p>
        <div style='text-align: center; margin: 30px 0;'>
            <a href='{verificationLink}' style='background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;'>Verify Email</a>
        </div>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't request this verification, please ignore this email.</p>
        <p>Best regards,<br>IHCAE Alumni Network Team</p>
    </div>
</body>
</html>";
    }

    /// <summary>
    /// Gets the HTML template for password reset.
    /// </summary>
    private static string GetPasswordResetTemplate(string firstName, string resetLink)
    {
        return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <title>Reset Your Password - IHCAE Alumni Network</title>
</head>
<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
    <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
        <h2 style='color: #dc2626;'>Reset Your Password</h2>
        <p>Dear {firstName},</p>
        <p>You requested to reset your password. Click the button below to create a new password:</p>
        <div style='text-align: center; margin: 30px 0;'>
            <a href='{resetLink}' style='background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;'>Reset Password</a>
        </div>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this password reset, please ignore this email.</p>
        <p>Best regards,<br>IHCAE Alumni Network Team</p>
    </div>
</body>
</html>";
    }

    /// <summary>
    /// Gets the HTML template for registration approval.
    /// </summary>
    private static string GetRegistrationApprovedTemplate(string firstName)
    {
        return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <title>Registration Approved - IHCAE Alumni Network</title>
</head>
<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
    <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
        <h2 style='color: #16a34a;'>Registration Approved!</h2>
        <p>Dear {firstName},</p>
        <p>Great news! Your registration has been approved by our administrators.</p>
        <p>Your account is now fully active and you can access all features of the IHCAE Alumni Network.</p>
        <p>Welcome to our community!</p>
        <p>Best regards,<br>IHCAE Alumni Network Team</p>
    </div>
</body>
</html>";
    }

    /// <summary>
    /// Gets the HTML template for registration rejection.
    /// </summary>
    private static string GetRegistrationRejectedTemplate(string firstName)
    {
        return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <title>Registration Update - IHCAE Alumni Network</title>
</head>
<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
    <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
        <h2 style='color: #dc2626;'>Registration Update</h2>
        <p>Dear {firstName},</p>
        <p>Thank you for your interest in joining the IHCAE Alumni Network.</p>
        <p>After careful review, we were unable to approve your registration at this time. This may be due to incomplete information or inability to verify your alumni status.</p>
        <p>If you believe this is an error, please contact our support team with additional documentation.</p>
        <p>Best regards,<br>IHCAE Alumni Network Team</p>
    </div>
</body>
</html>";
    }

    /// <summary>
    /// Gets the HTML template for new reply notification.
    /// </summary>
    private static string GetNewReplyTemplate(string firstName, string topicTitle, string replyAuthorName, string postLink)
    {
        return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <title>New Reply - IHCAE Alumni Network</title>
</head>
<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
    <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
        <h2 style='color: #2563eb;'>New Reply in Forums</h2>
        <p>Dear {firstName},</p>
        <p><strong>{replyAuthorName}</strong> has replied to the discussion topic: <em>{topicTitle}</em>.</p>
        <div style='text-align: center; margin: 30px 0;'>
            <a href='{postLink}' style='background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;'>View Reply</a>
        </div>
        <p>Best regards,<br>IHCAE Alumni Network Team</p>
    </div>
</body>
</html>";
    }

    /// <summary>
    /// Gets the HTML template for topic moderation notification.
    /// </summary>
    private static string GetTopicModerationTemplate(string firstName, string topicTitle, string action, string reason)
    {
        var headerColor = action.ToLower() == "deleted" ? "#dc2626" : "#eab308";
        return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <title>Moderation Notice - IHCAE Alumni Network</title>
</head>
<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
    <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
        <h2 style='color: {headerColor};'>Moderation Notice</h2>
        <p>Dear {firstName},</p>
        <p>Your content in the discussion topic <em>{topicTitle}</em> has been <strong>{action}</strong> by a moderator.</p>
        <div style='background-color: #f3f4f6; padding: 15px; border-left: 4px solid {headerColor}; margin: 20px 0;'>
            <strong>Reason:</strong> {reason}
        </div>
        <p>Please refer to our community guidelines. If you believe this is an error, please contact our support team.</p>
        <p>Best regards,<br>IHCAE Alumni Network Team</p>
    </div>
</body>
</html>";
    }

    #endregion
}

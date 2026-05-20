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
    public async Task SendEmailVerificationAsync(string to, string firstName, string verificationLink)
    {
        var subject = "Verify Your Email - IHCAE Alumni Network";
        var htmlBody = GetEmailVerificationTemplate(firstName, verificationLink);

        await SendEmailAsync(to, subject, htmlBody);
    }

    /// <summary>
    /// Sends a password reset email to a user.
    /// </summary>
    public async Task SendPasswordResetAsync(string to, string firstName, string resetLink)
    {
        var subject = "Reset Your Password - IHCAE Alumni Network";
        var htmlBody = GetPasswordResetTemplate(firstName, resetLink);

        await SendEmailAsync(to, subject, htmlBody);
    }

    /// <summary>
    /// Sends a registration approval notification to a user.
    /// </summary>
    public async Task SendRegistrationApprovedAsync(string to, string firstName)
    {
        var subject = "Registration Approved - IHCAE Alumni Network";
        var htmlBody = GetRegistrationApprovedTemplate(firstName);

        await SendEmailAsync(to, subject, htmlBody);
    }

    /// <summary>
    /// Sends a registration rejection notification to a user.
    /// </summary>
    public async Task SendRegistrationRejectedAsync(string to, string firstName, string? reason = null)
    {
        var subject = "Registration Update - IHCAE Alumni Network";
        var htmlBody = GetRegistrationRejectedTemplate(firstName, reason);

        await SendEmailAsync(to, subject, htmlBody);
    }

    /// <summary>
    /// Sends a password reset success confirmation email to a user.
    /// </summary>
    public async Task SendPasswordResetConfirmationAsync(string to, string firstName)
    {
        var subject = "Password Reset Successful - IHCAE Alumni Network";
        var htmlBody = GetPasswordResetConfirmationTemplate(firstName);

        await SendEmailAsync(to, subject, htmlBody);
    }

    /// <summary>
    /// Sends a claim account link to a bulk-imported legacy user.
    /// </summary>
    public async Task SendClaimAccountEmailAsync(string to, string firstName, string setupUrl)
    {
        var subject = "Welcome to IHCAE Alumni Network - Claim Your Account";
        var htmlBody = GetClaimAccountTemplate(firstName, setupUrl);

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

    /// <summary>
    /// Sends an admin notification that a new event has been submitted.
    /// </summary>
    public async Task SendEventSubmittedNotificationAsync(string to, string eventTitle, Guid eventId)
    {
        var subject = "New Event Pending Review";
        var htmlBody = GetEventSubmittedTemplate(eventTitle, eventId);

        await SendEmailAsync(to, subject, htmlBody);
    }

    /// <summary>
    /// Sends a notification to a user regarding the approval or rejection of their event.
    /// </summary>
    public async Task SendEventStatusNotificationAsync(string to, string firstName, string eventTitle, string status, string? reason = null)
    {
        var subject = "Event Submission Update";
        var htmlBody = GetEventStatusTemplate(firstName, eventTitle, status, reason);

        await SendEmailAsync(to, subject, htmlBody);
    }

    /// <summary>
    /// Sends an event registration confirmation.
    /// </summary>
    public async Task SendEventRegistrationConfirmationAsync(string to, string name, string eventTitle)
    {
        var subject = $"Event Registration Confirmation - {eventTitle}";
        var htmlBody = GetEventRegistrationConfirmationTemplate(name, eventTitle);

        await SendEmailAsync(to, subject, htmlBody);
    }

    /// <summary>
    /// Sends an admin notification that a new article has been submitted.
    /// </summary>
    public async Task SendNewsSubmittedNotificationAsync(string to, string articleTitle, Guid articleId)
    {
        var subject = "New Content Pending Review";
        var htmlBody = GetNewsSubmittedTemplate(articleTitle, articleId);

        await SendEmailAsync(to, subject, htmlBody);
    }

    /// <summary>
    /// Sends a notification to a user regarding the approval or rejection of their article.
    /// </summary>
    public async Task SendNewsStatusNotificationAsync(string to, string firstName, string articleTitle, string status, string? reason = null)
    {
        var subject = "Article Submission Update";
        var htmlBody = GetNewsStatusTemplate(firstName, articleTitle, status, reason);

        await SendEmailAsync(to, subject, htmlBody);
    }

    #region Layout Wrapper & Email Templates

    /// <summary>
    /// Centralized lightweight responsive zero-emoji HTML layout.
    /// </summary>
    private static string WrapInLayout(string subtitle, string contentHtml)
    {
        var year = DateTime.UtcNow.Year;
        return $@"<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, ""Segoe UI"", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #374151; margin: 0; padding: 20px; background-color: #f9fafb; }}
        .container {{ max-width: 540px; margin: 0 auto; background-color: #ffffff; padding: 30px 24px; border-radius: 8px; border: 1px solid #e5e7eb; }}
        .header {{ margin-bottom: 24px; border-bottom: 2px solid #047857; padding-bottom: 14px; }}
        .logo {{ font-size: 18px; font-weight: 700; color: #047857; text-transform: uppercase; letter-spacing: 0.05em; margin: 0; }}
        .subtitle {{ font-size: 13px; color: #6b7280; margin: 4px 0 0 0; text-transform: capitalize; }}
        .content {{ font-size: 15px; }}
        .content h2 {{ margin-top: 0; margin-bottom: 14px; font-size: 17px; font-weight: 700; color: #111827; }}
        .btn-container {{ text-align: center; margin: 24px 0; }}
        .btn {{ display: inline-block; background-color: #047857; color: #ffffff !important; padding: 11px 24px; text-decoration: none; border-radius: 4px; font-weight: 600; font-size: 14px; }}
        .btn-secondary {{ display: inline-block; background-color: #4b5563; color: #ffffff !important; padding: 11px 24px; text-decoration: none; border-radius: 4px; font-weight: 600; font-size: 14px; }}
        .notice {{ padding: 14px 16px; border-left: 4px solid #9ca3af; background-color: #f3f4f6; border-radius: 4px; margin: 18px 0; }}
        .notice-title {{ font-weight: 700; color: #1f2937; margin-bottom: 2px; font-size: 14px; }}
        .notice-content {{ font-size: 13.5px; color: #4b5563; line-height: 1.5; margin: 0; }}
        .notice.success {{ border-left-color: #10b981; background-color: #ecfdf5; }}
        .notice.success .notice-title {{ color: #065f46; }}
        .notice.success .notice-content {{ color: #047857; }}
        .notice.warning {{ border-left-color: #f59e0b; background-color: #fffbeb; }}
        .notice.warning .notice-title {{ color: #92400e; }}
        .notice.warning .notice-content {{ color: #b45309; }}
        .notice.danger {{ border-left-color: #ef4444; background-color: #fef2f2; }}
        .notice.danger .notice-title {{ color: #991b1b; }}
        .notice.danger .notice-content {{ color: #b91c1c; }}
        .footer {{ margin-top: 28px; border-top: 1px solid #e5e7eb; padding-top: 18px; text-align: center; }}
        .footer p {{ margin: 0 0 4px 0; font-size: 11.5px; line-height: 1.5; color: #9ca3af; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <div class='logo'>IHCAE Alumni Network</div>
            <div class='subtitle'>{subtitle}</div>
        </div>
        <div class='content'>
            {contentHtml}
        </div>
        <div class='footer'>
            <p>Indian Himalayan Centre for Adventure and Eco-tourism (IHCAE)<br>Chemchey, South Sikkim, India</p>
            <p>&copy; {year} IHCAE Alumni Network. All rights reserved.</p>
        </div>
    </div>
</body>
</html>";
    }

    private static string GetApprovedRegistrationTemplate(string firstName)
    {
        var content = $@"
            <h2>Hello {firstName},</h2>
            <p>Congratulations! Your registration has been approved and your account is now active.</p>
            <p>You can now sign in to:</p>
            <ul>
                <li>Access the alumni directory</li>
                <li>Participate in forum discussions</li>
                <li>Submit events and success stories</li>
                <li>Connect with fellow alumni</li>
            </ul>
            <p>We are excited to have you as part of our community!</p>
            <p>Best regards,<br>IHCAE Alumni Network Team</p>";
        return WrapInLayout("Welcome to the Network", content);
    }

    private static string GetPendingRegistrationTemplate(string firstName)
    {
        var content = $@"
            <h2>Hello {firstName},</h2>
            <p>Thank you for registering with the IHCAE Alumni Network!</p>
            <p>Your registration is currently pending review. Our administrators will verify your alumni status and notify you once your application is processed.</p>
            <div class='notice'>
                <div class='notice-title'>Processing Time</div>
                <p class='notice-content'>Verification usually takes 1-2 business days. We will email you immediately upon approval.</p>
            </div>
            <p>Best regards,<br>IHCAE Alumni Network Team</p>";
        return WrapInLayout("Registration Received", content);
    }

    private static string GetEmailVerificationTemplate(string firstName, string verificationLink)
    {
        var content = $@"
            <h2>Hello {firstName},</h2>
            <p>Please click the button below to verify your email address and activate your account:</p>
            <div class='btn-container'>
                <a href='{verificationLink}' class='btn'>Verify Email</a>
            </div>
            <div class='notice warning'>
                <div class='notice-title'>Link Expiry</div>
                <p class='notice-content'>For security, this link will expire in 24 hours. If you did not request this verification, you can safely ignore this email.</p>
            </div>
            <p>Best regards,<br>IHCAE Alumni Network Team</p>";
        return WrapInLayout("Email Verification", content);
    }

    private static string GetPasswordResetTemplate(string firstName, string resetLink)
    {
        var content = $@"
            <h2>Hello {firstName},</h2>
            <p>We received a request to reset the password for your account. Click the button below to set up a new password:</p>
            <div class='btn-container'>
                <a href='{resetLink}' class='btn'>Reset Password</a>
            </div>
            <div class='notice warning'>
                <div class='notice-title'>Security Notice</div>
                <p class='notice-content'>This link will expire in 1 hour. If you did not request this password reset, your account is safe and you can safely ignore this email.</p>
            </div>
            <p>Best regards,<br>IHCAE Alumni Network Team</p>";
        return WrapInLayout("Password Reset", content);
    }

    private static string GetRegistrationApprovedTemplate(string firstName)
    {
        var content = $@"
            <h2>Hello {firstName},</h2>
            <p>Great news! Your registration has been approved by our administrators.</p>
            <p>Your account is now fully active, and you can log in to access all network features.</p>
            <p>Welcome to our community!</p>
            <p>Best regards,<br>IHCAE Alumni Network Team</p>";
        return WrapInLayout("Registration Approved", content);
    }

    private static string GetRegistrationRejectedTemplate(string firstName, string? reason)
    {
        var reasonHtml = string.IsNullOrEmpty(reason)
            ? "This may be due to incomplete registration info or inability to verify your alumni status."
            : reason;

        var content = $@"
            <h2>Hello {firstName},</h2>
            <p>Thank you for your interest in joining the IHCAE Alumni Network.</p>
            <p>After careful review, we were unable to approve your registration at this time.</p>
            <div class='notice danger'>
                <div class='notice-title'>Rejection Reason</div>
                <p class='notice-content'>{reasonHtml}</p>
            </div>
            <p>If you believe this is an error, please reply to this email with additional documentation.</p>
            <p>Best regards,<br>IHCAE Alumni Network Team</p>";
        return WrapInLayout("Registration Status Update", content);
    }

    private static string GetPasswordResetConfirmationTemplate(string firstName)
    {
        var content = $@"
            <h2>Hello {firstName},</h2>
            <div class='notice success'>
                <div class='notice-title'>Password Reset Successful</div>
                <p class='notice-content'>Your account password has been updated successfully. You can now sign in with your new password.</p>
            </div>
            <p>If you did not make this change, please contact our administrator immediately to protect your account.</p>
            <p>Best regards,<br>IHCAE Alumni Network Team</p>";
        return WrapInLayout("Password Changed", content);
    }

    private static string GetClaimAccountTemplate(string firstName, string setupUrl)
    {
        var content = $@"
            <h2>Hello {firstName},</h2>
            <p>Welcome to the new IHCAE Alumni Network! We have pre-registered your account based on our legacy student records.</p>
            <p>To claim your account and secure it with a new password, click the setup button below:</p>
            <div class='btn-container'>
                <a href='{setupUrl}' class='btn'>Claim My Account</a>
            </div>
            <div class='notice warning'>
                <div class='notice-title'>Account Claim Expiry</div>
                <p class='notice-content'>For security, this setup link is valid for 7 days. Once claimed, you will be able to access the directory, forums, and events.</p>
            </div>
            <p>Best regards,<br>IHCAE Alumni Network Team</p>";
        return WrapInLayout("Account Claim Invitation", content);
    }

    private static string GetNewReplyTemplate(string firstName, string topicTitle, string replyAuthorName, string postLink)
    {
        var content = $@"
            <h2>Hello {firstName},</h2>
            <p><strong>{replyAuthorName}</strong> has replied to the discussion topic: <em>{topicTitle}</em>.</p>
            <div class='btn-container'>
                <a href='{postLink}' class='btn-secondary'>View Discussion Reply</a>
            </div>
            <p>Best regards,<br>IHCAE Alumni Network Team</p>";
        return WrapInLayout("New Forum Activity", content);
    }

    private static string GetTopicModerationTemplate(string firstName, string topicTitle, string action, string reason)
    {
        var styleClass = action.ToLower() == "deleted" ? "danger" : "warning";
        var content = $@"
            <h2>Hello {firstName},</h2>
            <p>A forum moderator has performed a <strong>{action}</strong> action on your content in the topic: <em>{topicTitle}</em>.</p>
            <div class='notice {styleClass}'>
                <div class='notice-title'>Moderation Details</div>
                <p class='notice-content'><strong>Reason:</strong> {reason}</p>
            </div>
            <p>If you have any questions or believe this is an error, please reply to this email.</p>
            <p>Best regards,<br>IHCAE Alumni Network Team</p>";
        return WrapInLayout("Content Moderation Update", content);
    }

    private static string GetEventSubmittedTemplate(string eventTitle, Guid eventId)
    {
        var content = $@"
            <h2>Hello Administrator,</h2>
            <p>A new event has been submitted and is awaiting your review.</p>
            <div class='notice'>
                <div class='notice-title'>Event Submitted</div>
                <p class='notice-content'><strong>Title:</strong> {eventTitle}<br><strong>Event ID:</strong> {eventId}</p>
            </div>
            <p>Please log in to the admin dashboard to review and approve this event.</p>
            <p>Best regards,<br>IHCAE Alumni Network System</p>";
        return WrapInLayout("Event Awaiting Review", content);
    }

    private static string GetEventStatusTemplate(string firstName, string eventTitle, string status, string? reason)
    {
        var styleClass = status.ToLower() == "approved" ? "success" : "danger";
        var reasonBlock = !string.IsNullOrEmpty(reason)
            ? $"<p class='notice-content'><strong>Reason:</strong> {reason}</p>"
            : "";

        var content = $@"
            <h2>Hello {firstName},</h2>
            <p>Your event submission: <em>{eventTitle}</em> has been processed.</p>
            <div class='notice {styleClass}'>
                <div class='notice-title'>Event Status: {status.ToUpper()}</div>
                {reasonBlock}
            </div>
            <p>Best regards,<br>IHCAE Alumni Network Team</p>";
        return WrapInLayout("Event Submission Status", content);
    }

    private static string GetEventRegistrationConfirmationTemplate(string name, string eventTitle)
    {
        var content = $@"
            <h2>Hello {name},</h2>
            <p>Your registration for the event <strong>{eventTitle}</strong> has been successfully confirmed.</p>
            <div class='notice success'>
                <div class='notice-title'>Registration Confirmed</div>
                <p class='notice-content'>Thank you for registering! We look forward to seeing you at the event.</p>
            </div>
            <p>Best regards,<br>IHCAE Alumni Network Team</p>";
        return WrapInLayout("Event Registration Confirmed", content);
    }

    private static string GetNewsSubmittedTemplate(string articleTitle, Guid articleId)
    {
        var content = $@"
            <h2>Hello Administrator,</h2>
            <p>A new success story / article has been submitted and is awaiting your review.</p>
            <div class='notice'>
                <div class='notice-title'>Article Submitted</div>
                <p class='notice-content'><strong>Title:</strong> {articleTitle}<br><strong>Article ID:</strong> {articleId}</p>
            </div>
            <p>Please log in to the admin dashboard to review and approve this article.</p>
            <p>Best regards,<br>IHCAE Alumni Network System</p>";
        return WrapInLayout("Article Awaiting Review", content);
    }

    private static string GetNewsStatusTemplate(string firstName, string articleTitle, string status, string? reason)
    {
        var styleClass = status.ToLower() == "approved" ? "success" : "danger";
        var reasonBlock = !string.IsNullOrEmpty(reason)
            ? $"<p class='notice-content'><strong>Reason:</strong> {reason}</p>"
            : "";

        var content = $@"
            <h2>Hello {firstName},</h2>
            <p>Your article submission: <em>{articleTitle}</em> has been processed.</p>
            <div class='notice {styleClass}'>
                <div class='notice-title'>Article Status: {status.ToUpper()}</div>
                {reasonBlock}
            </div>
            <p>Best regards,<br>IHCAE Alumni Network Team</p>";
        return WrapInLayout("Article Submission Status", content);
    }

    #endregion
}

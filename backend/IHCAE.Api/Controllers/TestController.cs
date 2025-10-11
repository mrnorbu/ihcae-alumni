using Microsoft.AspNetCore.Mvc;
using IHCAE.Application.Interfaces;

namespace IHCAE.Api.Controllers;

/// <summary>
/// Controller for testing email functionality during development.
/// This controller should be removed or secured in production.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class TestController : ControllerBase
{
    private readonly IEmailService _emailService;
    private readonly ILogger<TestController> _logger;

    public TestController(IEmailService emailService, ILogger<TestController> logger)
    {
        _emailService = emailService;
        _logger = logger;
    }

    /// <summary>
    /// Test endpoint to verify email service is working.
    /// Only available in development environment.
    /// </summary>
    [HttpPost("email")]
    public async Task<IActionResult> TestEmail([FromBody] TestEmailRequest request)
    {
        try
        {
            await _emailService.SendEmailAsync(
                request.To,
                request.Subject,
                request.Body
            );

            _logger.LogInformation("Test email sent successfully to {Email}", request.To);
            return Ok(new { success = true, message = "Test email sent successfully!" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send test email to {Email}", request.To);
            return BadRequest(new { success = false, message = ex.Message });
        }
    }
}

/// <summary>
/// Request model for test email endpoint.
/// </summary>
public class TestEmailRequest
{
    public string To { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
}

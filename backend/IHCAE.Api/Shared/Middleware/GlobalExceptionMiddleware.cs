using System.Net;
using System.Text.Json;
using IHCAE.Api.Shared.DTOs;

namespace IHCAE.Api.Shared.Middleware;

/// <summary>
/// Global exception handling middleware that catches all unhandled exceptions
/// and returns consistent error responses to clients.
/// </summary>
public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;
    private readonly IHostEnvironment _environment;

    /// <summary>
    /// Initializes a new instance of the GlobalExceptionMiddleware.
    /// </summary>
    /// <param name="next">The next middleware in the pipeline</param>
    /// <param name="logger">Logger for exception logging</param>
    /// <param name="environment">Host environment information</param>
    public GlobalExceptionMiddleware(
        RequestDelegate next,
        ILogger<GlobalExceptionMiddleware> logger,
        IHostEnvironment environment)
    {
        _next = next;
        _logger = logger;
        _environment = environment;
    }

    /// <summary>
    /// Invokes the middleware to handle the HTTP request.
    /// </summary>
    /// <param name="context">The HTTP context</param>
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception occurred. Path: {Path}, Method: {Method}", 
                context.Request.Path, context.Request.Method);
            
            await HandleExceptionAsync(context, ex);
        }
    }

    /// <summary>
    /// Handles the exception and writes an appropriate error response.
    /// </summary>
    /// <param name="context">The HTTP context</param>
    /// <param name="exception">The exception that occurred</param>
    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";
        
        var (statusCode, message) = GetStatusCodeAndMessage(exception);
        context.Response.StatusCode = statusCode;

        var errorResponse = new ErrorResponse
        {
            StatusCode = statusCode,
            Message = message,
            Timestamp = DateTime.UtcNow
        };

        // Include stack trace and detailed error info only in development
        if (_environment.IsDevelopment())
        {
            errorResponse.Details = exception.ToString();
            errorResponse.Errors = new List<string> { exception.Message };
            
            if (exception.InnerException != null)
            {
                errorResponse.Errors.Add($"Inner Exception: {exception.InnerException.Message}");
            }
        }

        var jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = _environment.IsDevelopment()
        };

        var json = JsonSerializer.Serialize(errorResponse, jsonOptions);
        await context.Response.WriteAsync(json);
    }

    /// <summary>
    /// Maps exception types to appropriate HTTP status codes and user-friendly messages.
    /// </summary>
    /// <param name="exception">The exception to map</param>
    /// <returns>Tuple containing status code and message</returns>
    private (int statusCode, string message) GetStatusCodeAndMessage(Exception exception)
    {
        return exception switch
        {
            KeyNotFoundException => 
                ((int)HttpStatusCode.NotFound, "The requested resource was not found."),
            
            UnauthorizedAccessException => 
                ((int)HttpStatusCode.Forbidden, "You do not have permission to access this resource."),
            
            InvalidOperationException => 
                ((int)HttpStatusCode.BadRequest, exception.Message),
            
            // ArgumentNullException must come before ArgumentException (it's a subclass)
            ArgumentNullException => 
                ((int)HttpStatusCode.BadRequest, "A required parameter was not provided."),
            
            ArgumentException => 
                ((int)HttpStatusCode.BadRequest, exception.Message),
            
            NotImplementedException => 
                ((int)HttpStatusCode.NotImplemented, "This feature is not yet implemented."),
            
            TimeoutException => 
                ((int)HttpStatusCode.RequestTimeout, "The request timed out. Please try again."),
            
            _ => ((int)HttpStatusCode.InternalServerError, 
                  _environment.IsDevelopment() 
                      ? exception.Message 
                      : "An unexpected error occurred. Please try again later.")
        };
    }
}

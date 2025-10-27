# Global Exception Handling Middleware

## Overview

The `GlobalExceptionMiddleware` provides centralized exception handling for the entire API. It catches all unhandled exceptions and returns consistent, user-friendly error responses.

## Features

- **Consistent Error Responses**: All errors follow the same `ErrorResponse` format
- **Automatic Status Code Mapping**: Maps exception types to appropriate HTTP status codes
- **Development vs Production**: Shows detailed error info in development, sanitized messages in production
- **Comprehensive Logging**: Logs all exceptions with request context
- **Security**: Prevents sensitive error details from leaking in production

## Exception Mapping

| Exception Type | HTTP Status | Description |
|---------------|-------------|-------------|
| `KeyNotFoundException` | 404 Not Found | Resource not found |
| `UnauthorizedAccessException` | 403 Forbidden | Permission denied |
| `InvalidOperationException` | 400 Bad Request | Invalid operation |
| `ArgumentException` | 400 Bad Request | Invalid argument |
| `ArgumentNullException` | 400 Bad Request | Missing required parameter |
| `NotImplementedException` | 501 Not Implemented | Feature not implemented |
| `TimeoutException` | 408 Request Timeout | Request timed out |
| All others | 500 Internal Server Error | Unexpected error |

## Error Response Format

### Production Response
```json
{
  "statusCode": 404,
  "message": "The requested resource was not found.",
  "timestamp": "2024-10-27T10:30:00Z"
}
```

### Development Response
```json
{
  "statusCode": 500,
  "message": "Object reference not set to an instance of an object.",
  "timestamp": "2024-10-27T10:30:00Z",
  "details": "System.NullReferenceException: Object reference not set...\n   at IHCAE.Api...",
  "errors": [
    "Object reference not set to an instance of an object.",
    "Inner Exception: Additional details here"
  ]
}
```

## Usage in Controllers

You no longer need try-catch blocks for general error handling. Just throw exceptions:

```csharp
[HttpGet("{id}")]
public async Task<IActionResult> GetById(Guid id)
{
    // If not found, throw KeyNotFoundException
    var item = await _service.GetByIdAsync(id);
    if (item == null)
    {
        throw new KeyNotFoundException($"Item with ID {id} not found");
    }
    
    return Ok(item);
}
```

## Custom Exceptions

For domain-specific errors, create custom exceptions:

```csharp
public class AlumniNotFoundException : KeyNotFoundException
{
    public AlumniNotFoundException(Guid id) 
        : base($"Alumni with ID {id} was not found")
    {
    }
}
```

## Testing

To test the middleware, you can create a test endpoint:

```csharp
[HttpGet("test-error")]
public IActionResult TestError()
{
    throw new InvalidOperationException("This is a test error");
}
```

## Configuration

The middleware is registered early in the pipeline in `Program.cs`:

```csharp
app.UseMiddleware<GlobalExceptionMiddleware>();
```

It must be placed before other middleware to catch all exceptions.

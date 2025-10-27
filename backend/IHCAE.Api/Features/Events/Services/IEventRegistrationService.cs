using IHCAE.Api.Features.Events.Models.DTOs;
using IHCAE.Api.Shared.DTOs;

namespace IHCAE.Api.Features.Events.Services;

/// <summary>
/// Service interface for event registration operations
/// </summary>
public interface IEventRegistrationService
{
    // Public registration
    Task<EventRegistrationDto> RegisterForEventAsync(Guid eventId, RegisterForEventRequest request, Guid? userId);
    
    Task<bool> CheckIfRegisteredAsync(Guid eventId, string email);
    
    Task<int> GetAvailableSpotsAsync(Guid eventId);
    
    // Admin management
    Task<PaginatedResult<EventRegistrationDto>> GetEventRegistrationsAsync(Guid eventId, int page, int pageSize);
    
    Task<byte[]> ExportRegistrationsToCsvAsync(Guid eventId);
    
    Task<bool> CancelRegistrationAsync(Guid registrationId, Guid adminId);
}

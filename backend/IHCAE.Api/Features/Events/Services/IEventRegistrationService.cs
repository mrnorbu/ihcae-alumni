using IHCAE.Api.Features.Events.Models.DTOs;
using IHCAE.Api.Shared.DTOs;

namespace IHCAE.Api.Features.Events.Services;

/// <summary>
/// Service interface for event registration operations
/// </summary>
public interface IEventRegistrationService
{
    // Public registration
    Task<EventRegistrationDto> RegisterForEventAsync(int eventId, RegisterForEventRequest request, int? userId);
    
    Task<bool> CheckIfRegisteredAsync(int eventId, string email);
    
    Task<int> GetAvailableSpotsAsync(int eventId);
    
    // Admin management
    Task<PaginatedResult<EventRegistrationDto>> GetEventRegistrationsAsync(int eventId, int page, int pageSize);
    
    Task<byte[]> ExportRegistrationsToCsvAsync(int eventId);
    
    Task<bool> CancelRegistrationAsync(int registrationId, int adminId);
}

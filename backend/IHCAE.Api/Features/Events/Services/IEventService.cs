using IHCAE.Api.Features.Events.Models.DTOs;
using IHCAE.Api.Shared.DTOs;

namespace IHCAE.Api.Features.Events.Services;

/// <summary>
/// Service interface for event operations
/// </summary>
public interface IEventService
{
    // Public viewing
    Task<PaginatedResult<EventSummaryDto>> GetUpcomingEventsAsync(
        int page, int pageSize, Guid? categoryId = null, string? location = null, 
        DateTime? startDate = null, DateTime? endDate = null);
    
    Task<EventDto> GetEventByIdAsync(Guid id);
    
    // Content creation (Admin/Content Creator)
    Task<EventDto> CreateEventAsync(Guid creatorId, CreateEventRequest request, bool isAdmin);
    
    Task<EventDto> UpdateEventAsync(Guid id, Guid userId, UpdateEventRequest request, bool isAdmin);
    
    Task<bool> DeleteEventAsync(Guid id, Guid userId, bool isAdmin);
    
    // Admin operations
    Task<PaginatedResult<EventSummaryDto>> GetPendingEventsAsync(int page, int pageSize);
    Task<List<EventSummaryDto>> GetManagementEventsAsync(Guid userId, bool isAdmin);
    
    Task<EventDto> ApproveEventAsync(Guid id, Guid adminId);
    
    Task<bool> RejectEventAsync(Guid id, Guid adminId, string reason);
    
    // Categories
    Task<List<EventCategoryDto>> GetCategoriesAsync();
}

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
        int page, int pageSize, int? categoryId = null, string? location = null, 
        DateTime? startDate = null, DateTime? endDate = null);
    
    Task<EventDto> GetEventBySlugAsync(string slug);
    Task<EventDto> GetEventByIdAsync(int id);
    
    // Content creation (Admin/Content Creator)
    Task<EventDto> CreateEventAsync(int creatorId, CreateEventRequest request, bool isAdmin);
    
    Task<EventDto> UpdateEventAsync(int id, int userId, UpdateEventRequest request, bool isAdmin);
    
    Task<bool> DeleteEventAsync(int id, int userId, bool isAdmin);
    
    // Admin operations
    Task<PaginatedResult<EventSummaryDto>> GetPendingEventsAsync(int page, int pageSize);
    Task<List<EventSummaryDto>> GetManagementEventsAsync(int userId, bool isAdmin);
    
    Task<EventDto> ApproveEventAsync(int id, int adminId);
    
    Task<bool> RejectEventAsync(int id, int adminId, string reason);
    
    // Categories
    Task<List<EventCategoryDto>> GetCategoriesAsync();
}

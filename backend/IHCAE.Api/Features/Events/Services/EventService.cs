using Microsoft.EntityFrameworkCore;
using IHCAE.Api.Features.Events.Models.Entities;
using IHCAE.Api.Features.Events.Models.DTOs;
using IHCAE.Api.Features.News.Models.Entities;
using IHCAE.Api.Shared.Data;
using IHCAE.Api.Shared.DTOs;
using IHCAE.Api.Shared.Services;
using IHCAE.Api.Shared.Helpers;
using AuthorDto = IHCAE.Api.Shared.DTOs.AuthorDto;

namespace IHCAE.Api.Features.Events.Services;

/// <summary>
/// Service implementation for event operations
/// </summary>
public class EventService : IEventService
{
    private readonly AppDbContext _context;
    private readonly ILogger<EventService> _logger;
    private readonly IEmailService _emailService;
    private readonly IUrlHelperService _urlHelperService;

    public EventService(AppDbContext context, ILogger<EventService> logger, IEmailService emailService, IUrlHelperService urlHelperService)
    {
        _context = context;
        _logger = logger;
        _emailService = emailService;
        _urlHelperService = urlHelperService;
    }

    public async Task<PaginatedResult<EventSummaryDto>> GetUpcomingEventsAsync(
        int page, int pageSize, int? categoryId = null, string? location = null, 
        DateTime? startDate = null, DateTime? endDate = null)
    {
        if (page < 1) page = 1;
        if (pageSize < 1 || pageSize > 50) pageSize = 10;

        var query = _context.Events
            .Include(e => e.Category)
            .Include(e => e.Registrations)
            .Where(e => e.Status == ContentStatus.Published && e.EventDate >= DateTime.UtcNow)
            .AsQueryable();

        // Filter by category
        if (categoryId.HasValue)
        {
            query = query.Where(e => e.CategoryId == categoryId.Value);
        }

        // Filter by location
        if (!string.IsNullOrWhiteSpace(location))
        {
            var locationLower = location.ToLower();
            query = query.Where(e => e.Location.ToLower().Contains(locationLower));
        }

        // Filter by date range
        if (startDate.HasValue)
        {
            query = query.Where(e => e.EventDate >= startDate.Value);
        }

        if (endDate.HasValue)
        {
            query = query.Where(e => e.EventDate <= endDate.Value);
        }

        var totalCount = await query.CountAsync();

        var events = await query
            .OrderBy(e => e.EventDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        // Map to DTOs after materialization
        var eventDtos = events.Select(e => MapToSummaryDto(e)).ToList();

        return new PaginatedResult<EventSummaryDto>
        {
            Items = eventDtos,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<EventDto> GetEventBySlugAsync(string slug)
    {
        var eventEntity = await _context.Events
            .Include(e => e.Category)
            .Include(e => e.CreatedBy)
                .ThenInclude(u => u.AlumniProfile)
            .Include(e => e.Registrations)
            .FirstOrDefaultAsync(e => e.Slug == slug && e.Status == ContentStatus.Published);

        if (eventEntity == null)
        {
            throw new KeyNotFoundException($"Event with slug {slug} not found");
        }

        return MapToDto(eventEntity);
    }

    public async Task<EventDto> GetEventByIdAsync(int id)
    {
        var eventEntity = await _context.Events
            .Include(e => e.Category)
            .Include(e => e.CreatedBy)
                .ThenInclude(u => u.AlumniProfile)
            .Include(e => e.Registrations)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (eventEntity == null)
        {
            throw new KeyNotFoundException($"Event with ID {id} not found");
        }

        return MapToDto(eventEntity);
    }

    public async Task<EventDto> CreateEventAsync(int creatorId, CreateEventRequest request, bool isAdmin)
    {
        // Verify category exists if provided
        if (request.CategoryId.HasValue)
        {
            var categoryExists = await _context.EventCategories.AnyAsync(c => c.Id == request.CategoryId.Value);
            if (!categoryExists)
            {
                throw new ArgumentException("Invalid category ID");
            }
        }

        // Validate dates
        if (request.EventDate.Date < DateTime.UtcNow.Date)
        {
            throw new ArgumentException("Event date cannot be in the past");
        }

        if (request.EventEndDate.HasValue && request.EventEndDate.Value < request.EventDate)
        {
            throw new ArgumentException("Event end date cannot be before start date");
        }

        if (request.RegistrationDeadline.HasValue && request.RegistrationDeadline.Value > request.EventDate)
        {
            throw new ArgumentException("Registration deadline cannot be after event date");
        }

        var eventEntity = new Event
        {
            Title = request.Title,
            Slug = SlugHelper.GenerateSlug(request.Title) + "-" + Guid.NewGuid().ToString().Substring(0, 4),
            Description = request.Description,
            CategoryId = request.CategoryId,
            Location = request.Location,
            EventDate = request.EventDate,
            EventEndDate = request.EventEndDate,
            ImageUrl = request.ImageUrl,
            ThumbnailUrl = request.ThumbnailUrl,
            Capacity = request.Capacity,
            RegistrationDeadline = request.RegistrationDeadline,
            CreatedById = creatorId,
            Status = isAdmin && request.Publish ? ContentStatus.Published : 
                     isAdmin ? ContentStatus.Draft : ContentStatus.PendingReview,
            PublishedAt = isAdmin && request.Publish ? DateTime.UtcNow : null,
            CreatedAt = DateTime.UtcNow
        };

        _context.Events.Add(eventEntity);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Event {EventId} created by user {UserId} with status {Status}", 
            eventEntity.Id, creatorId, eventEntity.Status);

        // Send notification if pending review
        if (eventEntity.Status == ContentStatus.PendingReview)
        {
            await SendEventSubmittedNotificationAsync(eventEntity.Id);
        }

        return await GetEventByIdForManagement(eventEntity.Id);
    }

    public async Task<EventDto> UpdateEventAsync(int id, int userId, UpdateEventRequest request, bool isAdmin)
    {
        var eventEntity = await _context.Events
            .Include(e => e.Category)
            .Include(e => e.CreatedBy)
            .Include(e => e.Registrations)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (eventEntity == null)
        {
            throw new KeyNotFoundException($"Event with ID {id} not found");
        }

        // Check ownership (non-admins can only edit their own events)
        if (!isAdmin && eventEntity.CreatedById != userId)
        {
            throw new UnauthorizedAccessException("You can only edit your own events");
        }

        // Verify category exists if provided
        if (request.CategoryId.HasValue)
        {
            var categoryExists = await _context.EventCategories.AnyAsync(c => c.Id == request.CategoryId.Value);
            if (!categoryExists)
            {
                throw new ArgumentException("Invalid category ID");
            }
        }

        // Validate dates
        if (request.EventEndDate.HasValue && request.EventEndDate.Value < request.EventDate)
        {
            throw new ArgumentException("Event end date cannot be before start date");
        }

        if (request.RegistrationDeadline.HasValue && request.RegistrationDeadline.Value > request.EventDate)
        {
            throw new ArgumentException("Registration deadline cannot be after event date");
        }

        eventEntity.Title = request.Title;
        eventEntity.Description = request.Description;
        eventEntity.CategoryId = request.CategoryId;
        eventEntity.Location = request.Location;
        eventEntity.EventDate = request.EventDate;
        eventEntity.EventEndDate = request.EventEndDate;
        eventEntity.ImageUrl = request.ImageUrl;
        eventEntity.ThumbnailUrl = request.ThumbnailUrl;
        eventEntity.Capacity = request.Capacity;
        eventEntity.RegistrationDeadline = request.RegistrationDeadline;
        eventEntity.UpdatedAt = DateTime.UtcNow;

        // Only admins can change publish status
        if (isAdmin && request.Publish && eventEntity.Status != ContentStatus.Published)
        {
            eventEntity.Status = ContentStatus.Published;
            eventEntity.PublishedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation("Event {EventId} updated by user {UserId}", id, userId);

        return await GetEventByIdForManagement(id);
    }

    public async Task<bool> DeleteEventAsync(int id, int userId, bool isAdmin)
    {
        var eventEntity = await _context.Events
            .Include(e => e.Registrations)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (eventEntity == null)
        {
            return false;
        }

        // Check ownership (non-admins can only delete their own events)
        if (!isAdmin && eventEntity.CreatedById != userId)
        {
            throw new UnauthorizedAccessException("You can only delete your own events");
        }

        // Check if there are registrations
        var registrationCount = eventEntity.Registrations.Count;
        if (registrationCount > 0)
        {
            _logger.LogWarning("Deleting event {EventId} with {Count} registrations", id, registrationCount);
        }

        _context.Events.Remove(eventEntity);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Event {EventId} deleted by user {UserId}", id, userId);

        return true;
    }

    public async Task<PaginatedResult<EventSummaryDto>> GetPendingEventsAsync(int page, int pageSize)
    {
        if (page < 1) page = 1;
        if (pageSize < 1 || pageSize > 50) pageSize = 10;

        var query = _context.Events
            .Include(e => e.Category)
            .Include(e => e.Registrations)
            .Where(e => e.Status == ContentStatus.PendingReview);

        var totalCount = await query.CountAsync();

        var events = await query
            .OrderBy(e => e.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        // Map to DTOs after materialization
        var eventDtos = events.Select(e => MapToSummaryDto(e)).ToList();

        return new PaginatedResult<EventSummaryDto>
        {
            Items = eventDtos,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<EventDto> ApproveEventAsync(int id, int adminId)
    {
        var eventEntity = await _context.Events
            .Include(e => e.CreatedBy)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (eventEntity == null)
        {
            throw new KeyNotFoundException($"Event with ID {id} not found");
        }

        if (eventEntity.Status != ContentStatus.PendingReview)
        {
            throw new InvalidOperationException("Only pending events can be approved");
        }

        eventEntity.Status = ContentStatus.Published;
        eventEntity.PublishedAt = DateTime.UtcNow;
        eventEntity.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Event {EventId} approved by admin {AdminId}", id, adminId);

        // Send approval notification to creator
        await SendEventApprovedNotificationAsync(id, eventEntity.CreatedById);

        return await GetEventByIdForManagement(id);
    }

    public async Task<bool> RejectEventAsync(int id, int adminId, string reason)
    {
        var eventEntity = await _context.Events
            .Include(e => e.CreatedBy)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (eventEntity == null)
        {
            return false;
        }

        if (eventEntity.Status != ContentStatus.PendingReview)
        {
            throw new InvalidOperationException("Only pending events can be rejected");
        }

        var creatorEmail = eventEntity.CreatedBy.Email;
        var creatorName = $"{eventEntity.CreatedBy.FirstName} {eventEntity.CreatedBy.LastName}";
        var eventTitle = eventEntity.Title;

        _context.Events.Remove(eventEntity);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Event {EventId} rejected by admin {AdminId}. Reason: {Reason}", 
            id, adminId, reason);

        // Send rejection notification
        await SendEventRejectedNotificationAsync(creatorEmail, creatorName, eventTitle, reason);

        return true;
    }

    public async Task<List<EventCategoryDto>> GetCategoriesAsync()
    {
        return await _context.EventCategories
            .OrderBy(c => c.Name)
            .Select(c => new EventCategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Slug = c.Slug,
                Description = c.Description
            })
            .ToListAsync();
    }

    // Helper methods

    private async Task<EventDto> GetEventByIdForManagement(int id)
    {
        var eventEntity = await _context.Events
            .Include(e => e.Category)
            .Include(e => e.CreatedBy)
                .ThenInclude(u => u.AlumniProfile)
            .Include(e => e.Registrations)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (eventEntity == null)
        {
            throw new KeyNotFoundException($"Event with ID {id} not found");
        }

        return MapToDto(eventEntity);
    }

    private EventDto MapToDto(Event eventEntity)
    {
        var registrationCount = eventEntity.Registrations.Count(r => r.Status == RegistrationStatus.Confirmed);
        var availableSpots = eventEntity.Capacity.HasValue ? eventEntity.Capacity.Value - registrationCount : (int?)null;

        return new EventDto
        {
            Id = eventEntity.Id,
            Title = eventEntity.Title,
            Slug = eventEntity.Slug,
            Description = eventEntity.Description,
            Category = eventEntity.Category != null ? new EventCategoryDto
            {
                Id = eventEntity.Category.Id,
                Name = eventEntity.Category.Name,
                Slug = eventEntity.Category.Slug,
                Description = eventEntity.Category.Description
            } : null,
            Location = eventEntity.Location,
            EventDate = eventEntity.EventDate,
            EventEndDate = eventEntity.EventEndDate,
            ImageUrl = _urlHelperService.GetAbsoluteUrl(eventEntity.ImageUrl),
            ThumbnailUrl = _urlHelperService.GetAbsoluteUrl(eventEntity.ThumbnailUrl),
            Capacity = eventEntity.Capacity,
            RegistrationDeadline = eventEntity.RegistrationDeadline,
            CreatedBy = new AuthorDto
            {
                Id = eventEntity.CreatedBy.Id,
                FirstName = eventEntity.CreatedBy.FirstName,
                LastName = eventEntity.CreatedBy.LastName,
                ProfileImageUrl = _urlHelperService.GetAbsoluteUrl(eventEntity.CreatedBy.AlumniProfile?.ProfileImageUrl)
            },
            Status = eventEntity.Status,
            PublishedAt = eventEntity.PublishedAt,
            CreatedAt = eventEntity.CreatedAt,
            UpdatedAt = eventEntity.UpdatedAt,
            RegistrationCount = registrationCount,
            AvailableSpots = availableSpots
        };
    }

    private EventSummaryDto MapToSummaryDto(Event eventEntity)
    {
        var registrationCount = eventEntity.Registrations.Count(r => r.Status == RegistrationStatus.Confirmed);
        var availableSpots = eventEntity.Capacity.HasValue ? eventEntity.Capacity.Value - registrationCount : (int?)null;

        return new EventSummaryDto
        {
            Id = eventEntity.Id,
            Title = eventEntity.Title,
            Slug = eventEntity.Slug,
            Category = eventEntity.Category != null ? new EventCategoryDto
            {
                Id = eventEntity.Category.Id,
                Name = eventEntity.Category.Name,
                Slug = eventEntity.Category.Slug,
                Description = eventEntity.Category.Description
            } : null,
            Location = eventEntity.Location,
            EventDate = eventEntity.EventDate,
            EventEndDate = eventEntity.EventEndDate,
            ThumbnailUrl = _urlHelperService.GetAbsoluteUrl(eventEntity.ThumbnailUrl),
            Capacity = eventEntity.Capacity,
            Status = eventEntity.Status,
            PublishedAt = eventEntity.PublishedAt,
            RegistrationCount = registrationCount,
            AvailableSpots = availableSpots
        };
    }

    private async Task SendEventSubmittedNotificationAsync(int eventId)
    {
        try
        {
            var eventEntity = await _context.Events.FindAsync(eventId);
            var eventTitle = eventEntity?.Title ?? "New Submitted Event";

            var adminEmails = await _context.UserRoles
                .Include(ur => ur.User)
                .Include(ur => ur.Role)
                .Where(ur => ur.Role.Name == "Admin")
                .Select(ur => ur.User.Email)
                .ToListAsync();

            foreach (var email in adminEmails)
            {
                await _emailService.SendEventSubmittedNotificationAsync(
                    email,
                    eventTitle,
                    eventId);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send event submitted notification for event {EventId}", eventId);
        }
    }

    private async Task SendEventApprovedNotificationAsync(int eventId, int creatorId)
    {
        try
        {
            var creator = await _context.Users.FindAsync(creatorId);
            var eventEntity = await _context.Events.FindAsync(eventId);
            if (creator != null && eventEntity != null)
            {
                await _emailService.SendEventStatusNotificationAsync(
                    creator.Email,
                    creator.FirstName,
                    eventEntity.Title,
                    "Approved");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send approval notification for event {EventId}", eventId);
        }
    }

    public async Task<List<EventSummaryDto>> GetManagementEventsAsync(int userId, bool isAdmin)
    {
        var query = _context.Events
            .Include(e => e.Category)
            .Include(e => e.Registrations)
            .AsQueryable();

        if (!isAdmin)
        {
            query = query.Where(e => e.CreatedById == userId);
        }

        var events = await query
            .OrderByDescending(e => e.CreatedAt)
            .ToListAsync();

        return events.Select(MapToSummaryDto).ToList();
    }

    private async Task SendEventRejectedNotificationAsync(string email, string name, string title, string reason)
    {
        try
        {
            await _emailService.SendEventStatusNotificationAsync(
                email,
                name,
                title,
                "Rejected",
                reason);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send rejection notification to {Email}", email);
        }
    }
}

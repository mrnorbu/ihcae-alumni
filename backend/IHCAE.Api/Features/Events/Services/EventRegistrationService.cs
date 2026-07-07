using System.Text;
using Microsoft.EntityFrameworkCore;
using IHCAE.Api.Features.Events.Models.Entities;
using IHCAE.Api.Features.Events.Models.DTOs;
using IHCAE.Api.Features.News.Models.Entities;
using IHCAE.Api.Shared.Data;
using IHCAE.Api.Shared.DTOs;
using IHCAE.Api.Shared.Services;

namespace IHCAE.Api.Features.Events.Services;

/// <summary>
/// Service implementation for event registration operations
/// </summary>
public class EventRegistrationService : IEventRegistrationService
{
    private readonly AppDbContext _context;
    private readonly ILogger<EventRegistrationService> _logger;
    private readonly IEmailService _emailService;

    public EventRegistrationService(AppDbContext context, ILogger<EventRegistrationService> logger, IEmailService emailService)
    {
        _context = context;
        _logger = logger;
        _emailService = emailService;
    }

    public async Task<EventRegistrationDto> RegisterForEventAsync(int eventId, RegisterForEventRequest request, int? userId)
    {
        var eventEntity = await _context.Events
            .Include(e => e.Registrations)
            .FirstOrDefaultAsync(e => e.Id == eventId && e.Status == ContentStatus.Published);

        if (eventEntity == null)
        {
            throw new KeyNotFoundException($"Event with ID {eventId} not found");
        }

        // Check if event date has passed
        if (eventEntity.EventDate < DateTime.UtcNow)
        {
            throw new InvalidOperationException("Cannot register for past events");
        }

        // Check registration deadline
        if (eventEntity.RegistrationDeadline.HasValue && eventEntity.RegistrationDeadline.Value < DateTime.UtcNow)
        {
            throw new InvalidOperationException("Registration deadline has passed");
        }

        // Check for duplicate registration (case-insensitive email)
        var existingRegistration = await _context.EventRegistrations
            .FirstOrDefaultAsync(r => r.EventId == eventId && r.Email.ToLower() == request.Email.ToLower());

        if (existingRegistration != null)
        {
            throw new InvalidOperationException("This email is already registered for this event");
        }

        // Check capacity
        var confirmedCount = eventEntity.Registrations.Count(r => r.Status == RegistrationStatus.Confirmed);
        if (eventEntity.Capacity.HasValue && confirmedCount >= eventEntity.Capacity.Value)
        {
            throw new InvalidOperationException("Event is at full capacity");
        }

        var registration = new EventRegistration
        {
            
            EventId = eventId,
            UserId = userId,
            Name = request.Name,
            Email = request.Email,
            Phone = request.Phone,
            RegistrationDate = DateTime.UtcNow,
            Status = RegistrationStatus.Confirmed
        };

        _context.EventRegistrations.Add(registration);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Registration {RegistrationId} created for event {EventId} by {Email}", 
            registration.Id, eventId, request.Email);

        // Send confirmation email
        await SendRegistrationConfirmationAsync(registration.Id, eventEntity.Title);

        return MapToDto(registration);
    }

    public async Task<bool> CheckIfRegisteredAsync(int eventId, string email)
    {
        return await _context.EventRegistrations
            .AnyAsync(r => r.EventId == eventId && r.Email.ToLower() == email.ToLower());
    }

    public async Task<int> GetAvailableSpotsAsync(int eventId)
    {
        var eventEntity = await _context.Events
            .Include(e => e.Registrations)
            .FirstOrDefaultAsync(e => e.Id == eventId);

        if (eventEntity == null)
        {
            throw new KeyNotFoundException($"Event with ID {eventId} not found");
        }

        if (!eventEntity.Capacity.HasValue)
        {
            return int.MaxValue; // Unlimited capacity
        }

        var confirmedCount = eventEntity.Registrations.Count(r => r.Status == RegistrationStatus.Confirmed);
        return Math.Max(0, eventEntity.Capacity.Value - confirmedCount);
    }

    public async Task<PaginatedResult<EventRegistrationDto>> GetEventRegistrationsAsync(int eventId, int page, int pageSize)
    {
        if (page < 1) page = 1;
        if (pageSize < 1 || pageSize > 100) pageSize = 20;

        var query = _context.EventRegistrations
            .Where(r => r.EventId == eventId);

        var totalCount = await query.CountAsync();

        var registrations = await query
            .OrderBy(r => r.RegistrationDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        // Map to DTOs after materialization
        var registrationDtos = registrations.Select(r => MapToDto(r)).ToList();

        return new PaginatedResult<EventRegistrationDto>
        {
            Items = registrationDtos,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<byte[]> ExportRegistrationsToCsvAsync(int eventId)
    {
        var registrations = await _context.EventRegistrations
            .Where(r => r.EventId == eventId)
            .OrderBy(r => r.RegistrationDate)
            .ToListAsync();

        var csv = new StringBuilder();
        
        // CSV Header
        csv.AppendLine("Name,Email,Phone,Registration Date,Status,User Type");

        // CSV Rows
        foreach (var registration in registrations)
        {
            var userType = registration.UserId.HasValue ? "Member" : "Visitor";
            csv.AppendLine($"\"{registration.Name}\",\"{registration.Email}\",\"{registration.Phone ?? ""}\",\"{registration.RegistrationDate:yyyy-MM-dd HH:mm:ss}\",\"{registration.Status}\",\"{userType}\"");
        }

        _logger.LogInformation("Exported {Count} registrations for event {EventId}", registrations.Count, eventId);

        return Encoding.UTF8.GetBytes(csv.ToString());
    }

    public async Task<bool> CancelRegistrationAsync(int registrationId, int adminId)
    {
        var registration = await _context.EventRegistrations.FindAsync(registrationId);

        if (registration == null)
        {
            return false;
        }

        registration.Status = RegistrationStatus.Cancelled;
        await _context.SaveChangesAsync();

        _logger.LogInformation("Registration {RegistrationId} cancelled by admin {AdminId}", registrationId, adminId);

        return true;
    }

    // Helper methods

    private EventRegistrationDto MapToDto(EventRegistration registration)
    {
        return new EventRegistrationDto
        {
            Id = registration.Id,
            EventId = registration.EventId,
            UserId = registration.UserId,
            Name = registration.Name,
            Email = registration.Email,
            Phone = registration.Phone,
            RegistrationDate = registration.RegistrationDate,
            Status = registration.Status,
            IsAuthenticatedUser = registration.UserId.HasValue
        };
    }

    private async Task SendRegistrationConfirmationAsync(int registrationId, string eventTitle)
    {
        try
        {
            var registration = await _context.EventRegistrations.FindAsync(registrationId);
            if (registration != null)
            {
                await _emailService.SendEventRegistrationConfirmationAsync(
                    registration.Email,
                    registration.Name,
                    eventTitle);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send registration confirmation for registration {RegistrationId}", registrationId);
        }
    }
}

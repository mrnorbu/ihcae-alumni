# Design Document - News, Events & Success Stories Management

## Overview

This design document outlines the technical implementation for the News, Events & Success Stories management feature. The system follows the existing feature-based architecture pattern used in the IHCAE Alumni Network Application, providing a comprehensive content management system with role-based access control, event registration capabilities, and alumni success story submissions.

### Key Features

- News article creation and management with categories
- Event creation with registration system
- Alumni success story submission workflow
- Role-based content creation (Admin and Content Creator roles)
- Public viewing of news, events, and success stories
- Event capacity management and registration tracking
- CSV export for event registrations
- Image upload and management for content
- Search and filtering capabilities

## Architecture

### Feature-Based Structure

Following the existing pattern, the implementation will be organized as:

```
backend/IHCAE.Api/Features/
├── News/
│   ├── Controllers/
│   │   ├── NewsController.cs              # Public news viewing
│   │   └── NewsManagementController.cs    # Admin/Content Creator management
│   ├── Services/
│   │   ├── INewsService.cs
│   │   └── NewsService.cs
│   └── Models/
│       ├── Entities/
│       │   ├── NewsArticle.cs
│       │   └── NewsCategory.cs
│       └── DTOs/
│           ├── NewsArticleDto.cs
│           ├── NewsArticleSummaryDto.cs
│           ├── CreateNewsArticleRequest.cs
│           └── UpdateNewsArticleRequest.cs
│
├── Events/
│   ├── Controllers/
│   │   ├── EventsController.cs            # Public events viewing & registration
│   │   └── EventManagementController.cs   # Admin/Content Creator management
│   ├── Services/
│   │   ├── IEventService.cs
│   │   ├── EventService.cs
│   │   ├── IEventRegistrationService.cs
│   │   └── EventRegistrationService.cs
│   └── Models/
│       ├── Entities/
│       │   ├── Event.cs
│       │   ├── EventCategory.cs
│       │   └── EventRegistration.cs
│       └── DTOs/
│           ├── EventDto.cs
│           ├── EventSummaryDto.cs
│           ├── CreateEventRequest.cs
│           ├── UpdateEventRequest.cs
│           ├── EventRegistrationDto.cs
│           └── RegisterForEventRequest.cs
│
frontend/src/app/features/
├── news/
│   ├── containers/
│   │   ├── news-list/
│   │   ├── news-detail/
│   │   ├── success-stories/
│   │   └── submit-success-story/
│   ├── components/
│   │   ├── news-card/
│   │   ├── news-filters/
│   │   └── success-story-card/
│   └── services/
│       └── news.service.ts
│
├── events/
│   ├── containers/
│   │   ├── events-list/
│   │   ├── event-detail/
│   │   └── event-registration/
│   ├── components/
│   │   ├── event-card/
│   │   ├── event-filters/
│   │   └── registration-form/
│   └── services/
│       └── events.service.ts
│
└── admin/
    └── content-management/
        ├── news-management/
        ├── event-management/
        └── pending-content-review/
```

## Data Models

### Database Schema

#### NewsArticles Table

```sql
CREATE TABLE NewsArticles (
    Id CHAR(36) PRIMARY KEY,
    Title VARCHAR(255) NOT NULL,
    Content TEXT NOT NULL,
    Excerpt VARCHAR(500),
    CategoryId CHAR(36) NOT NULL,
    AuthorId CHAR(36) NOT NULL,
    ImageUrl VARCHAR(1024),
    ThumbnailUrl VARCHAR(1024),
    Status ENUM('draft', 'pending_review', 'published') NOT NULL DEFAULT 'draft',
    PublishedAt DATETIME(6),
    CreatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    UpdatedAt DATETIME(6),
    ViewCount INT DEFAULT 0,
    FOREIGN KEY (CategoryId) REFERENCES NewsCategories(Id),
    FOREIGN KEY (AuthorId) REFERENCES Users(Id) ON DELETE CASCADE,
    INDEX idx_status (Status),
    INDEX idx_category (CategoryId),
    INDEX idx_published_at (PublishedAt),
    INDEX idx_author (AuthorId)
);
```

#### NewsCategories Table

```sql
CREATE TABLE NewsCategories (
    Id CHAR(36) PRIMARY KEY,
    Name VARCHAR(100) NOT NULL UNIQUE,
    Slug VARCHAR(100) NOT NULL UNIQUE,
    Description VARCHAR(255),
    CreatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    INDEX idx_slug (Slug)
);
```

#### Events Table

```sql
CREATE TABLE Events (
    Id CHAR(36) PRIMARY KEY,
    Title VARCHAR(255) NOT NULL,
    Description TEXT NOT NULL,
    CategoryId CHAR(36),
    Location VARCHAR(255) NOT NULL,
    EventDate DATETIME(6) NOT NULL,
    EventEndDate DATETIME(6),
    ImageUrl VARCHAR(1024),
    ThumbnailUrl VARCHAR(1024),
    Capacity INT,
    RegistrationDeadline DATETIME(6),
    CreatedById CHAR(36) NOT NULL,
    Status ENUM('draft', 'pending_review', 'published') NOT NULL DEFAULT 'draft',
    PublishedAt DATETIME(6),
    CreatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    UpdatedAt DATETIME(6),
    FOREIGN KEY (CategoryId) REFERENCES EventCategories(Id),
    FOREIGN KEY (CreatedById) REFERENCES Users(Id) ON DELETE CASCADE,
    INDEX idx_status (Status),
    INDEX idx_event_date (EventDate),
    INDEX idx_category (CategoryId),
    INDEX idx_created_by (CreatedById)
);
```

#### EventCategories Table

```sql
CREATE TABLE EventCategories (
    Id CHAR(36) PRIMARY KEY,
    Name VARCHAR(100) NOT NULL UNIQUE,
    Slug VARCHAR(100) NOT NULL UNIQUE,
    Description VARCHAR(255),
    CreatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    INDEX idx_slug (Slug)
);
```

#### EventRegistrations Table

```sql
CREATE TABLE EventRegistrations (
    Id CHAR(36) PRIMARY KEY,
    EventId CHAR(36) NOT NULL,
    UserId CHAR(36),  -- NULL for public registrations
    Name VARCHAR(200) NOT NULL,
    Email VARCHAR(255) NOT NULL,
    Phone VARCHAR(50),
    RegistrationDate DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    Status ENUM('confirmed', 'cancelled', 'waitlist') NOT NULL DEFAULT 'confirmed',
    FOREIGN KEY (EventId) REFERENCES Events(Id) ON DELETE CASCADE,
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE SET NULL,
    UNIQUE KEY unique_email_per_event (EventId, Email),
    INDEX idx_event (EventId),
    INDEX idx_user (UserId),
    INDEX idx_email (Email),
    INDEX idx_status (Status)
);
```

### Entity Models

#### NewsArticle.cs

```csharp
public class NewsArticle
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string? Excerpt { get; set; }
    public Guid CategoryId { get; set; }
    public Guid AuthorId { get; set; }
    public string? ImageUrl { get; set; }
    public string? ThumbnailUrl { get; set; }
    public ContentStatus Status { get; set; }
    public DateTime? PublishedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public int ViewCount { get; set; }
    
    // Navigation properties
    public NewsCategory Category { get; set; } = null!;
    public User Author { get; set; } = null!;
}

public enum ContentStatus
{
    Draft,
    PendingReview,
    Published
}
```

#### Event.cs

```csharp
public class Event
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public Guid? CategoryId { get; set; }
    public string Location { get; set; } = string.Empty;
    public DateTime EventDate { get; set; }
    public DateTime? EventEndDate { get; set; }
    public string? ImageUrl { get; set; }
    public string? ThumbnailUrl { get; set; }
    public int? Capacity { get; set; }
    public DateTime? RegistrationDeadline { get; set; }
    public Guid CreatedById { get; set; }
    public ContentStatus Status { get; set; }
    public DateTime? PublishedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    
    // Navigation properties
    public EventCategory? Category { get; set; }
    public User CreatedBy { get; set; } = null!;
    public ICollection<EventRegistration> Registrations { get; set; } = new List<EventRegistration>();
}
```

#### EventRegistration.cs

```csharp
public class EventRegistration
{
    public Guid Id { get; set; }
    public Guid EventId { get; set; }
    public Guid? UserId { get; set; }  // NULL for public registrations
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public DateTime RegistrationDate { get; set; }
    public RegistrationStatus Status { get; set; }
    
    // Navigation properties
    public Event Event { get; set; } = null!;
    public User? User { get; set; }
}

public enum RegistrationStatus
{
    Confirmed,
    Cancelled,
    Waitlist
}
```

## Components and Interfaces

### Backend Services

#### INewsService

```csharp
public interface INewsService
{
    // Public viewing
    Task<PaginatedResult<NewsArticleSummaryDto>> GetPublishedArticlesAsync(
        int page, int pageSize, Guid? categoryId, string? search);
    Task<NewsArticleDto> GetArticleByIdAsync(Guid id);
    Task<PaginatedResult<NewsArticleSummaryDto>> GetSuccessStoriesAsync(int page, int pageSize);
    
    // Content creation (Admin/Content Creator)
    Task<NewsArticleDto> CreateArticleAsync(Guid authorId, CreateNewsArticleRequest request);
    Task<NewsArticleDto> UpdateArticleAsync(Guid id, Guid userId, UpdateNewsArticleRequest request);
    Task<bool> DeleteArticleAsync(Guid id, Guid userId);
    
    // Admin operations
    Task<PaginatedResult<NewsArticleSummaryDto>> GetPendingArticlesAsync(int page, int pageSize);
    Task<NewsArticleDto> ApproveArticleAsync(Guid id, Guid adminId);
    Task<bool> RejectArticleAsync(Guid id, Guid adminId, string reason);
    
    // Success story submission (Alumni)
    Task<NewsArticleDto> SubmitSuccessStoryAsync(Guid alumniId, CreateSuccessStoryRequest request);
    
    // Categories
    Task<List<NewsCategoryDto>> GetCategoriesAsync();
}
```

#### IEventService

```csharp
public interface IEventService
{
    // Public viewing
    Task<PaginatedResult<EventSummaryDto>> GetUpcomingEventsAsync(
        int page, int pageSize, Guid? categoryId, string? location, DateTime? startDate, DateTime? endDate);
    Task<EventDto> GetEventByIdAsync(Guid id);
    
    // Content creation (Admin/Content Creator)
    Task<EventDto> CreateEventAsync(Guid creatorId, CreateEventRequest request);
    Task<EventDto> UpdateEventAsync(Guid id, Guid userId, UpdateEventRequest request);
    Task<bool> DeleteEventAsync(Guid id, Guid userId);
    
    // Admin operations
    Task<PaginatedResult<EventSummaryDto>> GetPendingEventsAsync(int page, int pageSize);
    Task<EventDto> ApproveEventAsync(Guid id, Guid adminId);
    Task<bool> RejectEventAsync(Guid id, Guid adminId, string reason);
    
    // Categories
    Task<List<EventCategoryDto>> GetCategoriesAsync();
}
```

#### IEventRegistrationService

```csharp
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
```

### Frontend Services

#### news.service.ts

```typescript
export class NewsService {
  // Public APIs
  getPublishedArticles(page: number, pageSize: number, categoryId?: string, search?: string): Observable<PaginatedResult<NewsArticleSummary>>;
  getArticleById(id: string): Observable<NewsArticle>;
  getSuccessStories(page: number, pageSize: number): Observable<PaginatedResult<NewsArticleSummary>>;
  getCategories(): Observable<NewsCategory[]>;
  
  // Content Creator/Admin APIs
  createArticle(request: CreateNewsArticleRequest): Observable<NewsArticle>;
  updateArticle(id: string, request: UpdateNewsArticleRequest): Observable<NewsArticle>;
  deleteArticle(id: string): Observable<boolean>;
  
  // Alumni APIs
  submitSuccessStory(request: CreateSuccessStoryRequest): Observable<NewsArticle>;
  
  // Admin APIs
  getPendingArticles(page: number, pageSize: number): Observable<PaginatedResult<NewsArticleSummary>>;
  approveArticle(id: string): Observable<NewsArticle>;
  rejectArticle(id: string, reason: string): Observable<boolean>;
}
```

#### events.service.ts

```typescript
export class EventsService {
  // Public APIs
  getUpcomingEvents(page: number, pageSize: number, filters?: EventFilters): Observable<PaginatedResult<EventSummary>>;
  getEventById(id: string): Observable<Event>;
  registerForEvent(eventId: string, request: RegisterForEventRequest): Observable<EventRegistration>;
  checkIfRegistered(eventId: string, email: string): Observable<boolean>;
  getAvailableSpots(eventId: string): Observable<number>;
  getCategories(): Observable<EventCategory[]>;
  
  // Content Creator/Admin APIs
  createEvent(request: CreateEventRequest): Observable<Event>;
  updateEvent(id: string, request: UpdateEventRequest): Observable<Event>;
  deleteEvent(id: string): Observable<boolean>;
  
  // Admin APIs
  getPendingEvents(page: number, pageSize: number): Observable<PaginatedResult<EventSummary>>;
  approveEvent(id: string): Observable<Event>;
  rejectEvent(id: string, reason: string): Observable<boolean>;
  getEventRegistrations(eventId: string, page: number, pageSize: number): Observable<PaginatedResult<EventRegistration>>;
  exportRegistrationsCsv(eventId: string): Observable<Blob>;
}
```

## API Endpoints

### News Management

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/v1/news` | No | - | Get published news articles (paginated) |
| GET | `/api/v1/news/{id}` | No | - | Get single news article |
| GET | `/api/v1/news/success-stories` | No | - | Get success stories |
| GET | `/api/v1/news/categories` | No | - | Get news categories |
| POST | `/api/v1/news/management` | Yes | Admin/ContentCreator | Create news article |
| PUT | `/api/v1/news/management/{id}` | Yes | Admin/ContentCreator | Update news article |
| DELETE | `/api/v1/news/management/{id}` | Yes | Admin/ContentCreator | Delete news article |
| GET | `/api/v1/news/management/pending` | Yes | Admin | Get pending articles |
| POST | `/api/v1/news/management/{id}/approve` | Yes | Admin | Approve article |
| POST | `/api/v1/news/management/{id}/reject` | Yes | Admin | Reject article |
| POST | `/api/v1/news/success-story` | Yes | Alumni | Submit success story |

### Events Management

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/v1/events` | No | - | Get upcoming events (paginated) |
| GET | `/api/v1/events/{id}` | No | - | Get single event |
| GET | `/api/v1/events/categories` | No | - | Get event categories |
| POST | `/api/v1/events/{id}/register` | No | - | Register for event |
| GET | `/api/v1/events/{id}/check-registration` | No | - | Check if email is registered |
| GET | `/api/v1/events/{id}/available-spots` | No | - | Get available spots |
| POST | `/api/v1/events/management` | Yes | Admin/ContentCreator | Create event |
| PUT | `/api/v1/events/management/{id}` | Yes | Admin/ContentCreator | Update event |
| DELETE | `/api/v1/events/management/{id}` | Yes | Admin/ContentCreator | Delete event |
| GET | `/api/v1/events/management/pending` | Yes | Admin | Get pending events |
| POST | `/api/v1/events/management/{id}/approve` | Yes | Admin | Approve event |
| POST | `/api/v1/events/management/{id}/reject` | Yes | Admin | Reject event |
| GET | `/api/v1/events/{id}/registrations` | Yes | Admin | Get event registrations |
| GET | `/api/v1/events/{id}/registrations/export` | Yes | Admin | Export registrations CSV |

## Authorization Strategy

### Role Hierarchy

```
Admin
  ├── Full access to all content management
  ├── Approve/reject pending content
  ├── Assign Content Creator role
  └── View all registrations and analytics

Content Creator (subset of Alumni)
  ├── Create news articles (pending review)
  ├── Create events (pending review)
  ├── Edit own content
  └── View own content analytics

Alumni
  ├── Submit success stories (pending review)
  ├── Register for events
  └── View all published content

Member/Visitor
  ├── View published content
  └── Register for events
```

### Authorization Implementation

```csharp
// Custom authorization attribute
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class RequireRoleAttribute : AuthorizeAttribute
{
    public RequireRoleAttribute(params string[] roles)
    {
        Roles = string.Join(",", roles);
    }
}

// Usage in controllers
[RequireRole("Admin", "ContentCreator")]
public async Task<IActionResult> CreateArticle([FromBody] CreateNewsArticleRequest request)
{
    // Implementation
}
```

## Error Handling

### Standard Error Responses

```csharp
public class ContentErrorResponse : ErrorResponse
{
    public string ErrorCode { get; set; }
    public Dictionary<string, string[]>? ValidationErrors { get; set; }
}

// Error codes
public static class ContentErrorCodes
{
    public const string ArticleNotFound = "ARTICLE_NOT_FOUND";
    public const string EventNotFound = "EVENT_NOT_FOUND";
    public const string EventFull = "EVENT_FULL";
    public const string AlreadyRegistered = "ALREADY_REGISTERED";
    public const string RegistrationClosed = "REGISTRATION_CLOSED";
    public const string UnauthorizedAccess = "UNAUTHORIZED_ACCESS";
    public const string InvalidStatus = "INVALID_STATUS";
}
```

## Testing Strategy

### Unit Tests

- Service layer business logic
- Authorization rules
- Data validation
- Status transitions (draft → pending → published)
- Capacity calculations
- Duplicate registration prevention

### Integration Tests

- API endpoint responses
- Database operations
- File upload functionality
- Email notifications
- CSV export generation
- Role-based access control

### API Testing Approach

After implementing each controller:
1. Test all endpoints using Swagger UI or HTTP client
2. Verify authentication and authorization
3. Test validation rules
4. Test error scenarios
5. Verify database state changes
6. Test pagination and filtering
7. Verify email notifications are sent

## Image Management

### File Upload Strategy

Reuse existing `FileUploadService` from the Shared services:

```csharp
public interface IFileUploadService
{
    Task<string> UploadImageAsync(IFormFile file, string folder);
    Task<string> UploadAndCreateThumbnailAsync(IFormFile file, string folder, int thumbnailWidth = 300);
    Task<bool> DeleteImageAsync(string imageUrl);
}
```

### Image Storage Structure

```
wwwroot/uploads/
├── news/
│   ├── {guid}.jpg
│   └── thumbnails/
│       └── {guid}_thumb.jpg
└── events/
    ├── {guid}.jpg
    └── thumbnails/
        └── {guid}_thumb.jpg
```

## Email Notifications

### Notification Events

1. **Success Story Submitted** → Admin notification
2. **Success Story Approved** → Alumni confirmation
3. **Success Story Rejected** → Alumni notification with reason
4. **Event Registration Confirmed** → Registrant confirmation
5. **Content Creator Article Submitted** → Admin notification
6. **Content Creator Article Approved** → Content Creator confirmation

### Email Templates

```csharp
public interface IContentNotificationService
{
    Task SendSuccessStorySubmittedNotificationAsync(Guid articleId);
    Task SendSuccessStoryApprovedNotificationAsync(Guid articleId, Guid alumniId);
    Task SendSuccessStoryRejectedNotificationAsync(Guid alumniId, string reason);
    Task SendEventRegistrationConfirmationAsync(Guid registrationId);
    Task SendContentSubmittedNotificationAsync(Guid contentId, string contentType);
    Task SendContentApprovedNotificationAsync(Guid contentId, Guid creatorId);
}
```

## Performance Considerations

### Database Indexes

- Index on `Status` for filtering published content
- Index on `PublishedAt` for sorting
- Index on `CategoryId` for category filtering
- Index on `EventDate` for upcoming events queries
- Composite index on `(EventId, Email)` for duplicate registration checks

### Caching Strategy

```csharp
// Cache published articles list for 5 minutes
[ResponseCache(Duration = 300, VaryByQueryKeys = new[] { "page", "pageSize", "categoryId" })]
public async Task<IActionResult> GetPublishedArticles(...)

// Cache categories for 1 hour
[ResponseCache(Duration = 3600)]
public async Task<IActionResult> GetCategories()
```

### Pagination

- Default page size: 10 items
- Maximum page size: 50 items
- Use offset-based pagination for simplicity
- Consider cursor-based pagination for large datasets in future

## Migration Strategy

### Database Migration Steps

1. Create NewsCategories and EventCategories tables
2. Seed default categories
3. Create NewsArticles table
4. Create Events table
5. Create EventRegistrations table
6. Add Content Creator role to Roles table
7. Create indexes for performance

### Seed Data

```csharp
// Default news categories
- General News
- Announcement
- Success Story
- Achievement
- Alumni Spotlight

// Default event categories
- Workshop
- Seminar
- Networking
- Training
- Social Event
```

## Security Considerations

### Input Validation

- Sanitize HTML content to prevent XSS
- Validate image file types and sizes
- Validate email formats
- Validate date ranges for events
- Validate capacity limits

### Authorization Checks

- Verify user has appropriate role before content creation
- Verify ownership before editing/deleting content
- Verify admin role for approval/rejection operations
- Prevent status manipulation by non-admins

### Data Protection

- Don't expose draft content in public APIs
- Protect pending review content from public access
- Validate event capacity before accepting registrations
- Prevent SQL injection through parameterized queries

## Future Enhancements

1. **Rich Text Editor** - WYSIWYG editor for content creation
2. **Content Scheduling** - Schedule articles/events for future publication
3. **Analytics Dashboard** - View counts, engagement metrics
4. **Email Campaigns** - Send newsletters to registered users
5. **Event Reminders** - Automated reminders before events
6. **Waitlist Management** - Automatic promotion from waitlist
7. **Social Sharing** - Share buttons for articles and events
8. **Comments System** - Allow comments on news articles
9. **Content Versioning** - Track changes to articles/events
10. **Multi-language Support** - Internationalization for content

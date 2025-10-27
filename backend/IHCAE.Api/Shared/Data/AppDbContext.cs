using Microsoft.EntityFrameworkCore;
using IHCAE.Api.Features.Auth.Models.Entities;
using IHCAE.Api.Features.Alumni.Models.Entities;
using IHCAE.Api.Features.EmailVerification.Models.Entities;
using IHCAE.Api.Features.PasswordReset.Models.Entities;
using IHCAE.Api.Features.Forums.Models.Entities;
using IHCAE.Api.Features.News.Models.Entities;
using IHCAE.Api.Features.Events.Models.Entities;
using IHCAE.Api.Shared.Models;

namespace IHCAE.Api.Shared.Data;

/// <summary>
/// Entity Framework DbContext for the IHCAE Alumni Network application.
/// This class manages all database operations and entity relationships.
/// </summary>
public class AppDbContext : DbContext
{
    /// <summary>
    /// Initializes a new instance of the AppDbContext.
    /// </summary>
    /// <param name="options">Database context options</param>
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    // DbSets for all entities
    /// <summary>
    /// Users table - central entity for authentication and identity
    /// </summary>
    public DbSet<User> Users { get; set; } = null!;

    /// <summary>
    /// Roles table - lookup table for user roles
    /// </summary>
    public DbSet<Role> Roles { get; set; } = null!;

    /// <summary>
    /// UserRoles table - many-to-many relationship between users and roles
    /// </summary>
    public DbSet<UserRole> UserRoles { get; set; } = null!;

    /// <summary>
    /// AlumniProfiles table - extended profile information for alumni
    /// </summary>
    public DbSet<AlumniProfile> AlumniProfiles { get; set; } = null!;

    /// <summary>
    /// AlumniDatabase table - imported alumni data for auto-approval matching
    /// </summary>
    public DbSet<AlumniDatabase> AlumniDatabase { get; set; } = null!;

    /// <summary>
    /// UserRefreshTokens table - JWT refresh tokens for authentication
    /// </summary>
    public DbSet<UserRefreshToken> UserRefreshTokens { get; set; } = null!;

    /// <summary>
    /// EmailVerificationTokens table - tokens for email verification
    /// </summary>
    public DbSet<EmailVerificationToken> EmailVerificationTokens { get; set; } = null!;

    /// <summary>
    /// PasswordResetTokens table - tokens for password reset functionality
    /// </summary>
    public DbSet<PasswordResetToken> PasswordResetTokens { get; set; } = null!;

    /// <summary>
    /// DiscussionTopics table - forum discussion threads
    /// </summary>
    public DbSet<DiscussionTopic> DiscussionTopics { get; set; } = null!;

    /// <summary>
    /// ForumPosts table - individual posts and replies within topics
    /// </summary>
    public DbSet<ForumPost> ForumPosts { get; set; } = null!;

    /// <summary>
    /// PostLikes table - likes on forum posts
    /// </summary>
    public DbSet<PostLike> PostLikes { get; set; } = null!;

    /// <summary>
    /// Tags table - shared tags across all content types
    /// </summary>
    public DbSet<Tag> Tags { get; set; } = null!;

    /// <summary>
    /// DiscussionTopicTags table - many-to-many relationship between topics and tags
    /// </summary>
    public DbSet<DiscussionTopicTag> DiscussionTopicTags { get; set; } = null!;

    /// <summary>
    /// NewsCategories table - categories for news articles
    /// </summary>
    public DbSet<NewsCategory> NewsCategories { get; set; } = null!;

    /// <summary>
    /// NewsArticles table - news articles and success stories
    /// </summary>
    public DbSet<NewsArticle> NewsArticles { get; set; } = null!;

    /// <summary>
    /// EventCategories table - categories for events
    /// </summary>
    public DbSet<EventCategory> EventCategories { get; set; } = null!;

    /// <summary>
    /// Events table - events and activities
    /// </summary>
    public DbSet<Event> Events { get; set; } = null!;

    /// <summary>
    /// EventRegistrations table - registrations for events
    /// </summary>
    public DbSet<EventRegistration> EventRegistrations { get; set; } = null!;

    /// <summary>
    /// Configures entity relationships and constraints using Fluent API.
    /// This method is called when the model is being created.
    /// </summary>
    /// <param name="modelBuilder">The model builder instance</param>
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure User entity
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();
            entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
            entity.Property(e => e.PasswordHash).IsRequired().HasMaxLength(255);
            entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.LastName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Status).IsRequired();
            entity.Property(e => e.EmailVerified).HasDefaultValue(false);
            entity.Property(e => e.IsBanned).HasDefaultValue(false);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            
            // Unique constraint on email
            entity.HasIndex(e => e.Email).IsUnique();
            
            // Indexes for performance
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.EmailVerified);
            entity.HasIndex(e => e.IsBanned);
            entity.HasIndex(e => e.LastLoginAt);
        });

        // Configure Role entity
        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Description).HasMaxLength(255);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            
            // Unique constraint on role name
            entity.HasIndex(e => e.Name).IsUnique();
        });

        // Configure UserRole entity (many-to-many)
        modelBuilder.Entity<UserRole>(entity =>
        {
            entity.HasKey(e => new { e.UserId, e.RoleId });
            entity.Property(e => e.AssignedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            
            // Foreign key relationships
            entity.HasOne(e => e.User)
                  .WithMany(u => u.UserRoles)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
                  
            entity.HasOne(e => e.Role)
                  .WithMany(r => r.UserRoles)
                  .HasForeignKey(e => e.RoleId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Configure AlumniProfile entity
        modelBuilder.Entity<AlumniProfile>(entity =>
        {
            entity.HasKey(e => e.UserId);
            entity.Property(e => e.ProfileImageUrl).HasMaxLength(1024);
            entity.Property(e => e.Course).HasMaxLength(255);
            entity.Property(e => e.JobTitle).HasMaxLength(255);
            entity.Property(e => e.Location).HasMaxLength(255);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            
            // One-to-one relationship with User
            entity.HasOne(e => e.User)
                  .WithOne(u => u.AlumniProfile)
                  .HasForeignKey<AlumniProfile>(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
                  
            // Indexes for search functionality
            entity.HasIndex(e => e.Course);
            entity.HasIndex(e => e.GraduationYear);
        });

        // Configure AlumniDatabase entity
        modelBuilder.Entity<AlumniDatabase>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();
            entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.LastName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Course).HasMaxLength(255);
            entity.Property(e => e.Phone).HasMaxLength(50);
            entity.Property(e => e.Location).HasMaxLength(255);
            entity.Property(e => e.ImportedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            
            // Indexes for matching functionality
            entity.HasIndex(e => e.Email);
            entity.HasIndex(e => new { e.FirstName, e.LastName });
            entity.HasIndex(e => e.MatchedUserId);
            
            // Foreign key to matched user
            entity.HasOne(e => e.MatchedUser)
                  .WithMany()
                  .HasForeignKey(e => e.MatchedUserId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        // Configure UserRefreshToken entity
        modelBuilder.Entity<UserRefreshToken>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();
            entity.Property(e => e.TokenHash).IsRequired().HasMaxLength(255);
            entity.Property(e => e.ExpiresAt).IsRequired();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            
            // Foreign key to User
            entity.HasOne(e => e.User)
                  .WithMany(u => u.RefreshTokens)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
                  
            // Indexes for performance
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.TokenHash).IsUnique();
        });

        // Configure EmailVerificationToken entity
        modelBuilder.Entity<EmailVerificationToken>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();
            entity.Property(e => e.TokenHash).IsRequired().HasMaxLength(255);
            entity.Property(e => e.ExpiresAt).IsRequired();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            
            // Foreign key to User
            entity.HasOne(e => e.User)
                  .WithMany(u => u.EmailVerificationTokens)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
                  
            // Indexes for performance
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.TokenHash).IsUnique();
        });

        // Configure PasswordResetToken entity
        modelBuilder.Entity<PasswordResetToken>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();
            entity.Property(e => e.TokenHash).IsRequired().HasMaxLength(255);
            entity.Property(e => e.ExpiresAt).IsRequired();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            
            // Foreign key to User
            entity.HasOne(e => e.User)
                  .WithMany(u => u.PasswordResetTokens)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
                  
            // Indexes for performance
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.TokenHash).IsUnique();
        });

        // Configure DiscussionTopic entity
        modelBuilder.Entity<DiscussionTopic>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();
            entity.Property(e => e.Title).IsRequired().HasMaxLength(255);
            entity.Property(e => e.IsLocked).HasDefaultValue(false);
            entity.Property(e => e.IsPinned).HasDefaultValue(false);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP(6)");
            
            // Foreign key to User
            entity.HasOne(e => e.CreatedBy)
                  .WithMany()
                  .HasForeignKey(e => e.CreatedById)
                  .OnDelete(DeleteBehavior.Cascade);
                  
            // Indexes for performance
            entity.HasIndex(e => e.CreatedAt);
            entity.HasIndex(e => e.IsPinned);
        });

        // Configure ForumPost entity
        modelBuilder.Entity<ForumPost>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();
            entity.Property(e => e.Content).IsRequired();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP(6)");
            entity.Property(e => e.IsDeleted).HasDefaultValue(false);
            entity.Property(e => e.DeletionReason).HasMaxLength(500);
            
            // Foreign key to DiscussionTopic
            entity.HasOne(e => e.Topic)
                  .WithMany(t => t.Posts)
                  .HasForeignKey(e => e.TopicId)
                  .OnDelete(DeleteBehavior.Cascade);
                  
            // Foreign key to User (author)
            entity.HasOne(e => e.Author)
                  .WithMany()
                  .HasForeignKey(e => e.AuthorId)
                  .OnDelete(DeleteBehavior.Cascade);
                  
            // Self-referencing foreign key for parent post
            entity.HasOne(e => e.ParentPost)
                  .WithMany(p => p.Replies)
                  .HasForeignKey(e => e.ParentPostId)
                  .OnDelete(DeleteBehavior.Restrict);
                  
            // Indexes for performance
            entity.HasIndex(e => e.TopicId);
            entity.HasIndex(e => e.AuthorId);
            entity.HasIndex(e => e.ParentPostId);
            entity.HasIndex(e => e.CreatedAt);
        });

        // Configure PostLike entity
        modelBuilder.Entity<PostLike>(entity =>
        {
            entity.HasKey(e => new { e.PostId, e.UserId });
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP(6)");
            
            // Foreign key to ForumPost
            entity.HasOne(e => e.Post)
                  .WithMany(p => p.Likes)
                  .HasForeignKey(e => e.PostId)
                  .OnDelete(DeleteBehavior.Cascade);
                  
            // Foreign key to User
            entity.HasOne(e => e.User)
                  .WithMany()
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Configure Tag entity
        modelBuilder.Entity<Tag>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();
            entity.Property(e => e.Name).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Slug).IsRequired().HasMaxLength(50);
            entity.Property(e => e.UsageCount).HasDefaultValue(0);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP(6)");
            
            // Unique constraints
            entity.HasIndex(e => e.Name).IsUnique();
            entity.HasIndex(e => e.Slug).IsUnique();
            
            // Index for performance
            entity.HasIndex(e => e.UsageCount);
        });

        // Configure DiscussionTopicTag entity (join table)
        modelBuilder.Entity<DiscussionTopicTag>(entity =>
        {
            entity.HasKey(e => new { e.TopicId, e.TagId });
            
            // Foreign key to DiscussionTopic
            entity.HasOne(e => e.Topic)
                  .WithMany(t => t.TopicTags)
                  .HasForeignKey(e => e.TopicId)
                  .OnDelete(DeleteBehavior.Cascade);
                  
            // Foreign key to Tag
            entity.HasOne(e => e.Tag)
                  .WithMany()
                  .HasForeignKey(e => e.TagId)
                  .OnDelete(DeleteBehavior.Cascade);
                  
            // Index for filtering by tag
            entity.HasIndex(e => e.TagId);
        });

        // Configure NewsCategory entity
        modelBuilder.Entity<NewsCategory>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Slug).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Description).HasMaxLength(255);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP(6)");
            
            // Unique constraints
            entity.HasIndex(e => e.Name).IsUnique();
            entity.HasIndex(e => e.Slug).IsUnique();
        });

        // Configure NewsArticle entity
        modelBuilder.Entity<NewsArticle>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();
            entity.Property(e => e.Title).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Content).IsRequired();
            entity.Property(e => e.Excerpt).HasMaxLength(500);
            entity.Property(e => e.ImageUrl).HasMaxLength(1024);
            entity.Property(e => e.ThumbnailUrl).HasMaxLength(1024);
            entity.Property(e => e.Status).IsRequired();
            entity.Property(e => e.ViewCount).HasDefaultValue(0);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP(6)");
            
            // Foreign key to NewsCategory
            entity.HasOne(e => e.Category)
                  .WithMany()
                  .HasForeignKey(e => e.CategoryId)
                  .OnDelete(DeleteBehavior.Restrict);
                  
            // Foreign key to User (author)
            entity.HasOne(e => e.Author)
                  .WithMany()
                  .HasForeignKey(e => e.AuthorId)
                  .OnDelete(DeleteBehavior.Cascade);
                  
            // Indexes for performance
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.CategoryId);
            entity.HasIndex(e => e.PublishedAt);
            entity.HasIndex(e => e.AuthorId);
        });

        // Configure EventCategory entity
        modelBuilder.Entity<EventCategory>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Slug).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Description).HasMaxLength(255);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP(6)");
            
            // Unique constraints
            entity.HasIndex(e => e.Name).IsUnique();
            entity.HasIndex(e => e.Slug).IsUnique();
        });

        // Configure Event entity
        modelBuilder.Entity<Event>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();
            entity.Property(e => e.Title).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Description).IsRequired();
            entity.Property(e => e.Location).IsRequired().HasMaxLength(255);
            entity.Property(e => e.ImageUrl).HasMaxLength(1024);
            entity.Property(e => e.ThumbnailUrl).HasMaxLength(1024);
            entity.Property(e => e.Status).IsRequired();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP(6)");
            
            // Foreign key to EventCategory (optional)
            entity.HasOne(e => e.Category)
                  .WithMany()
                  .HasForeignKey(e => e.CategoryId)
                  .OnDelete(DeleteBehavior.SetNull);
                  
            // Foreign key to User (creator)
            entity.HasOne(e => e.CreatedBy)
                  .WithMany()
                  .HasForeignKey(e => e.CreatedById)
                  .OnDelete(DeleteBehavior.Cascade);
                  
            // Indexes for performance
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.EventDate);
            entity.HasIndex(e => e.CategoryId);
            entity.HasIndex(e => e.CreatedById);
        });

        // Configure EventRegistration entity
        modelBuilder.Entity<EventRegistration>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Phone).HasMaxLength(50);
            entity.Property(e => e.Status).IsRequired();
            entity.Property(e => e.RegistrationDate).HasDefaultValueSql("CURRENT_TIMESTAMP(6)");
            
            // Foreign key to Event
            entity.HasOne(e => e.Event)
                  .WithMany(ev => ev.Registrations)
                  .HasForeignKey(e => e.EventId)
                  .OnDelete(DeleteBehavior.Cascade);
                  
            // Foreign key to User (optional - null for public registrations)
            entity.HasOne(e => e.User)
                  .WithMany()
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.SetNull);
                  
            // Unique constraint: one email per event
            entity.HasIndex(e => new { e.EventId, e.Email }).IsUnique();
            
            // Indexes for performance
            entity.HasIndex(e => e.EventId);
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.Email);
            entity.HasIndex(e => e.Status);
        });
    }
}

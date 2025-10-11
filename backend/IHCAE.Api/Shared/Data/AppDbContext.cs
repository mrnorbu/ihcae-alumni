using Microsoft.EntityFrameworkCore;
using IHCAE.Api.Features.Auth.Models.Entities;
using IHCAE.Api.Features.Alumni.Models.Entities;
using IHCAE.Api.Features.EmailVerification.Models.Entities;
using IHCAE.Api.Features.PasswordReset.Models.Entities;
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
    }
}

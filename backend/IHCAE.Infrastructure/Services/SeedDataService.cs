using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using IHCAE.Infrastructure.Data;
using IHCAE.Domain.Entities;
using BCrypt.Net;

namespace IHCAE.Infrastructure.Services;

/// <summary>
/// Service responsible for seeding initial data into the database.
/// This includes creating default roles and an admin user.
/// </summary>
public class SeedDataService : IHostedService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<SeedDataService> _logger;

    public SeedDataService(IServiceProvider serviceProvider, ILogger<SeedDataService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        
        try
        {
            await SeedRolesAsync(context);
            await SeedAdminUserAsync(context);
            _logger.LogInformation("Database seeding completed successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while seeding database");
            throw;
        }
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;

    /// <summary>
    /// Seeds the default roles in the system
    /// </summary>
    private async Task SeedRolesAsync(AppDbContext context)
    {
        var existingRoles = await context.Roles.ToListAsync();
        
        if (!existingRoles.Any())
        {
            var roles = new List<Role>
            {
                new Role
                {
                    Name = "Admin",
                    Description = "System administrator with full access",
                    CreatedAt = DateTime.UtcNow
                },
                new Role
                {
                    Name = "Alumnus",
                    Description = "Graduated IHCAE student with full member access",
                    CreatedAt = DateTime.UtcNow
                },
                new Role
                {
                    Name = "Trainee",
                    Description = "Current IHCAE trainee with limited access",
                    CreatedAt = DateTime.UtcNow
                }
            };

            context.Roles.AddRange(roles);
            await context.SaveChangesAsync();
            _logger.LogInformation("Default roles created successfully");
        }
        else
        {
            _logger.LogInformation("Roles already exist, skipping role creation");
        }
    }

    /// <summary>
    /// Seeds the default admin user
    /// </summary>
    private async Task SeedAdminUserAsync(AppDbContext context)
    {
        var adminEmail = "admin@ihcae.edu";
        var existingAdmin = await context.Users.FirstOrDefaultAsync(u => u.Email == adminEmail);
        
        if (existingAdmin == null)
        {
            var adminRole = await context.Roles.FirstOrDefaultAsync(r => r.Name == "Admin");
            if (adminRole == null)
            {
                _logger.LogWarning("Admin role not found, cannot create admin user");
                return;
            }

            var adminUser = new User
            {
                Id = Guid.NewGuid(),
                Email = adminEmail,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123", 12), // Default password
                FirstName = "System",
                LastName = "Administrator",
                Status = UserStatus.Approved,
                EmailVerified = true,
                IsBanned = false,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            context.Users.Add(adminUser);
            await context.SaveChangesAsync();

            // Assign admin role
            var userRole = new UserRole
            {
                UserId = adminUser.Id,
                RoleId = adminRole.Id,
                AssignedAt = DateTime.UtcNow,
                AssignedBy = adminUser.Id
            };

            context.UserRoles.Add(userRole);
            await context.SaveChangesAsync();
            
            _logger.LogInformation("Default admin user created successfully. Email: {Email}, Password: Admin@123", adminEmail);
        }
        else
        {
            _logger.LogInformation("Admin user already exists, skipping admin user creation");
        }
    }
}

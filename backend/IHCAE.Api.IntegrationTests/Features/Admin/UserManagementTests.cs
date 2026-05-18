using System.Net.Http.Json;
using System.Net.Http.Headers;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using IHCAE.Api.IntegrationTests.Infrastructure;
using IHCAE.Api.Shared.Data;
using IHCAE.Api.Features.Auth.Models.Entities;
using IHCAE.Api.Features.Auth.Models.DTOs;
using IHCAE.Api.Features.Admin.Models.DTOs;
using IHCAE.Api.Shared.Constants;
using IHCAE.Api.Shared.DTOs;
using IHCAE.Api.Shared.Models;

namespace IHCAE.Api.IntegrationTests.Features.Admin;

public class UserManagementTests : IntegrationTestBase
{
    public UserManagementTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    private async Task<string> GetAdminTokenAsync(string email, string password)
    {
        var request = new LoginRequest { Email = email, Password = password };
        var response = await _client.PostAsJsonAsync("/api/v1/auth/login", request);
        response.EnsureSuccessStatusCode();
        var result = await response.Content.ReadFromJsonAsync<LoginResponse>();
        return result!.Token;
    }

    private async Task<(Guid AdminId, Guid PendingId1, Guid PendingId2)> SeedAdminAndUsersAsync(AppDbContext context)
    {
        var adminId = Guid.NewGuid();
        var pendingUserId1 = Guid.NewGuid();
        var pendingUserId2 = Guid.NewGuid();

        var adminEmail = "admin.user.mgmt@example.com";
        var existingAdmin = await context.Users.FirstOrDefaultAsync(u => u.Email == adminEmail);
        
        var adminRole = await context.Roles.FirstOrDefaultAsync(r => r.Name == RoleConstants.Admin);
        if (adminRole == null)
        {
            adminRole = new Role { Name = RoleConstants.Admin, Description = "Administrator", CreatedAt = DateTime.UtcNow };
            context.Roles.Add(adminRole);
        }

        var alumniRole = await context.Roles.FirstOrDefaultAsync(r => r.Name == RoleConstants.Alumni);
        if (alumniRole == null)
        {
            alumniRole = new Role { Name = RoleConstants.Alumni, Description = "Alumni", CreatedAt = DateTime.UtcNow };
            context.Roles.Add(alumniRole);
        }
        await context.SaveChangesAsync();

        if (existingAdmin == null)
        {
            var admin = new User
            {
                Id = adminId,
                FirstName = "Admin",
                LastName = "UserMgmt",
                Email = adminEmail,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"),
                Status = UserStatus.Approved,
                CreatedAt = DateTime.UtcNow
            };
            context.Users.Add(admin);

            context.UserRoles.Add(new UserRole
            {
                UserId = adminId,
                RoleId = adminRole.Id
            });
        }
        else
        {
            adminId = existingAdmin.Id;
        }

        var existingPending1 = await context.Users.FirstOrDefaultAsync(u => u.Email == "pending.one@example.com");
        if (existingPending1 == null)
        {
            context.Users.Add(new User
            {
                Id = pendingUserId1,
                FirstName = "Pending",
                LastName = "One",
                Email = "pending.one@example.com",
                PasswordHash = "hashed",
                Status = UserStatus.Pending,
                CreatedAt = DateTime.UtcNow
            });
        }
        else
        {
            pendingUserId1 = existingPending1.Id;
            // Reset status in case it was modified by a previous test
            existingPending1.Status = UserStatus.Pending;
        }

        var existingPending2 = await context.Users.FirstOrDefaultAsync(u => u.Email == "pending.two@example.com");
        if (existingPending2 == null)
        {
            context.Users.Add(new User
            {
                Id = pendingUserId2,
                FirstName = "Pending",
                LastName = "Two",
                Email = "pending.two@example.com",
                PasswordHash = "hashed",
                Status = UserStatus.Pending,
                CreatedAt = DateTime.UtcNow
            });
        }
        else
        {
            pendingUserId2 = existingPending2.Id;
            // Reset status in case it was modified by a previous test
            existingPending2.Status = UserStatus.Pending;
        }

        await context.SaveChangesAsync();

        return (adminId, pendingUserId1, pendingUserId2);
    }

    [Fact]
    public async Task GetPendingUsers_ReturnsPaginatedPendingUsers()
    {
        // Arrange
        Guid adminId, pendingId1, pendingId2;

        using (var scope = _factory.Services.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var ids = await SeedAdminAndUsersAsync(context);
            adminId = ids.AdminId;
            pendingId1 = ids.PendingId1;
            pendingId2 = ids.PendingId2;
        }

        var token = await GetAdminTokenAsync("admin.user.mgmt@example.com", "Password123!");
        
        var request = new HttpRequestMessage(HttpMethod.Get, "/api/v1/admin/users/pending?page=1&pageSize=10");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await _client.SendAsync(request);

        // Assert
        response.IsSuccessStatusCode.Should().BeTrue();
        var result = await response.Content.ReadFromJsonAsync<PaginatedResult<UserSummaryDto>>();
        
        result.Should().NotBeNull();
        result!.Items.Should().Contain(u => u.Id == pendingId1);
        result.Items.Should().Contain(u => u.Id == pendingId2);
        result.Items.Should().OnlyContain(u => u.Status == UserStatus.Pending.ToString());
    }

    [Fact]
    public async Task ApproveUser_WithValidPendingUser_UpdatesStatusAndAssignsRole()
    {
        // Arrange
        Guid adminId, pendingId1, pendingId2;

        using (var scope = _factory.Services.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var ids = await SeedAdminAndUsersAsync(context);
            adminId = ids.AdminId;
            pendingId1 = ids.PendingId1;
            pendingId2 = ids.PendingId2;
        }

        var token = await GetAdminTokenAsync("admin.user.mgmt@example.com", "Password123!");
        
        var request = new HttpRequestMessage(HttpMethod.Post, $"/api/v1/admin/users/{pendingId1}/approve");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await _client.SendAsync(request);

        // Assert
        response.IsSuccessStatusCode.Should().BeTrue();
        var result = await response.Content.ReadFromJsonAsync<AdminActionResponse>();
        
        result.Should().NotBeNull();
        result!.Success.Should().BeTrue();
        
        using (var scope = _factory.Services.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var approvedUser = await context.Users
                .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .FirstAsync(u => u.Id == pendingId1);
                
            approvedUser.Status.Should().Be(UserStatus.Approved);
            approvedUser.UserRoles.Should().Contain(ur => ur.Role.Name == RoleConstants.Alumni);
        }
    }

    [Fact]
    public async Task RejectUser_WithValidPendingUser_UpdatesStatus()
    {
        // Arrange
        Guid adminId, pendingId1, pendingId2;

        using (var scope = _factory.Services.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var ids = await SeedAdminAndUsersAsync(context);
            adminId = ids.AdminId;
            pendingId1 = ids.PendingId1;
            pendingId2 = ids.PendingId2;
        }

        var token = await GetAdminTokenAsync("admin.user.mgmt@example.com", "Password123!");
        
        var request = new HttpRequestMessage(HttpMethod.Post, $"/api/v1/admin/users/{pendingId2}/reject");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await _client.SendAsync(request);

        // Assert
        response.IsSuccessStatusCode.Should().BeTrue();
        var result = await response.Content.ReadFromJsonAsync<AdminActionResponse>();
        
        result.Should().NotBeNull();
        result!.Success.Should().BeTrue();
        
        using (var scope = _factory.Services.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var rejectedUser = await context.Users.FirstAsync(u => u.Id == pendingId2);
            rejectedUser.Status.Should().Be(UserStatus.Rejected);
        }
    }
}

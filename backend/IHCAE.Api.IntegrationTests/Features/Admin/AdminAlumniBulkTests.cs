using System.Net.Http.Json;
using System.Net.Http.Headers;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using IHCAE.Api.IntegrationTests.Infrastructure;
using IHCAE.Api.Shared.Data;
using IHCAE.Api.Features.Auth.Models.Entities;
using IHCAE.Api.Features.Auth.Models.DTOs;
using IHCAE.Api.Features.Alumni.Models.Entities;
using IHCAE.Api.Features.Alumni.Models.DTOs;
using IHCAE.Api.Shared.Constants;
using IHCAE.Api.Shared.Models;

namespace IHCAE.Api.IntegrationTests.Features.Admin;

public class AdminAlumniBulkTests : IntegrationTestBase
{
    public AdminAlumniBulkTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    private async Task<string> GetAdminAuthTokenAsync(AppDbContext context, Guid userId, string email, string password)
    {
        var adminRole = await context.Roles.FirstOrDefaultAsync(r => r.Name == RoleConstants.Admin);
        if (adminRole == null)
        {
            adminRole = new Role { Name = RoleConstants.Admin, Description = "Admin Role", CreatedAt = DateTime.UtcNow };
            context.Roles.Add(adminRole);
            await context.SaveChangesAsync();
        }

        var user = new User
        {
            Id = userId,
            FirstName = "Admin",
            LastName = "User",
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            Status = UserStatus.Approved,
            CreatedAt = DateTime.UtcNow
        };
        context.Users.Add(user);
        
        context.UserRoles.Add(new UserRole
        {
            UserId = userId,
            RoleId = adminRole.Id
        });

        await context.SaveChangesAsync();

        var request = new LoginRequest { Email = email, Password = password };
        var response = await _client.PostAsJsonAsync("/api/v1/auth/login", request);
        response.EnsureSuccessStatusCode();
        var result = await response.Content.ReadFromJsonAsync<LoginResponse>();
        return result!.Token;
    }

    [Fact]
    public async Task BulkUpdateAlumni_AsAdmin_UpdatesRecords()
    {
        // Arrange
        var adminUserId = Guid.NewGuid();
        var adminEmail = "adminbulk1@example.com";
        var password = "Password123!";
        string token;
        var alumni1Id = Guid.NewGuid();

        using (var scope = _factory.Services.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            token = await GetAdminAuthTokenAsync(context, adminUserId, adminEmail, password);

            context.AlumniDatabase.Add(new AlumniDatabase
            {
                Id = alumni1Id,
                FirstName = "OldName",
                LastName = "LastName",
                Email = "bulk1@test.com",
                Course = "BSc",
                Batch = "2020",
                ImportedAt = DateTime.UtcNow
            });
            await context.SaveChangesAsync();
        }

        var updateRecords = new List<AlumniDatabaseDto>
        {
            new AlumniDatabaseDto
            {
                Id = alumni1Id,
                FirstName = "NewName",
                LastName = "LastName",
                Email = "bulk1@test.com",
                Course = "BSc",
                Batch = "2020",
                Phone = "1234567890"
            }
        };

        var request = new HttpRequestMessage(HttpMethod.Put, "/api/v1/admin/alumni/bulk-update");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        request.Content = JsonContent.Create(updateRecords);

        // Act
        var response = await _client.SendAsync(request);

        // Assert
        response.IsSuccessStatusCode.Should().BeTrue();

        using (var scope = _factory.Services.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var updatedRecord = await context.AlumniDatabase.FindAsync(alumni1Id);
            updatedRecord.Should().NotBeNull();
            updatedRecord!.FirstName.Should().Be("NewName");
            updatedRecord.Phone.Should().Be("1234567890");
        }
    }

    [Fact]
    public async Task BulkGenerateAccounts_AsAdmin_CreatesUsersAndProfiles()
    {
        // Arrange
        var adminUserId = Guid.NewGuid();
        var adminEmail = "adminbulk2@example.com";
        var password = "Password123!";
        string token;
        var alumni2Id = Guid.NewGuid();
        var testEmail = $"gen{Guid.NewGuid()}@test.com";

        using (var scope = _factory.Services.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            token = await GetAdminAuthTokenAsync(context, adminUserId, adminEmail, password);

            context.AlumniDatabase.Add(new AlumniDatabase
            {
                Id = alumni2Id,
                FirstName = "GenTest",
                LastName = "User",
                Email = testEmail,
                Course = "BCA",
                Batch = "2021",
                ImportedAt = DateTime.UtcNow
            });
            await context.SaveChangesAsync();
        }

        var alumniIds = new List<Guid> { alumni2Id };

        var request = new HttpRequestMessage(HttpMethod.Post, "/api/v1/admin/alumni/bulk-generate-accounts");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        request.Content = JsonContent.Create(alumniIds);

        // Act
        var response = await _client.SendAsync(request);

        // Assert
        response.IsSuccessStatusCode.Should().BeTrue();

        using (var scope = _factory.Services.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            
            var alumniRecord = await context.AlumniDatabase.FindAsync(alumni2Id);
            alumniRecord.Should().NotBeNull();
            alumniRecord!.MatchedUserId.Should().NotBeNull();

            var generatedUser = await context.Users.FindAsync(alumniRecord.MatchedUserId);
            generatedUser.Should().NotBeNull();
            generatedUser!.FirstName.Should().Be("GenTest");
            generatedUser.Email.Should().Be(testEmail);

            var profile = await context.Set<AlumniProfile>().FindAsync(alumniRecord.MatchedUserId);
            profile.Should().NotBeNull();
            profile!.Batch.Should().Be("2021");
            
            var resetToken = await context.PasswordResetTokens.FirstOrDefaultAsync(t => t.UserId == generatedUser.Id);
            resetToken.Should().NotBeNull();
        }
    }
}

using System.Net.Http.Json;
using System.Net.Http.Headers;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using IHCAE.Api.IntegrationTests.Infrastructure;
using IHCAE.Api.Shared.Data;
using IHCAE.Api.Features.Auth.Models.Entities;
using IHCAE.Api.Features.Auth.Models.DTOs;
using IHCAE.Api.Features.Directory.Models.DTOs;
using IHCAE.Api.Shared.DTOs;
using IHCAE.Api.Shared.Constants;
using IHCAE.Api.Shared.Models;

namespace IHCAE.Api.IntegrationTests.Features.Directory;

public class DirectoryTests : IntegrationTestBase
{
    public DirectoryTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    private async Task<string> GetAuthTokenAsync(string email, string password)
    {
        var request = new LoginRequest { Email = email, Password = password };
        var response = await _client.PostAsJsonAsync("/api/v1/auth/login", request);
        response.EnsureSuccessStatusCode();
        var result = await response.Content.ReadFromJsonAsync<LoginResponse>();
        return result!.Token;
    }

    private async Task SeedAlumniRoleAndUserAsync(AppDbContext context, int userId, string email, string password, string firstName, string lastName)
    {
        var alumniRole = await context.Roles.FirstOrDefaultAsync(r => r.Name == RoleConstants.Alumni);
        if (alumniRole == null)
        {
            alumniRole = new Role { Name = RoleConstants.Alumni, Description = "Alumni Role", CreatedAt = DateTime.UtcNow };
            context.Roles.Add(alumniRole);
            await context.SaveChangesAsync(); // Save to generate Id before assigning to UserRole
        }

        var user = new User
        {
            Id = userId,
            FirstName = firstName,
            LastName = lastName,
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            Status = UserStatus.Approved,
            EmailVerified = true,
            CreatedAt = DateTime.UtcNow
        };
        
        context.Users.Add(user);
        
        context.Set<AlumniProfile>().Add(new AlumniProfile
        {
            UserId = userId,
            Bio = "I am an alumni",
            JobTitle = "Test Role",
            Location = "Test City",
            Course = "Advanced Mountaineering",
            Batch = "2021",
            CreatedAt = DateTime.UtcNow
        });

        context.UserRoles.Add(new UserRole
        {
            UserId = userId,
            RoleId = alumniRole.Id
        });

        await context.SaveChangesAsync();
    }

    [Fact]
    public async Task GetAlumniDirectory_WithValidToken_ReturnsPaginatedList()
    {
        // Arrange
        var userId = Random.Shared.Next(1, 1000000);
        var email = "directoryviewer@example.com";
        var password = "Password123!";

        using (var scope = _factory.Services.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            await SeedAlumniRoleAndUserAsync(context, userId, email, password, "Viewer", "User");
            
            // Seed a second user to appear in directory
            await SeedAlumniRoleAndUserAsync(context, Random.Shared.Next(1, 1000000), "anotheralumni@example.com", "Password123!", "Another", "Alumni");
        }

        var token = await GetAuthTokenAsync(email, password);
        var request = new HttpRequestMessage(HttpMethod.Get, "/api/v1/alumni?page=1&pageSize=10");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await _client.SendAsync(request);

        // Assert
        response.IsSuccessStatusCode.Should().BeTrue();
        var result = await response.Content.ReadFromJsonAsync<PaginatedResult<AlumniCardDto>>();
        result.Should().NotBeNull();
        result!.Items.Should().NotBeEmpty();
        result.TotalCount.Should().BeGreaterThanOrEqualTo(2);
    }

    [Fact]
    public async Task GetAlumniDetail_WithValidToken_ReturnsDetail()
    {
        // Arrange
        var viewerUserId = Random.Shared.Next(1, 1000000);
        var viewerEmail = "detailviewer@example.com";
        var password = "Password123!";
        
        var targetUserId = Random.Shared.Next(1, 1000000);
        var targetEmail = "targetalumni@example.com";

        using (var scope = _factory.Services.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            // Viewer user
            await SeedAlumniRoleAndUserAsync(context, viewerUserId, viewerEmail, password, "Detail", "Viewer");
            
            // Target user
            await SeedAlumniRoleAndUserAsync(context, targetUserId, targetEmail, "Password123!", "Target", "Alumni");
        }

        var token = await GetAuthTokenAsync(viewerEmail, password);
        var request = new HttpRequestMessage(HttpMethod.Get, $"/api/v1/alumni/{targetUserId}");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await _client.SendAsync(request);

        // Assert
        response.IsSuccessStatusCode.Should().BeTrue();
        var result = await response.Content.ReadFromJsonAsync<AlumniDetailDto>();
        result.Should().NotBeNull();
        result!.Id.Should().Be(targetUserId);
        result.FirstName.Should().Be("Target");
        result.Email.Should().Be(targetEmail);
    }
}

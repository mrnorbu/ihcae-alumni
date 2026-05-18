using System.Net.Http.Json;
using System.Net.Http.Headers;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using IHCAE.Api.IntegrationTests.Infrastructure;
using IHCAE.Api.Shared.Data;
using IHCAE.Api.Features.Auth.Models.Entities;
using IHCAE.Api.Features.Auth.Models.DTOs;
using IHCAE.Api.Features.Profile.Models.DTOs;

namespace IHCAE.Api.IntegrationTests.Features.Profile;

public class ProfileTests : IntegrationTestBase
{
    public ProfileTests(CustomWebApplicationFactory factory) : base(factory)
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

    [Fact]
    public async Task GetMyProfile_WithValidToken_ReturnsProfileData()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var email = "profile@example.com";
        var password = "Password123!";

        using (var scope = _factory.Services.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var user = new User
            {
                Id = userId,
                FirstName = "Test",
                LastName = "Profile",
                Email = email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
                Status = UserStatus.Approved,
                CreatedAt = DateTime.UtcNow
            };
            
            context.Users.Add(user);
            context.Set<AlumniProfile>().Add(new AlumniProfile
            {
                UserId = userId,
                Bio = "I am a test alumni",
                JobTitle = "Test Engineer",
                Location = "New York",
                Course = "Mountaineering Basic",
                Batch = "2020",
                CreatedAt = DateTime.UtcNow
            });
            await context.SaveChangesAsync();
        }

        var token = await GetAuthTokenAsync(email, password);
        var request = new HttpRequestMessage(HttpMethod.Get, "/api/v1/profile/me");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await _client.SendAsync(request);

        // Assert
        response.IsSuccessStatusCode.Should().BeTrue();
        var profile = await response.Content.ReadFromJsonAsync<ProfileDto>();
        profile.Should().NotBeNull();
        profile!.FirstName.Should().Be("Test");
        profile.Bio.Should().Be("I am a test alumni");
        profile.JobTitle.Should().Be("Test Engineer");
    }

    [Fact]
    public async Task UpdateMyProfile_WithValidData_UpdatesProfile()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var email = "updateprofile@example.com";
        var password = "Password123!";

        using (var scope = _factory.Services.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            context.Users.Add(new User
            {
                Id = userId,
                FirstName = "Test",
                LastName = "ProfileUpdate",
                Email = email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
                Status = UserStatus.Approved,
                CreatedAt = DateTime.UtcNow
            });
            await context.SaveChangesAsync();
        }

        var token = await GetAuthTokenAsync(email, password);
        var request = new HttpRequestMessage(HttpMethod.Put, "/api/v1/profile/me");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        
        var updateRequest = new UpdateProfileRequest
        {
            Bio = "Updated bio",
            JobTitle = "Senior Dev",
            Location = "San Francisco",
            Phone = "1234567890"
        };
        request.Content = JsonContent.Create(updateRequest);

        // Act
        var response = await _client.SendAsync(request);

        // Assert
        response.IsSuccessStatusCode.Should().BeTrue();
        
        using (var scope = _factory.Services.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var user = await context.Users.Include(u => u.AlumniProfile).FirstOrDefaultAsync(u => u.Id == userId);
            user.Should().NotBeNull();
            user!.Phone.Should().Be("1234567890");
            user.AlumniProfile.Should().NotBeNull();
            user.AlumniProfile!.Bio.Should().Be("Updated bio");
            user.AlumniProfile.JobTitle.Should().Be("Senior Dev");
            user.AlumniProfile.Location.Should().Be("San Francisco");
        }
    }
}

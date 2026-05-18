using System.Net.Http.Json;
using FluentAssertions;
using NSubstitute;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using IHCAE.Api.IntegrationTests.Infrastructure;
using IHCAE.Api.Features.Auth.Models.DTOs;
using IHCAE.Api.Shared.Data;
using IHCAE.Api.Features.Auth.Models.Entities;

namespace IHCAE.Api.IntegrationTests.Features.Auth;

public class RegistrationTests : IntegrationTestBase
{
    public RegistrationTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task Register_WithValidData_ReturnsSuccessAndCreatesUser()
    {
        // Arrange
        var request = new RegisterRequest
        {
            FirstName = "Test",
            LastName = "User",
            Email = "testuser@example.com",
            Password = "Password123!"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/v1/auth/register", request);

        // Assert
        response.IsSuccessStatusCode.Should().BeTrue();
        
        var result = await response.Content.ReadFromJsonAsync<RegisterResponse>();
        result.Should().NotBeNull();
        result!.Message.Should().Contain("successful");

        // Verify Database
        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        
        var userInDb = await context.Users.FirstOrDefaultAsync(u => u.Email == "testuser@example.com");
        userInDb.Should().NotBeNull();
        userInDb!.FirstName.Should().Be("Test");
        userInDb.LastName.Should().Be("User");

        // Verify Email Service was called
        await _emailServiceMock.Received(1).SendRegistrationConfirmationAsync(
            Arg.Is("testuser@example.com"),
            Arg.Is("Test"),
            Arg.Any<bool>());
    }

    [Fact]
    public async Task Register_WithDuplicateEmail_ReturnsBadRequest()
    {
        // Arrange - Pre-seed database with a user
        using (var scope = _factory.Services.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            context.Users.Add(new User
            {
                Id = Guid.NewGuid(),
                FirstName = "Existing",
                LastName = "User",
                Email = "duplicate@example.com",
                PasswordHash = "hashedpassword",
                CreatedAt = DateTime.UtcNow
            });
            await context.SaveChangesAsync();
        }

        var request = new RegisterRequest
        {
            FirstName = "Another",
            LastName = "User",
            Email = "duplicate@example.com",
            Password = "Password123!"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/v1/auth/register", request);

        // Assert
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.BadRequest);
        var content = await response.Content.ReadAsStringAsync();
        content.Should().Contain("Email address is already in use");
    }
}

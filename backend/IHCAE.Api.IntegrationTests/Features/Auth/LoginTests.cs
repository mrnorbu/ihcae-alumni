using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using IHCAE.Api.IntegrationTests.Infrastructure;
using IHCAE.Api.Features.Auth.Models.DTOs;
using IHCAE.Api.Shared.Data;
using IHCAE.Api.Features.Auth.Models.Entities;
using IHCAE.Api.Shared.DTOs;

namespace IHCAE.Api.IntegrationTests.Features.Auth;

public class LoginTests : IntegrationTestBase
{
    public LoginTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task Login_WithValidCredentials_ReturnsOkAndToken()
    {
        // Arrange
        var password = "Password123!";
        var email = "approveduser@example.com";
        using (var scope = _factory.Services.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            context.Users.Add(new User
            {
                Id = Guid.NewGuid(),
                FirstName = "Approved",
                LastName = "User",
                Email = email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
                Status = UserStatus.Approved,
                CreatedAt = DateTime.UtcNow
            });
            await context.SaveChangesAsync();
        }

        var request = new LoginRequest
        {
            Email = email,
            Password = password
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/v1/auth/login", request);

        // Assert
        response.IsSuccessStatusCode.Should().BeTrue();
        
        var result = await response.Content.ReadFromJsonAsync<LoginResponse>();
        result.Should().NotBeNull();
        result!.Success.Should().BeTrue();
        result.Token.Should().NotBeNullOrEmpty();
        result.User.Should().NotBeNull();
        result.User!.Email.Should().Be(email);
        result.User.Status.Should().Be(UserStatus.Approved.ToString());
    }

    [Fact]
    public async Task Login_WithInvalidCredentials_ReturnsUnauthorized()
    {
        // Arrange
        var email = "wronguser@example.com";
        var request = new LoginRequest
        {
            Email = email,
            Password = "WrongPassword123!"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/v1/auth/login", request);

        // Assert
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.Unauthorized);
        
        var result = await response.Content.ReadFromJsonAsync<ErrorResponse>();
        result.Should().NotBeNull();
        result!.Message.Should().Contain("Invalid email or password");
    }

    [Fact]
    public async Task Login_UnapprovedUser_ReturnsUnauthorized()
    {
        // Arrange
        var password = "Password123!";
        var email = "pendinguser@example.com";
        using (var scope = _factory.Services.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            context.Users.Add(new User
            {
                Id = Guid.NewGuid(),
                FirstName = "Pending",
                LastName = "User",
                Email = email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
                Status = UserStatus.Pending,
                CreatedAt = DateTime.UtcNow
            });
            await context.SaveChangesAsync();
        }

        var request = new LoginRequest
        {
            Email = email,
            Password = password
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/v1/auth/login", request);

        // Assert
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.Unauthorized);
        
        var result = await response.Content.ReadFromJsonAsync<ErrorResponse>();
        result.Should().NotBeNull();
        result!.Message.Should().Contain("pending approval");
    }

    [Fact]
    public async Task Login_BannedUser_ReturnsUnauthorized()
    {
        // Arrange
        var password = "Password123!";
        var email = "banneduser@example.com";
        using (var scope = _factory.Services.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            context.Users.Add(new User
            {
                Id = Guid.NewGuid(),
                FirstName = "Banned",
                LastName = "User",
                Email = email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
                Status = UserStatus.Approved,
                IsBanned = true,
                CreatedAt = DateTime.UtcNow
            });
            await context.SaveChangesAsync();
        }

        var request = new LoginRequest
        {
            Email = email,
            Password = password
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/v1/auth/login", request);

        // Assert
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.Unauthorized);
        
        var result = await response.Content.ReadFromJsonAsync<ErrorResponse>();
        result.Should().NotBeNull();
        result!.Message.Should().Contain("account has been banned");
    }
}

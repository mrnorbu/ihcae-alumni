using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using NSubstitute;
using IHCAE.Api.IntegrationTests.Infrastructure;
using IHCAE.Api.Shared.Data;
using IHCAE.Api.Features.Auth.Models.Entities;
using IHCAE.Api.Features.EmailVerification.Models.Entities;

namespace IHCAE.Api.IntegrationTests.Features.EmailVerification;

public class EmailVerificationTests : IntegrationTestBase
{
    public EmailVerificationTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task SendVerificationEmail_WithValidUser_ReturnsOkAndSendsEmail()
    {
        // Arrange
        var userId = Guid.NewGuid();
        using (var scope = _factory.Services.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            context.Users.Add(new User
            {
                Id = userId,
                FirstName = "Test",
                LastName = "User",
                Email = "verify@example.com",
                PasswordHash = "hashed",
                Status = UserStatus.Approved,
                CreatedAt = DateTime.UtcNow
            });
            await context.SaveChangesAsync();
        }

        // Act
        var response = await _client.PostAsync($"/api/v1/EmailVerification/send/{userId}", null);

        // Assert
        response.IsSuccessStatusCode.Should().BeTrue();
        
        // Verify token was saved
        using (var scope = _factory.Services.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var token = await context.EmailVerificationTokens.FirstOrDefaultAsync(t => t.UserId == userId);
            token.Should().NotBeNull();
            token!.IsUsed.Should().BeFalse();
        }

        // Verify Email Service was called
        await _emailServiceMock.Received(1).SendEmailAsync(
            Arg.Is("verify@example.com"),
            Arg.Is("Verify Your IHCAE Alumni Network Account"),
            Arg.Any<string>());
    }

    [Fact]
    public async Task VerifyEmail_WithValidToken_VerifiesUser()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var rawToken = "my-secret-token";
        
        using var sha256 = SHA256.Create();
        var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(rawToken));
        var tokenHash = Convert.ToBase64String(hashedBytes);

        using (var scope = _factory.Services.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            context.Users.Add(new User
            {
                Id = userId,
                FirstName = "Test",
                LastName = "User",
                Email = "verify2@example.com",
                PasswordHash = "hashed",
                Status = UserStatus.Approved,
                EmailVerified = false,
                CreatedAt = DateTime.UtcNow
            });
            
            context.EmailVerificationTokens.Add(new EmailVerificationToken
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                TokenHash = tokenHash,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddHours(24),
                IsUsed = false
            });
            
            await context.SaveChangesAsync();
        }

        // Act
        var response = await _client.PostAsync($"/api/v1/EmailVerification/verify?token={Uri.EscapeDataString(rawToken)}", null);

        // Assert
        response.IsSuccessStatusCode.Should().BeTrue();
        var content = await response.Content.ReadAsStringAsync();
        content.Should().Contain("Email verified successfully");

        // Verify Database
        using (var scope = _factory.Services.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var user = await context.Users.FindAsync(userId);
            user!.EmailVerified.Should().BeTrue();

            var token = await context.EmailVerificationTokens.FirstOrDefaultAsync(t => t.UserId == userId);
            token!.IsUsed.Should().BeTrue();
        }
    }

    [Fact]
    public async Task VerifyEmail_WithExpiredToken_ReturnsBadRequest()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var rawToken = "my-expired-token";
        
        using var sha256 = SHA256.Create();
        var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(rawToken));
        var tokenHash = Convert.ToBase64String(hashedBytes);

        using (var scope = _factory.Services.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            context.Users.Add(new User
            {
                Id = userId,
                FirstName = "Test",
                LastName = "User",
                Email = "expired@example.com",
                PasswordHash = "hashed",
                Status = UserStatus.Approved,
                EmailVerified = false,
                CreatedAt = DateTime.UtcNow
            });
            
            context.EmailVerificationTokens.Add(new EmailVerificationToken
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                TokenHash = tokenHash,
                CreatedAt = DateTime.UtcNow.AddDays(-2),
                ExpiresAt = DateTime.UtcNow.AddDays(-1), // Expired
                IsUsed = false
            });
            
            await context.SaveChangesAsync();
        }

        // Act
        var response = await _client.PostAsync($"/api/v1/EmailVerification/verify?token={Uri.EscapeDataString(rawToken)}", null);

        // Assert
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.BadRequest);
    }
}

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
using IHCAE.Api.Features.PasswordReset.Models.Entities;
using IHCAE.Api.Features.PasswordReset.Controllers;

namespace IHCAE.Api.IntegrationTests.Features.PasswordReset;

public class PasswordResetTests : IntegrationTestBase
{
    public PasswordResetTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task ForgotPassword_WithValidEmail_ReturnsOkAndSendsEmail()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var email = "forgot@example.com";
        using (var scope = _factory.Services.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            context.Users.Add(new User
            {
                Id = userId,
                FirstName = "Test",
                LastName = "User",
                Email = email,
                PasswordHash = "hashed",
                Status = UserStatus.Approved,
                CreatedAt = DateTime.UtcNow
            });
            await context.SaveChangesAsync();
        }

        var request = new ForgotPasswordRequest { Email = email };

        // Act
        var response = await _client.PostAsJsonAsync("/api/v1/PasswordReset/forgot-password", request);

        // Assert
        response.IsSuccessStatusCode.Should().BeTrue();
        
        using (var scope = _factory.Services.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var token = await context.PasswordResetTokens.FirstOrDefaultAsync(t => t.UserId == userId);
            token.Should().NotBeNull();
            token!.IsUsed.Should().BeFalse();
        }

        await _emailServiceMock.Received(1).SendPasswordResetAsync(
            Arg.Is(email),
            Arg.Is("Test"),
            Arg.Any<string>());
    }

    [Fact]
    public async Task ResetPassword_WithValidTokenAndNewPassword_UpdatesPassword()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var rawToken = "my-reset-token";
        
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
                Email = "reset@example.com",
                PasswordHash = "oldhashedpassword",
                Status = UserStatus.Approved,
                CreatedAt = DateTime.UtcNow
            });
            
            context.PasswordResetTokens.Add(new PasswordResetToken
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                TokenHash = tokenHash,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddHours(1),
                IsUsed = false
            });
            
            await context.SaveChangesAsync();
        }

        var request = new ResetPasswordRequest 
        { 
            Token = rawToken,
            NewPassword = "NewValidPassword123!"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/v1/PasswordReset/reset-password", request);

        // Assert
        response.IsSuccessStatusCode.Should().BeTrue();

        using (var scope = _factory.Services.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var user = await context.Users.FindAsync(userId);
            user!.PasswordHash.Should().NotBe("oldhashedpassword");

            var token = await context.PasswordResetTokens.FirstOrDefaultAsync(t => t.UserId == userId);
            token!.IsUsed.Should().BeTrue();
        }
    }

    [Fact]
    public async Task ValidatePassword_WithInvalidPassword_ReturnsFalse()
    {
        // Arrange
        var request = new ValidatePasswordRequest { Password = "weak" };

        // Act
        var response = await _client.PostAsJsonAsync("/api/v1/PasswordReset/validate-password", request);

        // Assert
        response.IsSuccessStatusCode.Should().BeTrue();
        var content = await response.Content.ReadAsStringAsync();
        content.Should().Contain("\"isValid\":false");
    }

    [Fact]
    public async Task ValidatePassword_WithValidPassword_ReturnsTrue()
    {
        // Arrange
        var request = new ValidatePasswordRequest { Password = "StrongPassword123!" };

        // Act
        var response = await _client.PostAsJsonAsync("/api/v1/PasswordReset/validate-password", request);

        // Assert
        response.IsSuccessStatusCode.Should().BeTrue();
        var content = await response.Content.ReadAsStringAsync();
        content.Should().Contain("\"isValid\":true");
    }
}

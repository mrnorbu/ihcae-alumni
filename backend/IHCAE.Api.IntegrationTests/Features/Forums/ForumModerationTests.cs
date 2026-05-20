using System.Net.Http.Json;
using System.Net.Http.Headers;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using IHCAE.Api.IntegrationTests.Infrastructure;
using IHCAE.Api.Shared.Data;
using IHCAE.Api.Shared.DTOs;
using IHCAE.Api.Features.Auth.Models.Entities;
using IHCAE.Api.Features.Auth.Models.DTOs;
using IHCAE.Api.Features.Forums.Models.Entities;
using IHCAE.Api.Shared.Constants;
using IHCAE.Api.Shared.Models;
using IHCAE.Api.Shared.Services;
using NSubstitute;

namespace IHCAE.Api.IntegrationTests.Features.Forums;

public class ForumModerationTests : IntegrationTestBase
{
    public ForumModerationTests(CustomWebApplicationFactory factory) : base(factory)
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

    private async Task SeedAdminAndForumDataAsync(AppDbContext context, Guid adminId, Guid topicId, Guid postId)
    {
        var adminEmail = "admin.mod@example.com";
        var existingAdmin = await context.Users.FirstOrDefaultAsync(u => u.Email == adminEmail);
        if (existingAdmin == null)
        {
            var adminRole = await context.Roles.FirstOrDefaultAsync(r => r.Name == RoleConstants.Admin);
            if (adminRole == null)
            {
                adminRole = new Role { Name = RoleConstants.Admin, Description = "Administrator", CreatedAt = DateTime.UtcNow };
                context.Roles.Add(adminRole);
                await context.SaveChangesAsync();
            }

            var admin = new User
            {
                Id = adminId,
                FirstName = "Admin",
                LastName = "Moderator",
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

        if (!await context.DiscussionTopics.AnyAsync(t => t.Id == topicId))
        {
            context.DiscussionTopics.Add(new DiscussionTopic
            {
                Id = topicId,
                Title = "Test Moderation Topic",
                CreatedById = adminId, // Using admin as author for simplicity
                CreatedAt = DateTime.UtcNow
            });
        }

        if (!await context.ForumPosts.AnyAsync(p => p.Id == postId))
        {
            context.ForumPosts.Add(new ForumPost
            {
                Id = postId,
                Content = "Test Moderation Post",
                TopicId = topicId,
                AuthorId = adminId,
                CreatedAt = DateTime.UtcNow
            });
        }

        await context.SaveChangesAsync();
    }

    [Fact]
    public async Task DeleteTopic_AsAdmin_ReturnsSuccess()
    {
        // Arrange
        var adminId = Guid.NewGuid();
        var topicId = Guid.NewGuid();
        var postId = Guid.NewGuid();

        using (var scope = _factory.Services.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            await SeedAdminAndForumDataAsync(context, adminId, topicId, postId);
        }

        var token = await GetAdminTokenAsync("admin.mod@example.com", "Password123!");
        
        var request = new HttpRequestMessage(HttpMethod.Delete, $"/api/v1/admin/forums/topics/{topicId}");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await _client.SendAsync(request);

        // Assert
        response.IsSuccessStatusCode.Should().BeTrue();
        
        using (var scope = _factory.Services.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var topicExists = await context.DiscussionTopics.AnyAsync(t => t.Id == topicId);
            topicExists.Should().BeFalse();

            var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();
            await emailService.Received(1).SendTopicModerationNotificationAsync(
                Arg.Any<string>(), 
                Arg.Any<string>(), 
                Arg.Any<string>(), 
                "deleted", 
                Arg.Any<string>());
        }
    }

    [Fact]
    public async Task TogglePinTopic_AsAdmin_ReturnsSuccess()
    {
        // Arrange
        var adminId = Guid.NewGuid();
        var topicId = Guid.NewGuid();
        var postId = Guid.NewGuid();

        using (var scope = _factory.Services.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            await SeedAdminAndForumDataAsync(context, adminId, topicId, postId);
        }

        var token = await GetAdminTokenAsync("admin.mod@example.com", "Password123!");
        
        var request = new HttpRequestMessage(HttpMethod.Put, $"/api/v1/admin/forums/topics/{topicId}/pin");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await _client.SendAsync(request);

        // Assert
        response.IsSuccessStatusCode.Should().BeTrue();
        
        using (var scope = _factory.Services.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var topic = await context.DiscussionTopics.FirstAsync(t => t.Id == topicId);
            topic.IsPinned.Should().BeTrue();
        }
    }

    [Fact]
    public async Task FlagPost_AsUser_ReturnsSuccess()
    {
        // Arrange
        var adminId = Guid.NewGuid();
        var topicId = Guid.NewGuid();
        var postId = Guid.NewGuid();

        using (var scope = _factory.Services.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            await SeedAdminAndForumDataAsync(context, adminId, topicId, postId);
        }

        var token = await GetAdminTokenAsync("admin.mod@example.com", "Password123!");
        
        var request = new HttpRequestMessage(HttpMethod.Post, $"/api/v1/forums/posts/{postId}/flag");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        request.Content = JsonContent.Create(new { Reason = "Spam", Details = "Contains unsolicited advertising links." });

        // Act
        var response = await _client.SendAsync(request);

        // Assert
        response.IsSuccessStatusCode.Should().BeTrue();
        
        using (var scope = _factory.Services.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var flag = await context.ForumFlags.FirstOrDefaultAsync(f => f.PostId == postId);
            flag.Should().NotBeNull();
            flag!.Reason.Should().Be("Spam");
            flag.Details.Should().Be("Contains unsolicited advertising links.");
            flag.Status.Should().Be(FlagStatus.Pending);
        }
    }

    [Fact]
    public async Task GetFlags_AsAdmin_ReturnsFlags()
    {
        // Arrange
        var adminId = Guid.NewGuid();
        var topicId = Guid.NewGuid();
        var postId = Guid.NewGuid();

        using (var scope = _factory.Services.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            await SeedAdminAndForumDataAsync(context, adminId, topicId, postId);

            var actualAdmin = await context.Users.FirstAsync(u => u.Email == "admin.mod@example.com");

            // Add a flag
            var flag = new ForumFlag
            {
                PostId = postId,
                FlaggedById = actualAdmin.Id,
                Reason = "Inappropriate",
                Details = "Violates guidelines.",
                Status = FlagStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };
            context.ForumFlags.Add(flag);
            await context.SaveChangesAsync();
        }

        var token = await GetAdminTokenAsync("admin.mod@example.com", "Password123!");
        
        var request = new HttpRequestMessage(HttpMethod.Get, "/api/v1/admin/forums/flags?status=Pending");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await _client.SendAsync(request);

        // Assert
        response.IsSuccessStatusCode.Should().BeTrue();
        var result = await response.Content.ReadFromJsonAsync<PaginatedResult<IHCAE.Api.Features.Forums.Models.DTOs.ForumFlagDto>>();
        result.Should().NotBeNull();
        result!.Items.Should().NotBeEmpty();
        result.Items.Any(f => f.PostId == postId && f.Reason == "Inappropriate").Should().BeTrue();
    }

    [Fact]
    public async Task ResolveFlag_AsAdmin_ReturnsSuccess()
    {
        // Arrange
        var adminId = Guid.NewGuid();
        var topicId = Guid.NewGuid();
        var postId = Guid.NewGuid();
        var flagId = Guid.NewGuid();

        using (var scope = _factory.Services.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            await SeedAdminAndForumDataAsync(context, adminId, topicId, postId);

            var actualAdmin = await context.Users.FirstAsync(u => u.Email == "admin.mod@example.com");

            // Add a flag
            var flag = new ForumFlag
            {
                Id = flagId,
                PostId = postId,
                FlaggedById = actualAdmin.Id,
                Reason = "Harassment",
                Status = FlagStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };
            context.ForumFlags.Add(flag);
            await context.SaveChangesAsync();
        }

        var token = await GetAdminTokenAsync("admin.mod@example.com", "Password123!");
        
        var request = new HttpRequestMessage(HttpMethod.Put, $"/api/v1/admin/forums/flags/{flagId}/resolve");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        request.Content = JsonContent.Create(new { Status = "Dismissed", Notes = "No violation found upon review." });

        // Act
        var response = await _client.SendAsync(request);

        // Assert
        response.IsSuccessStatusCode.Should().BeTrue();
        
        using (var scope = _factory.Services.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var flag = await context.ForumFlags.FindAsync(flagId);
            flag.Should().NotBeNull();
            flag!.Status.Should().Be(FlagStatus.Dismissed);
            flag.ResolutionNotes.Should().Be("No violation found upon review.");
            flag.ResolvedById.Should().Be(adminId);
            flag.ResolvedAt.Should().NotBeNull();
        }
    }
}

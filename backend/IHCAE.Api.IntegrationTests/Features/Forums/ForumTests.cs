using System.Net.Http.Json;
using System.Net.Http.Headers;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using IHCAE.Api.IntegrationTests.Infrastructure;
using IHCAE.Api.Shared.Data;
using IHCAE.Api.Features.Auth.Models.Entities;
using IHCAE.Api.Features.Auth.Models.DTOs;
using IHCAE.Api.Features.Forums.Models.Entities;
using IHCAE.Api.Features.Forums.Models.DTOs;
using IHCAE.Api.Shared.DTOs;

namespace IHCAE.Api.IntegrationTests.Features.Forums;

public class ForumTests : IntegrationTestBase
{
    public ForumTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    private async Task<string> GetUserTokenAsync(string email, string password)
    {
        var request = new LoginRequest { Email = email, Password = password };
        var response = await _client.PostAsJsonAsync("/api/v1/auth/login", request);
        response.EnsureSuccessStatusCode();
        var result = await response.Content.ReadFromJsonAsync<LoginResponse>();
        return result!.Token;
    }

    private async Task SeedForumDataAsync(AppDbContext context, Guid userId, Guid topicId, Guid postId)
    {
        var email = "forum.user@example.com";
        var existingUser = await context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (existingUser == null)
        {
            var user = new User
            {
                Id = userId,
                FirstName = "Forum",
                LastName = "User",
                Email = email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"),
                Status = UserStatus.Approved,
                CreatedAt = DateTime.UtcNow
            };
            context.Users.Add(user);
        }
        else
        {
            userId = existingUser.Id;
        }

        if (!await context.DiscussionTopics.AnyAsync(t => t.Id == topicId))
        {
            context.DiscussionTopics.Add(new DiscussionTopic
            {
                Id = topicId,
                Title = "Test Topic",
                CreatedById = userId,
                CreatedAt = DateTime.UtcNow
            });
        }

        if (!await context.ForumPosts.AnyAsync(p => p.Id == postId))
        {
            context.ForumPosts.Add(new ForumPost
            {
                Id = postId,
                Content = "Test Post",
                TopicId = topicId,
                AuthorId = userId,
                CreatedAt = DateTime.UtcNow
            });
        }

        await context.SaveChangesAsync();
    }

    [Fact]
    public async Task GetTopics_ReturnsPaginatedTopics()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var topicId = Guid.NewGuid();
        var postId = Guid.NewGuid();

        using (var scope = _factory.Services.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            await SeedForumDataAsync(context, userId, topicId, postId);
        }

        var token = await GetUserTokenAsync("forum.user@example.com", "Password123!");
        
        var request = new HttpRequestMessage(HttpMethod.Get, "/api/v1/forums/topics");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await _client.SendAsync(request);

        // Assert
        response.IsSuccessStatusCode.Should().BeTrue();
        var result = await response.Content.ReadFromJsonAsync<PaginatedResult<TopicSummaryDto>>();
        
        result.Should().NotBeNull();
        result!.Items.Should().NotBeEmpty();
        result.Items.Should().Contain(t => t.Id == topicId);
    }

    [Fact]
    public async Task CreateTopic_ReturnsCreatedTopic()
    {
        // Arrange
        var userId = Guid.NewGuid();
        using (var scope = _factory.Services.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            await SeedForumDataAsync(context, userId, Guid.NewGuid(), Guid.NewGuid());
        }

        var token = await GetUserTokenAsync("forum.user@example.com", "Password123!");
        
        var requestBody = new CreateTopicRequest
        {
            Title = "New Test Topic",
            Content = "This is the content of the new topic."
        };

        var request = new HttpRequestMessage(HttpMethod.Post, "/api/v1/forums/topics");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        request.Content = JsonContent.Create(requestBody);

        // Act
        var response = await _client.SendAsync(request);

        // Assert
        response.IsSuccessStatusCode.Should().BeTrue();
        var topic = await response.Content.ReadFromJsonAsync<TopicDetailDto>();
        
        topic.Should().NotBeNull();
        topic!.Title.Should().Be("New Test Topic");
        topic.Posts.Should().HaveCount(1);
        topic.Posts.First().Content.Should().Be("This is the content of the new topic.");
    }

    [Fact]
    public async Task CreatePost_InExistingTopic_ReturnsCreatedPost()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var topicId = Guid.NewGuid();
        using (var scope = _factory.Services.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            await SeedForumDataAsync(context, userId, topicId, Guid.NewGuid());
        }

        var token = await GetUserTokenAsync("forum.user@example.com", "Password123!");
        
        var requestBody = new CreatePostRequest
        {
            Content = "This is a reply."
        };

        var request = new HttpRequestMessage(HttpMethod.Post, $"/api/v1/forums/topics/{topicId}/posts");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        request.Content = JsonContent.Create(requestBody);

        // Act
        var response = await _client.SendAsync(request);

        // Assert
        response.IsSuccessStatusCode.Should().BeTrue();
        var post = await response.Content.ReadFromJsonAsync<PostDto>();
        
        post.Should().NotBeNull();
        post!.Content.Should().Be("This is a reply.");
    }
}

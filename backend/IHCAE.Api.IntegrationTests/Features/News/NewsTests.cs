using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using IHCAE.Api.IntegrationTests.Infrastructure;
using IHCAE.Api.Shared.Data;
using IHCAE.Api.Features.Auth.Models.Entities;
using IHCAE.Api.Features.News.Models.Entities;
using IHCAE.Api.Features.News.Models.DTOs;
using IHCAE.Api.Shared.DTOs;
using System.Net.Http.Headers;
using IHCAE.Api.Features.Auth.Models.DTOs;
using IHCAE.Api.Shared.Constants;
using IHCAE.Api.Shared.Models;

namespace IHCAE.Api.IntegrationTests.Features.News;

public class NewsTests : IntegrationTestBase
{
    public NewsTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    private async Task SeedNewsDataAsync(AppDbContext context, int authorId, int generalCategoryId, int successStoryCategoryId, int publishedArticleId, int successStoryArticleId)
    {
        // Add Author
        var existingAuthor = await context.Users.FirstOrDefaultAsync(u => u.Email == "news.author@example.com");
        if (existingAuthor == null)
        {
            var user = new User
            {
                Id = authorId,
                FirstName = "News",
                LastName = "Author",
                Email = "news.author@example.com",
                PasswordHash = "hashed",
                Status = UserStatus.Approved,
                CreatedAt = DateTime.UtcNow
            };
            context.Users.Add(user);
        }
        else
        {
            authorId = existingAuthor.Id;
        }

        // Add Categories
        var generalCategory = await context.NewsCategories.FirstOrDefaultAsync(c => c.Slug == "general-news");
        if (generalCategory == null)
        {
            generalCategory = new NewsCategory
            {
                Id = generalCategoryId,
                Name = "General News",
                Slug = "general-news",
                CreatedAt = DateTime.UtcNow
            };
            context.NewsCategories.Add(generalCategory);
        }
        else
        {
            generalCategoryId = generalCategory.Id;
        }
        
        var successCategory = await context.NewsCategories.FirstOrDefaultAsync(c => c.Slug == "success-story");
        if (successCategory == null)
        {
            successCategory = new NewsCategory
            {
                Id = successStoryCategoryId,
                Name = "Success Stories",
                Slug = "success-story",
                CreatedAt = DateTime.UtcNow
            };
            context.NewsCategories.Add(successCategory);
        }
        else
        {
            successStoryCategoryId = successCategory.Id;
        }

        // Add Articles
        if (!await context.NewsArticles.AnyAsync(a => a.Id == publishedArticleId))
        {
            context.NewsArticles.Add(new NewsArticle
            {
                Id = publishedArticleId,
                Title = "Published General News",
                Content = "Content of the general news",
                CategoryId = generalCategoryId,
                AuthorId = authorId,
                Status = ContentStatus.Published,
                PublishedAt = DateTime.UtcNow.AddDays(-1),
                CreatedAt = DateTime.UtcNow.AddDays(-2),
                ViewCount = 0
            });
        }

        if (!await context.NewsArticles.AnyAsync(a => a.Id == successStoryArticleId))
        {
            context.NewsArticles.Add(new NewsArticle
            {
                Id = successStoryArticleId,
                Title = "Published Success Story",
                Content = "Content of the success story",
                CategoryId = successStoryCategoryId,
                AuthorId = authorId,
                Status = ContentStatus.Published,
                PublishedAt = DateTime.UtcNow.AddDays(-1),
                CreatedAt = DateTime.UtcNow.AddDays(-2),
                ViewCount = 0
            });
        }

        // Add a draft article that shouldn't be returned by public endpoints
        context.NewsArticles.Add(new NewsArticle
        {
            Id = Random.Shared.Next(1, 1000000),
            Title = "Draft News",
            Content = "Draft content",
            CategoryId = generalCategoryId,
            AuthorId = authorId,
            Status = ContentStatus.Draft,
            CreatedAt = DateTime.UtcNow,
            ViewCount = 0
        });

        await context.SaveChangesAsync();
    }

    [Fact]
    public async Task GetPublishedArticles_ReturnsOnlyPublishedArticles()
    {
        // Arrange
        var authorId = Random.Shared.Next(1, 1000000);
        var generalCatId = Random.Shared.Next(1, 1000000);
        var successCatId = Random.Shared.Next(1, 1000000);
        var publishedId = Random.Shared.Next(1, 1000000);
        var successId = Random.Shared.Next(1, 1000000);

        using (var scope = _factory.Services.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            await SeedNewsDataAsync(context, authorId, generalCatId, successCatId, publishedId, successId);
        }

        // Act
        var response = await _client.GetAsync("/api/v1/news?page=1&pageSize=10");

        // Assert
        response.IsSuccessStatusCode.Should().BeTrue();
        var result = await response.Content.ReadFromJsonAsync<PaginatedResult<NewsArticleSummaryDto>>();
        
        result.Should().NotBeNull();
        result!.Items.Should().NotBeEmpty();
        
        // Ensure no draft items are returned
        result.Items.Should().OnlyContain(a => a.Status == ContentStatus.Published);
        
        // Both published general news and published success story should be returned
        result.Items.Should().Contain(a => a.Id == publishedId);
        result.Items.Should().Contain(a => a.Id == successId);
    }

    [Fact]
    public async Task GetArticleById_WithValidPublishedId_ReturnsArticle()
    {
        // Arrange
        var authorId = Random.Shared.Next(1, 1000000);
        var generalCatId = Random.Shared.Next(1, 1000000);
        var successCatId = Random.Shared.Next(1, 1000000);
        var publishedId = Random.Shared.Next(1, 1000000);
        var successId = Random.Shared.Next(1, 1000000);

        using (var scope = _factory.Services.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            await SeedNewsDataAsync(context, authorId, generalCatId, successCatId, publishedId, successId);
        }

        // Act
        var response = await _client.GetAsync($"/api/v1/news/{publishedId}");

        // Assert
        response.IsSuccessStatusCode.Should().BeTrue();
        var article = await response.Content.ReadFromJsonAsync<NewsArticleDto>();
        
        article.Should().NotBeNull();
        article!.Id.Should().Be(publishedId);
        article.Title.Should().Be("Published General News");
    }

    [Fact]
    public async Task GetSuccessStories_ReturnsOnlySuccessStories()
    {
        // Arrange
        var authorId = Random.Shared.Next(1, 1000000);
        var generalCatId = Random.Shared.Next(1, 1000000);
        var successCatId = Random.Shared.Next(1, 1000000);
        var publishedId = Random.Shared.Next(1, 1000000);
        var successId = Random.Shared.Next(1, 1000000);

        using (var scope = _factory.Services.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            await SeedNewsDataAsync(context, authorId, generalCatId, successCatId, publishedId, successId);
        }

        // Act
        var response = await _client.GetAsync("/api/v1/news/success-stories?page=1&pageSize=10");

        // Assert
        response.IsSuccessStatusCode.Should().BeTrue();
        var result = await response.Content.ReadFromJsonAsync<PaginatedResult<NewsArticleSummaryDto>>();
        
        result.Should().NotBeNull();
        result!.Items.Should().NotBeEmpty();
        
        // Ensure only success stories are returned
        result.Items.Should().OnlyContain(a => a.Category.Slug == "success-story");
        result.Items.Should().Contain(a => a.Id == successId);
        result.Items.Should().NotContain(a => a.Id == publishedId); // Should not have general news
    }

    [Fact]
    public async Task GetCategories_ReturnsAllCategories()
    {
        // Arrange
        var authorId = Random.Shared.Next(1, 1000000);
        var generalCatId = Random.Shared.Next(1, 1000000);
        var successCatId = Random.Shared.Next(1, 1000000);

        using (var scope = _factory.Services.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            await SeedNewsDataAsync(context, authorId, generalCatId, successCatId, Random.Shared.Next(1, 1000000), Random.Shared.Next(1, 1000000));
        }

        // Act
        var response = await _client.GetAsync("/api/v1/news/categories");

        // Assert
        response.IsSuccessStatusCode.Should().BeTrue();
        var result = await response.Content.ReadFromJsonAsync<List<NewsCategoryDto>>();
        
        result.Should().NotBeNull();
        result!.Should().Contain(c => c.Slug == "general-news");
        result.Should().Contain(c => c.Slug == "success-story");
    }

    private async Task<string> GetTokenAsync(string email, string password)
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
            await context.SaveChangesAsync();
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

        context.UserRoles.Add(new UserRole
        {
            UserId = userId,
            RoleId = alumniRole.Id
        });

        await context.SaveChangesAsync();
    }

    [Fact]
    public async Task SubmitContent_AsAlumni_ReturnsSuccess()
    {
        // Arrange
        var userId = Random.Shared.Next(1, 1000000);
        var email = "submit.alumni@example.com";
        var password = "Password123!";
        
        using (var scope = _factory.Services.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            
            // Seed News categories
            var generalCategory = await context.NewsCategories.FirstOrDefaultAsync(c => c.Slug == "general-news");
            if (generalCategory == null)
            {
                context.NewsCategories.Add(new NewsCategory
                {
                    Id = Random.Shared.Next(1, 1000000),
                    Name = "General News",
                    Slug = "general-news",
                    CreatedAt = DateTime.UtcNow
                });
                await context.SaveChangesAsync();
            }

            await SeedAlumniRoleAndUserAsync(context, userId, email, password, "Submitting", "Alumni");
        }

        var token = await GetTokenAsync(email, password);
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var requestBody = new SubmitContentRequest
        {
            Title = "Submit News Test Title",
            Content = "This is a long generic news content that exceeds 100 characters in length to pass validation rule checks.",
            CategorySlug = "general-news"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/v1/news/management/submit", requestBody);

        // Assert
        response.IsSuccessStatusCode.Should().BeTrue();
        var article = await response.Content.ReadFromJsonAsync<NewsArticleDto>();
        article.Should().NotBeNull();
        article!.Title.Should().Be("Submit News Test Title");
        article.Category.Slug.Should().Be("general-news");
        article.Status.Should().Be(ContentStatus.PendingReview);
    }
}

using System.Net.Http.Json;
using System.Net.Http.Headers;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using IHCAE.Api.IntegrationTests.Infrastructure;
using IHCAE.Api.Shared.Data;
using IHCAE.Api.Features.Auth.Models.Entities;
using IHCAE.Api.Features.Auth.Models.DTOs;
using IHCAE.Api.Features.Alumni.Models.DTOs;
using IHCAE.Api.Shared.Constants;
using IHCAE.Api.Shared.Models;
using IHCAE.Api.Shared.DTOs;

namespace IHCAE.Api.IntegrationTests.Features.Admin;

public class AlumniImportTests : IntegrationTestBase
{
    public AlumniImportTests(CustomWebApplicationFactory factory) : base(factory)
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

    private async Task SeedAdminUserAsync(AppDbContext context, Guid userId, string email, string password)
    {
        var adminRole = await context.Roles.FirstOrDefaultAsync(r => r.Name == RoleConstants.Admin);
        if (adminRole == null)
        {
            adminRole = new Role { Name = RoleConstants.Admin, Description = "Administrator", CreatedAt = DateTime.UtcNow };
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
    }

    [Fact]
    public async Task ImportAlumniData_WithValidCsv_ReturnsSuccessAndSavesData()
    {
        // Arrange
        var adminId = Guid.NewGuid();
        var email = "admin_import@example.com";
        var password = "Password123!";

        using (var scope = _factory.Services.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            await SeedAdminUserAsync(context, adminId, email, password);
        }

        var token = await GetAdminTokenAsync(email, password);

        var csvContent = "FirstName,LastName,Email,Course,GraduationYear,Phone,Location\n" +
                         "John,Doe,john.doe@example.com,Basic Mountaineering,2022,1234567890,Denver";

        var requestBody = new AlumniImportRequest
        {
            CsvContent = csvContent
        };

        var request = new HttpRequestMessage(HttpMethod.Post, "/api/v1/admin/alumni/import");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        request.Content = JsonContent.Create(requestBody);

        // Act
        var response = await _client.SendAsync(request);

        // Assert
        response.IsSuccessStatusCode.Should().BeTrue();
        
        var result = await response.Content.ReadFromJsonAsync<AlumniImportResult>();
        result.Should().NotBeNull();
        result!.ImportedRecords.Should().Be(1);
        result.TotalRecords.Should().Be(1);
        result.Errors.Should().BeEmpty();

        // Verify with GET endpoint
        var getRequest = new HttpRequestMessage(HttpMethod.Get, "/api/v1/admin/alumni?searchTerm=john.doe@example.com");
        getRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        
        var getResponse = await _client.SendAsync(getRequest);
        getResponse.IsSuccessStatusCode.Should().BeTrue();
        
        var getResult = await getResponse.Content.ReadFromJsonAsync<PaginatedResult<AlumniDatabaseDto>>();
        getResult.Should().NotBeNull();
        getResult!.Items.Should().ContainSingle();
        getResult.Items.First().Email.Should().Be("john.doe@example.com");
    }

    [Fact]
    public async Task ImportAlumniData_WithInvalidCsv_ReturnsErrors()
    {
        // Arrange
        var adminId = Guid.NewGuid();
        var email = "admin_import2@example.com";
        var password = "Password123!";

        using (var scope = _factory.Services.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            await SeedAdminUserAsync(context, adminId, email, password);
        }

        var token = await GetAdminTokenAsync(email, password);

        // Missing email field in data row
        var csvContent = "FirstName,LastName,Email\n" +
                         "Jane,Smith,";

        var requestBody = new AlumniImportRequest
        {
            CsvContent = csvContent
        };

        var request = new HttpRequestMessage(HttpMethod.Post, "/api/v1/admin/alumni/import");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        request.Content = JsonContent.Create(requestBody);

        // Act
        var response = await _client.SendAsync(request);

        // Assert
        response.IsSuccessStatusCode.Should().BeTrue();
        
        var result = await response.Content.ReadFromJsonAsync<AlumniImportResult>();
        result.Should().NotBeNull();
        result!.ImportedRecords.Should().Be(0);
        result.SkippedRecords.Should().Be(1);
        result.Errors.Should().NotBeEmpty();
    }
}

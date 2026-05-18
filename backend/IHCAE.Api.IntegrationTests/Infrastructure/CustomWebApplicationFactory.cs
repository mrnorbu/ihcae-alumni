using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.TestHost;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using NSubstitute;
using IHCAE.Api.Shared.Data;
using IHCAE.Api.Shared.Services;

namespace IHCAE.Api.IntegrationTests.Infrastructure;

public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    public IEmailService EmailServiceMock { get; }

    public CustomWebApplicationFactory()
    {
        EmailServiceMock = Substitute.For<IEmailService>();
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.UseSolutionRelativeContentRoot("backend/IHCAE.Api");
        
        builder.ConfigureServices(services =>
        {
            // Remove the existing DbContext configuration
            services.RemoveAll(typeof(DbContextOptions<AppDbContext>));

            // Add the test database configuration
            var connectionString = "Server=localhost;Database=ihcae_alumni_test;Uid=root;Pwd=;Port=3306;";
            var serverVersion = new MySqlServerVersion(new Version(8, 0, 36)); // Explicit version for tests to avoid AutoDetect issues on non-existent DB
            
            services.AddDbContext<AppDbContext>(options =>
            {
                options.UseMySql(connectionString, serverVersion);
            });

            // Replace the real IEmailService with our mock
            services.RemoveAll(typeof(IEmailService));
            services.AddSingleton(EmailServiceMock);
        });
    }
}

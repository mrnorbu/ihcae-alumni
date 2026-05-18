using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using IHCAE.Api.Shared.Data;
using IHCAE.Api.Shared.Services;

[assembly: Xunit.CollectionBehavior(DisableTestParallelization = true)]

namespace IHCAE.Api.IntegrationTests.Infrastructure;

public abstract class IntegrationTestBase : IClassFixture<CustomWebApplicationFactory>, IAsyncLifetime
{
    protected readonly CustomWebApplicationFactory _factory;
    protected readonly HttpClient _client;
    protected readonly IEmailService _emailServiceMock;

    protected IntegrationTestBase(CustomWebApplicationFactory factory)
    {
        _factory = factory;
        try
        {
            _client = factory.CreateClient();
        }
        catch (Exception ex)
        {
            Console.WriteLine("FACTORY STARTUP ERROR: " + ex.ToString());
            throw;
        }
        _emailServiceMock = factory.EmailServiceMock;
    }

    public Task InitializeAsync()
    {
        return Task.CompletedTask;
    }

    public Task DisposeAsync()
    {
        return Task.CompletedTask;
    }
}

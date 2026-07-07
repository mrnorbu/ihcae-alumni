using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.AspNetCore.HttpOverrides;
using Serilog;
using IHCAE.Api.Shared.Data;
using IHCAE.Api.Features.Auth.Repositories;
using IHCAE.Api.Features.Auth.Services;
using IHCAE.Api.Features.Alumni.Services;
using IHCAE.Api.Features.EmailVerification.Services;
using IHCAE.Api.Features.PasswordReset.Services;
using IHCAE.Api.Features.Profile.Services;
using IHCAE.Api.Features.Directory.Services;
using IHCAE.Api.Features.Forums.Services;
using IHCAE.Api.Features.News.Services;
using IHCAE.Api.Features.Events.Services;
using IHCAE.Api.Shared.Services;
using IHCAE.Api.Shared.Middleware;
using IHCAE.Api.Shared.Converters;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console(restrictedToMinimumLevel: Serilog.Events.LogEventLevel.Information)
    .WriteTo.File("logs/ihcae-alumni-.txt", rollingInterval: RollingInterval.Day, restrictedToMinimumLevel: Serilog.Events.LogEventLevel.Warning)
    .CreateLogger();

builder.Host.UseSerilog();

// Add services to the container
// Add services to the container
builder.Services.AddControllers()
    .AddJsonOptions(options => 
    {
        options.JsonSerializerOptions.Converters.Add(new UtcDateTimeConverter());
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database Configuration
builder.Services.AddDbContext<AppDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString));
});

// Repository Registration
builder.Services.AddScoped<IUserRepository, UserRepository>();

// HttpContextAccessor for accessing HTTP context in services
builder.Services.AddHttpContextAccessor();

// Service Registration
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IEmailVerificationService, EmailVerificationService>();
builder.Services.AddScoped<IPasswordResetService, PasswordResetService>();
builder.Services.AddScoped<IAlumniImportService, AlumniImportService>();
builder.Services.AddScoped<IProfileService, ProfileService>();
builder.Services.AddScoped<IDirectoryService, DirectoryService>();
builder.Services.AddScoped<IFileUploadService, FileUploadService>();
builder.Services.AddScoped<IUrlHelperService, UrlHelperService>();
builder.Services.AddScoped<ITagService, TagService>();
builder.Services.AddScoped<IForumService, ForumService>();
builder.Services.AddScoped<INewsService, NewsService>();
builder.Services.AddScoped<IEventService, EventService>();
builder.Services.AddScoped<IEventRegistrationService, EventRegistrationService>();

// Seed Data Service
builder.Services.AddHostedService<SeedDataService>();

// JWT Authentication Configuration
var jwtSettings = builder.Configuration.GetSection("Jwt");
var key = Encoding.ASCII.GetBytes(jwtSettings["Key"]!);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false; // Set to true in production
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidateAudience = true,
        ValidAudience = jwtSettings["Audience"],
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

// Authorization
builder.Services.AddAuthorization();

// CORS Configuration
var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() 
    ?? new[] { "http://localhost:4200" };

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Forwarded Headers Configuration (for Nginx)
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    // Trust the local loopback (Nginx)
    options.KnownIPNetworks.Clear();
    options.KnownProxies.Clear();
});

var app = builder.Build();

// Forwarded headers must be the VERY first middleware
app.UseForwardedHeaders();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Global exception handling middleware (must be early in pipeline)
app.UseMiddleware<GlobalExceptionMiddleware>();

app.UseHttpsRedirection();

// Serve static files (for uploaded images)
app.UseStaticFiles();

app.UseCors("AllowAngularApp");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Ensure database is created and migrated
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    try
    {
        if (app.Environment.IsEnvironment("Testing"))
        {
            context.Database.EnsureDeleted();
            context.Database.Migrate();
            Log.Information("Test database migrated successfully");
        }
        else
        {
            context.Database.Migrate();
            Log.Information("Database migrated and connection verified successfully");
        }
    }
    catch (Exception ex)
    {
        Log.Fatal(ex, "Database connection failed");
        throw;
    }
}

Log.Information("IHCAE Alumni Network API starting up...");

try
{
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}

public partial class Program { }
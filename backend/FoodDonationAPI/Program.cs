using System;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Scalar.AspNetCore;
using FoodDonationAPI.Data;
using FoodDonationAPI.Services;
using FoodDonationAPI.Models;
// http://localhost:5017/swagger
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });


// Configure DB Context with MySQL
builder.Services.AddDbContext<FoodDonationDbContext>(options =>
    options.UseMySql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        ServerVersion.AutoDetect(builder.Configuration.GetConnectionString("DefaultConnection"))
    ));

// Register Token Service
builder.Services.AddScoped<TokenService>();

// Configure JWT Authentication
var keyString = builder.Configuration["Jwt:Key"] ?? "SuperSecretKeyForFoodDonationSystemProject2026";
var key = Encoding.UTF8.GetBytes(keyString);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "FoodDonationAPI",
        ValidAudience = builder.Configuration["Jwt:Audience"] ?? "FoodDonationClient",
        IssuerSigningKey = new SymmetricSecurityKey(key)
    };
});

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
    {
        policy.WithOrigins(
                  "http://localhost:5173", 
                  "https://localhost:5173", 
                  "http://127.0.0.1:5173", 
                  "https://127.0.0.1:5173",
                  "http://localhost:3000", 
                  "https://localhost:3000", 
                  "http://127.0.0.1:3000", 
                  "https://127.0.0.1:3000"
              )
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Configure Native OpenAPI in .NET 9 with Scalar
builder.Services.AddOpenApi(options =>
{
    options.AddDocumentTransformer((document, context, cancellationToken) =>
    {
        document.Info.Title = "Food Donation API";
        document.Info.Version = "v1";
        document.Info.Description = "API for Food Donation Management System";

        // Setup JWT Bearer Authorization Scheme
        var securityScheme = new OpenApiSecurityScheme
        {
            Type = SecuritySchemeType.Http,
            Name = "Authorization",
            In = ParameterLocation.Header,
            Scheme = "bearer",
            BearerFormat = "JWT",
            Description = "Enter your JWT token in the format: Bearer {token}"
        };

        document.Components ??= new OpenApiComponents();
        document.Components.SecuritySchemes.Add("Bearer", securityScheme);

        // Apply Bearer Authorization globally
        var requirement = new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id = "Bearer"
                    }
                },
                Array.Empty<string>()
            }
        };

        document.SecurityRequirements.Add(requirement);
        return Task.CompletedTask;
    });
});

var app = builder.Build();

// Automatically apply migrations and seed database on startup
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<FoodDonationDbContext>();
        context.Database.EnsureCreated(); // Creates database if not exists

        // Seed Roles programmatically if empty (to prevent foreign key violations on pre-existing empty databases)
        if (!context.Roles.Any())
        {
            context.Roles.AddRange(
                new Role { Id = 1, Name = "Admin" },
                new Role { Id = 2, Name = "Donor" },
                new Role { Id = 3, Name = "NGO" },
                new Role { Id = 4, Name = "Volunteer" }
            );
            context.SaveChanges();
        }

        // Seed Food Categories programmatically if empty
        if (!context.FoodCategories.Any())
        {
            context.FoodCategories.AddRange(
                new FoodCategory { Id = 1, Name = "Rice", Description = "Rice grains, biryani, cooked rice dishes" },
                new FoodCategory { Id = 2, Name = "Fruits", Description = "Fresh fruits and fruit bowls" },
                new FoodCategory { Id = 3, Name = "Vegetables", Description = "Raw or cooked vegetable items" },
                new FoodCategory { Id = 4, Name = "Bakery", Description = "Breads, cakes, buns, and pastries" },
                new FoodCategory { Id = 5, Name = "Dairy", Description = "Milk, cheese, butter, paneer, and curd" },
                new FoodCategory { Id = 6, Name = "Meat", Description = "Chicken, mutton, fish, and other non-veg items" },
                new FoodCategory { Id = 7, Name = "Drinks", Description = "Fruit juices, water, milkshakes, and soft drinks" },
                new FoodCategory { Id = 8, Name = "Packed Food", Description = "Biscuits, chips, ready-to-eat packets, and canned food" }
            );
            context.SaveChanges();
        }

        // Seed Admin user if not exists, or verify/correct the password hash on startup
        var adminUser = context.Users.FirstOrDefault(u => u.Email == "admin@fooddonation.com");
        if (adminUser == null)
        {
            adminUser = new User
            {
                Username = "admin",
                Email = "admin@fooddonation.com",
                PasswordHash = PasswordHasher.HashPassword("admin123"),
                RoleId = 1, // Admin role
                IsActive = true
            };
            context.Users.Add(adminUser);
            context.SaveChanges();

            // Create Profile for Admin
            context.UserProfiles.Add(new UserProfile
            {
                UserId = adminUser.Id,
                Bio = "System Administrator for Food Donation Management System",
                State = "Delhi",
                District = "New Delhi",
                City = "Delhi",
                Area = "Central Admin",
                Pincode = "110001"
            });
            context.SaveChanges();
        }
        else
        {
            var expectedHash = PasswordHasher.HashPassword("admin123");
            if (adminUser.PasswordHash != expectedHash)
            {
                adminUser.PasswordHash = expectedHash;
                context.SaveChanges();
            }
        }
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while seeding the database.");
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi(); // Maps /openapi/v1.json
    app.MapScalarApiReference(options =>
    {
        options.WithTitle("Food Donation API Documentation")
               .WithTheme(ScalarTheme.DeepSpace)
               .WithDefaultHttpClient(ScalarTarget.CSharp, ScalarClient.HttpClient);
    }); // Maps Scalar API Reference UI at /scalar/v1

    // Add Swagger UI pointing to the native OpenAPI endpoint
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/openapi/v1.json", "Food Donation API v1");
        options.RoutePrefix = "swagger";
    });
}

app.UseCors("AllowReact");

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

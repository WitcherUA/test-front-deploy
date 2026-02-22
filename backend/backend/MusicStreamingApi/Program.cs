using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using MusicStreamingApi.Services;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Controllers + JSON camelCase
builder.Services.AddControllers()
    .AddJsonOptions(opts =>
        opts.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase);

// Swagger / OpenAPI for .NET 8
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)
            )
        };

        options.Events = new JwtBearerEvents
        {
            OnChallenge = async context =>
            {
                context.HandleResponse();
                context.Response.StatusCode = 401;
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsJsonAsync(new { message = "Unauthorized" });
            }
        };
    });

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.SetIsOriginAllowed(origin =>
        {
            if (string.IsNullOrEmpty(origin)) return false;
            try
            {
                var host = new Uri(origin).Host;
                return host.Equals("localhost", StringComparison.OrdinalIgnoreCase)
                    || host.Equals("soundstorm.pp.ua", StringComparison.OrdinalIgnoreCase);
            }
            catch { return false; }
        })
        .AllowAnyHeader()
        .AllowAnyMethod();
    });
});

// Dependency Injection
builder.Services.AddSingleton<MongoDbContext>();
builder.Services.AddSingleton<IMusicService, MusicService>();
builder.Services.AddSingleton<IAuthService, AuthService>();
builder.Services.AddSingleton<IUserService, UserService>();
builder.Services.AddSingleton<IFavoritesService, FavoritesService>();
builder.Services.AddSingleton<IRecentlyPlayedService, RecentlyPlayedService>();
builder.Services.AddSingleton<ISubscriptionService, SubscriptionService>();
builder.Services.AddSingleton<IPlaylistsService, PlaylistsService>();
builder.Services.AddSingleton<ISupportService, SupportService>();

var app = builder.Build();

// Global exception handler
app.UseExceptionHandler(exceptionHandlerApp =>
{
    exceptionHandlerApp.Run(async context =>
    {
        context.Response.StatusCode = 500;
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsJsonAsync(new { message = "An error occurred" });
    });
});

// CORS
app.UseCors("AllowReactApp");

// Swagger only in Development
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// HTTPS redirection only in Production
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

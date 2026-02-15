using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Bson;
using MongoDB.Driver;
using MusicStreamingApi.Dtos;
using MusicStreamingApi.Models;

namespace MusicStreamingApi.Services;

public class AuthService : IAuthService
{
    private readonly IConfiguration _config;
    private readonly MongoDbContext _db;

    public AuthService(IConfiguration config, MongoDbContext db)
    {
        _config = config;
        _db = db;
    }

    public async Task<(bool Success, string? Error, AuthResult? Result)> RegisterAsync(string username, string email, string password)
    {
        if (username.Length < 3)
            return (false, "Username must be at least 3 characters", null);
        if (!username.Any(char.IsUpper))
            return (false, "Username must contain at least one uppercase letter", null);
        if (password.Length < 5)
            return (false, "Password must be at least 5 characters", null);
        if (!password.Any(char.IsUpper))
            return (false, "Password must contain at least one uppercase letter", null);
        if (!password.Any(c => !char.IsLetterOrDigit(c)))
            return (false, "Password must contain at least one special character", null);

        var existingUser = await _db.Users.Find(u => u.Username.ToLower() == username.ToLower()).FirstOrDefaultAsync();
        if (existingUser != null)
            return (false, "Username already exists", null);
        existingUser = await _db.Users.Find(u => u.Email.ToLower() == email.ToLower()).FirstOrDefaultAsync();
        if (existingUser != null)
            return (false, "Email already exists", null);

        var user = new User
        {
            Id = ObjectId.GenerateNewId().ToString(),
            Username = username,
            Email = email,
            Password = BCrypt.Net.BCrypt.HashPassword(password),
            RegisteredAt = DateTime.UtcNow
        };

        await _db.Users.InsertOneAsync(user);

        var token = GenerateToken(user);
        var result = new AuthResult
        {
            Token = token,
            User = new UserDto { Id = user.Id, Username = user.Username, Email = user.Email, RegisteredAt = user.RegisteredAt }
        };
        return (true, null, result);
    }

    public async Task<(bool Success, string? Error, AuthResult? Result)> LoginAsync(string username, string password)
    {
        var user = await _db.Users.Find(u => u.Username.ToLower() == username.ToLower()).FirstOrDefaultAsync();
        if (user == null || !BCrypt.Net.BCrypt.Verify(password, user.Password))
            return (false, "Invalid credentials", null);

        var token = GenerateToken(user);
        var result = new AuthResult
        {
            Token = token,
            User = new UserDto { Id = user.Id, Username = user.Username, Email = user.Email, RegisteredAt = user.RegisteredAt }
        };
        return (true, null, result);
    }

    private string GenerateToken(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(ClaimTypes.Name, user.Username)
        };
        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: credentials
        );
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

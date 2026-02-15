namespace MusicStreamingApi.Services;

public interface IAuthService
{
    Task<(bool Success, string? Error, AuthResult? Result)> RegisterAsync(string username, string email, string password);
    Task<(bool Success, string? Error, AuthResult? Result)> LoginAsync(string username, string password);
}

public class AuthResult
{
    public string Token { get; set; } = string.Empty;
    public Dtos.UserDto User { get; set; } = new();
}


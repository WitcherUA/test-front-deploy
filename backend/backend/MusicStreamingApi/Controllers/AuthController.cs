using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MusicStreamingApi.Dtos;
using MusicStreamingApi.Services;

namespace MusicStreamingApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var (success, error, result) = await _authService.RegisterAsync(request.Username, request.Email, request.Password);
        if (!success)
        {
            if (error == "Username already exists" || error == "Email already exists")
                return Conflict(new { message = error });
            return BadRequest(new { message = error });
        }
        return Ok(new AuthResponse { Token = result!.Token, User = result.User });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var (success, error, result) = await _authService.LoginAsync(request.Username, request.Password);
        if (!success)
            return Unauthorized(new { message = error ?? "Invalid credentials" });
        return Ok(new AuthResponse { Token = result!.Token, User = result.User });
    }

    [HttpPost("logout")]
    [Authorize]
    public IActionResult Logout()
    {
        return Ok(new { message = "Logged out successfully" });
    }
}

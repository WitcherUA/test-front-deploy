using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MusicStreamingApi.Dtos;
using MusicStreamingApi.Services;

namespace MusicStreamingApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UserController : ControllerBase
{
    private readonly IUserService _userService;

    public UserController(IUserService userService)
    {
        _userService = userService;
    }

    private string? UserId => User.FindFirstValue(ClaimTypes.NameIdentifier);

    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        if (string.IsNullOrEmpty(UserId))
            return Unauthorized();

        var user = await _userService.GetProfileAsync(UserId);
        if (user == null)
            return NotFound(new { message = "User not found" });

        return Ok(user);
    }

    [HttpPut("settings")]
    public async Task<IActionResult> UpdateSettings([FromBody] UpdateSettingsRequest request)
    {
        if (string.IsNullOrEmpty(UserId))
            return Unauthorized();

        var updated = await _userService.UpdateSettingsAsync(UserId, request);
        if (!updated)
            return NotFound(new { message = "User not found" });

        return Ok(new { message = "Settings updated" });
    }

    [HttpDelete("account")]
    public async Task<IActionResult> DeleteAccount()
    {
        if (string.IsNullOrEmpty(UserId))
            return Unauthorized();

        await _userService.DeleteAccountAsync(UserId);
        return Ok(new { message = "Account deleted" });
    }
}

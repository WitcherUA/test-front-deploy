using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MusicStreamingApi.Models;
using MusicStreamingApi.Services;

namespace MusicStreamingApi.Controllers;

[ApiController]
[Route("api/recently-played")]
[Authorize]
public class RecentlyPlayedController : ControllerBase
{
    private readonly IRecentlyPlayedService _recentlyPlayedService;

    public RecentlyPlayedController(IRecentlyPlayedService recentlyPlayedService)
    {
        _recentlyPlayedService = recentlyPlayedService;
    }

    private string? UserId => User.FindFirstValue(ClaimTypes.NameIdentifier);

    [HttpGet]
    public async Task<IActionResult> GetRecentlyPlayed()
    {
        if (string.IsNullOrEmpty(UserId))
            return Unauthorized();

        var tracks = await _recentlyPlayedService.GetRecentlyPlayedAsync(UserId);
        return Ok(tracks);
    }

    [HttpPost("add")]
    public async Task<IActionResult> AddRecentlyPlayed([FromBody] Track track)
    {
        if (string.IsNullOrEmpty(UserId))
            return Unauthorized();

        await _recentlyPlayedService.AddRecentlyPlayedAsync(UserId, track);
        return Ok(new { message = "Added to recently played" });
    }
}

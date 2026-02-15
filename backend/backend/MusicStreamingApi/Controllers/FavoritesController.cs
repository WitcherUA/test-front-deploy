using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MusicStreamingApi.Models;
using MusicStreamingApi.Services;

namespace MusicStreamingApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FavoritesController : ControllerBase
{
    private readonly IFavoritesService _favoritesService;

    public FavoritesController(IFavoritesService favoritesService)
    {
        _favoritesService = favoritesService;
    }

    private string? UserId => User.FindFirstValue(ClaimTypes.NameIdentifier);

    [HttpGet]
    public async Task<IActionResult> GetFavorites()
    {
        if (string.IsNullOrEmpty(UserId))
            return Unauthorized();

        var tracks = await _favoritesService.GetFavoritesAsync(UserId);
        return Ok(tracks);
    }

    [HttpPost("add")]
    public async Task<IActionResult> AddFavorite([FromBody] Track track)
    {
        if (string.IsNullOrEmpty(UserId))
            return Unauthorized();

        await _favoritesService.AddFavoriteAsync(UserId, track);
        return Ok(new { message = "Added to favorites" });
    }

    [HttpDelete("{trackId:int}")]
    public async Task<IActionResult> RemoveFavorite(int trackId)
    {
        if (string.IsNullOrEmpty(UserId))
            return Unauthorized();

        await _favoritesService.RemoveFavoriteAsync(UserId, trackId);
        return Ok(new { message = "Removed from favorites" });
    }
}

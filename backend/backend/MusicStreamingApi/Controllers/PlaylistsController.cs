using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MusicStreamingApi.Dtos;
using MusicStreamingApi.Models;
using MusicStreamingApi.Services;

namespace MusicStreamingApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PlaylistsController : ControllerBase
{
    private readonly IPlaylistsService _playlistsService;

    public PlaylistsController(IPlaylistsService playlistsService)
    {
        _playlistsService = playlistsService;
    }

    private string? UserId => User.FindFirstValue(ClaimTypes.NameIdentifier);

    [HttpGet]
    public async Task<IActionResult> GetPlaylists()
    {
        if (string.IsNullOrEmpty(UserId))
            return Unauthorized();

        var playlists = await _playlistsService.GetPlaylistsAsync(UserId);
        return Ok(playlists);
    }

    [HttpPost("create")]
    public async Task<IActionResult> CreatePlaylist([FromBody] CreatePlaylistRequest request)
    {
        if (string.IsNullOrEmpty(UserId))
            return Unauthorized();

        var playlist = await _playlistsService.CreatePlaylistAsync(UserId, request.Name);
        return Ok(playlist);
    }

    [HttpDelete("{playlistId}")]
    public async Task<IActionResult> DeletePlaylist(string playlistId)
    {
        if (string.IsNullOrEmpty(UserId))
            return Unauthorized();

        var deleted = await _playlistsService.DeletePlaylistAsync(UserId, playlistId);
        if (!deleted)
            return NotFound(new { message = "Playlist not found" });
        return Ok(new { message = "Playlist deleted" });
    }

    [HttpPost("{playlistId}/tracks")]
    public async Task<IActionResult> AddTrack(string playlistId, [FromBody] Track track)
    {
        if (string.IsNullOrEmpty(UserId))
            return Unauthorized();

        var added = await _playlistsService.AddTrackAsync(UserId, playlistId, track);
        if (!added)
            return NotFound(new { message = "Playlist not found" });
        return Ok(new { message = "Track added" });
    }

    [HttpDelete("{playlistId}/tracks/{trackId:int}")]
    public async Task<IActionResult> RemoveTrack(string playlistId, int trackId)
    {
        if (string.IsNullOrEmpty(UserId))
            return Unauthorized();

        var removed = await _playlistsService.RemoveTrackAsync(UserId, playlistId, trackId);
        if (!removed)
            return NotFound(new { message = "Playlist not found" });
        return Ok(new { message = "Track removed" });
    }
}

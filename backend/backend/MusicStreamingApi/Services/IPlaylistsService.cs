using MusicStreamingApi.Models;

namespace MusicStreamingApi.Services;

public interface IPlaylistsService
{
    Task<List<Playlist>> GetPlaylistsAsync(string userId);
    Task<Playlist> CreatePlaylistAsync(string userId, string name);
    Task<bool> DeletePlaylistAsync(string userId, string playlistId);
    Task<bool> AddTrackAsync(string userId, string playlistId, Track track);
    Task<bool> RemoveTrackAsync(string userId, string playlistId, int trackId);
}

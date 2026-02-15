using MusicStreamingApi.Models;

namespace MusicStreamingApi.Services;

public interface IRecentlyPlayedService
{
    Task<List<Track>> GetRecentlyPlayedAsync(string userId);
    Task AddRecentlyPlayedAsync(string userId, Track track);
}

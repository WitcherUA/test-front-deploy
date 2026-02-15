using MusicStreamingApi.Models;

namespace MusicStreamingApi.Services;

public interface IFavoritesService
{
    Task<List<Track>> GetFavoritesAsync(string userId);
    Task AddFavoriteAsync(string userId, Track track);
    Task RemoveFavoriteAsync(string userId, int trackId);
}

using MongoDB.Driver;
using MusicStreamingApi.Models;

namespace MusicStreamingApi.Services;

public class FavoritesService : IFavoritesService
{
    private readonly MongoDbContext _db;

    public FavoritesService(MongoDbContext db)
    {
        _db = db;
    }

    public async Task<List<Track>> GetFavoritesAsync(string userId)
    {
        var doc = await _db.Favorites.Find(f => f.UserId == userId).FirstOrDefaultAsync();
        return doc?.Tracks ?? new List<Track>();
    }

    public async Task AddFavoriteAsync(string userId, Track track)
    {
        var doc = await _db.Favorites.Find(f => f.UserId == userId).FirstOrDefaultAsync();
        if (doc == null)
        {
            doc = new UserFavorites { UserId = userId, Tracks = new List<Track>() };
            await _db.Favorites.InsertOneAsync(doc);
        }
        if (!doc.Tracks.Any(t => t.Id == track.Id))
        {
            doc.Tracks.Add(track);
            await _db.Favorites.ReplaceOneAsync(f => f.UserId == userId, doc);
        }
    }

    public async Task RemoveFavoriteAsync(string userId, int trackId)
    {
        var doc = await _db.Favorites.Find(f => f.UserId == userId).FirstOrDefaultAsync();
        if (doc != null)
        {
            doc.Tracks.RemoveAll(t => t.Id == trackId);
            await _db.Favorites.ReplaceOneAsync(f => f.UserId == userId, doc);
        }
    }
}

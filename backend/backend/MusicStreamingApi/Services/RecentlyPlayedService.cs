using MongoDB.Driver;
using MusicStreamingApi.Models;

namespace MusicStreamingApi.Services;

public class RecentlyPlayedService : IRecentlyPlayedService
{
    private const int MaxTracks = 20;
    private readonly MongoDbContext _db;

    public RecentlyPlayedService(MongoDbContext db)
    {
        _db = db;
    }

    public async Task<List<Track>> GetRecentlyPlayedAsync(string userId)
    {
        var doc = await _db.RecentlyPlayed.Find(r => r.UserId == userId).FirstOrDefaultAsync();
        return doc?.Tracks ?? new List<Track>();
    }

    public async Task AddRecentlyPlayedAsync(string userId, Track track)
    {
        var doc = await _db.RecentlyPlayed.Find(r => r.UserId == userId).FirstOrDefaultAsync();
        if (doc == null)
        {
            doc = new UserRecentlyPlayed { UserId = userId, Tracks = new List<Track>() };
            await _db.RecentlyPlayed.InsertOneAsync(doc);
        }
        doc.Tracks.RemoveAll(t => t.Id == track.Id);
        doc.Tracks.Insert(0, track);
        doc.Tracks = doc.Tracks.Take(MaxTracks).ToList();
        await _db.RecentlyPlayed.ReplaceOneAsync(r => r.UserId == userId, doc);
    }
}

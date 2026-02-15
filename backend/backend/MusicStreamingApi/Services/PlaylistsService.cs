using MongoDB.Bson;
using MongoDB.Driver;
using MusicStreamingApi.Models;

namespace MusicStreamingApi.Services;

public class PlaylistsService : IPlaylistsService
{
    private readonly MongoDbContext _db;

    public PlaylistsService(MongoDbContext db)
    {
        _db = db;
    }

    public async Task<List<Playlist>> GetPlaylistsAsync(string userId)
    {
        return await _db.Playlists.Find(p => p.UserId == userId).ToListAsync();
    }

    public async Task<Playlist> CreatePlaylistAsync(string userId, string name)
    {
        var playlist = new Playlist
        {
            Id = ObjectId.GenerateNewId().ToString(),
            UserId = userId,
            Name = name,
            Tracks = new List<Track>(),
            CreatedAt = DateTime.UtcNow
        };
        await _db.Playlists.InsertOneAsync(playlist);
        return playlist;
    }

    public async Task<bool> DeletePlaylistAsync(string userId, string playlistId)
    {
        var result = await _db.Playlists.DeleteOneAsync(p => p.Id == playlistId && p.UserId == userId);
        return result.DeletedCount > 0;
    }

    public async Task<bool> AddTrackAsync(string userId, string playlistId, Track track)
    {
        var playlist = await _db.Playlists.Find(p => p.Id == playlistId && p.UserId == userId).FirstOrDefaultAsync();
        if (playlist == null) return false;
        if (!playlist.Tracks.Any(t => t.Id == track.Id))
        {
            playlist.Tracks.Add(track);
            await _db.Playlists.ReplaceOneAsync(p => p.Id == playlistId && p.UserId == userId, playlist);
        }
        return true;
    }

    public async Task<bool> RemoveTrackAsync(string userId, string playlistId, int trackId)
    {
        var playlist = await _db.Playlists.Find(p => p.Id == playlistId && p.UserId == userId).FirstOrDefaultAsync();
        if (playlist == null) return false;
        playlist.Tracks.RemoveAll(t => t.Id == trackId);
        await _db.Playlists.ReplaceOneAsync(p => p.Id == playlistId && p.UserId == userId, playlist);
        return true;
    }
}

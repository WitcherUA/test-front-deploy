using MongoDB.Driver;
using MusicStreamingApi.Dtos;
using MusicStreamingApi.Models;

namespace MusicStreamingApi.Services;

public class UserService : IUserService
{
    private readonly MongoDbContext _db;

    public UserService(MongoDbContext db)
    {
        _db = db;
    }

    public async Task<UserDto?> GetProfileAsync(string userId)
    {
        var user = await _db.Users.Find(u => u.Id == userId).FirstOrDefaultAsync();
        if (user == null) return null;
        return new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            RegisteredAt = user.RegisteredAt
        };
    }

    public async Task<bool> UpdateSettingsAsync(string userId, UpdateSettingsRequest settings)
    {
        var user = await _db.Users.Find(u => u.Id == userId).FirstOrDefaultAsync();
        if (user == null) return false;

        user.Settings ??= new UserSettings();
        if (settings.AutoPlay.HasValue) user.Settings.AutoPlay = settings.AutoPlay.Value;
        if (settings.SleepTimer.HasValue) user.Settings.SleepTimer = settings.SleepTimer.Value;

        await _db.Users.ReplaceOneAsync(u => u.Id == userId, user);
        return true;
    }

    public async Task DeleteAccountAsync(string userId)
    {
        await _db.Users.DeleteOneAsync(u => u.Id == userId);
        await _db.Favorites.DeleteManyAsync(f => f.UserId == userId);
        await _db.RecentlyPlayed.DeleteManyAsync(r => r.UserId == userId);
        await _db.Playlists.DeleteManyAsync(p => p.UserId == userId);
        await _db.Subscriptions.DeleteManyAsync(s => s.UserId == userId);
        await _db.SupportMessages.DeleteManyAsync(m => m.UserId == userId);
    }
}

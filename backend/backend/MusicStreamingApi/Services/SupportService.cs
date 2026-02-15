using MongoDB.Bson;
using MongoDB.Driver;
using MusicStreamingApi.Models;

namespace MusicStreamingApi.Services;

public class SupportService : ISupportService
{
    private readonly MongoDbContext _db;

    public SupportService(MongoDbContext db)
    {
        _db = db;
    }

    public async Task SendMessageAsync(string userId, string message)
    {
        var supportMessage = new SupportMessage
        {
            Id = ObjectId.GenerateNewId().ToString(),
            UserId = userId,
            Message = message,
            CreatedAt = DateTime.UtcNow
        };
        await _db.SupportMessages.InsertOneAsync(supportMessage);
    }
}

using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace MusicStreamingApi.Models;

public class User
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public DateTime RegisteredAt { get; set; }
    public UserSettings? Settings { get; set; }
}

public class UserSettings
{
    public bool AutoPlay { get; set; } = true;
    public int SleepTimer { get; set; }
}


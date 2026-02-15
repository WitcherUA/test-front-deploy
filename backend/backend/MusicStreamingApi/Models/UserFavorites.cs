using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace MusicStreamingApi.Models;

public class UserFavorites
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public List<Track> Tracks { get; set; } = new();
}

using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace MusicStreamingApi.Models;

public class SupportMessage
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

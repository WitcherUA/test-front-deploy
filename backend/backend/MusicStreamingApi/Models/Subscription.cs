using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace MusicStreamingApi.Models;

public class Subscription
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string Plan { get; set; } = "free";
    public string? TxHash { get; set; }
    public string? Amount { get; set; }
    public string? WalletAddress { get; set; }
    public DateTime UpdatedAt { get; set; }
}

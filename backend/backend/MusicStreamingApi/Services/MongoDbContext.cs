using MongoDB.Driver;

namespace MusicStreamingApi.Services;

public class MongoDbContext
{
    private readonly IMongoDatabase _db;

    public MongoDbContext(IConfiguration config)
    {
        var client = new MongoClient(config["MongoDb:ConnectionString"]);
        _db = client.GetDatabase(config["MongoDb:DatabaseName"]);
    }

    public IMongoCollection<Models.User> Users => _db.GetCollection<Models.User>("users");
    public IMongoCollection<Models.UserFavorites> Favorites => _db.GetCollection<Models.UserFavorites>("favorites");
    public IMongoCollection<Models.UserRecentlyPlayed> RecentlyPlayed => _db.GetCollection<Models.UserRecentlyPlayed>("recently_played");
    public IMongoCollection<Models.Playlist> Playlists => _db.GetCollection<Models.Playlist>("playlists");
    public IMongoCollection<Models.Subscription> Subscriptions => _db.GetCollection<Models.Subscription>("subscriptions");
    public IMongoCollection<Models.SupportMessage> SupportMessages => _db.GetCollection<Models.SupportMessage>("support_messages");
}

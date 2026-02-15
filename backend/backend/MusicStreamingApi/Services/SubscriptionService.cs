using MongoDB.Driver;
using MusicStreamingApi.Models;

namespace MusicStreamingApi.Services;

public class SubscriptionService : ISubscriptionService
{
    private readonly MongoDbContext _db;

    public SubscriptionService(MongoDbContext db)
    {
        _db = db;
    }

    public async Task<string> GetCurrentPlanAsync(string userId)
    {
        var sub = await _db.Subscriptions.Find(s => s.UserId == userId).FirstOrDefaultAsync();
        return sub?.Plan ?? "free";
    }

    public async Task PurchaseAsync(string userId, string plan, string txHash, string amount, string walletAddress)
    {
        var sub = await _db.Subscriptions.Find(s => s.UserId == userId).FirstOrDefaultAsync();
        if (sub == null)
        {
            sub = new Subscription
            {
                UserId = userId,
                Plan = plan,
                TxHash = txHash,
                Amount = amount,
                WalletAddress = walletAddress,
                UpdatedAt = DateTime.UtcNow
            };
            await _db.Subscriptions.InsertOneAsync(sub);
        }
        else
        {
            sub.Plan = plan;
            sub.TxHash = txHash;
            sub.Amount = amount;
            sub.WalletAddress = walletAddress;
            sub.UpdatedAt = DateTime.UtcNow;
            await _db.Subscriptions.ReplaceOneAsync(s => s.UserId == userId, sub);
        }
    }

    public async Task DowngradeAsync(string userId)
    {
        var sub = await _db.Subscriptions.Find(s => s.UserId == userId).FirstOrDefaultAsync();
        if (sub != null)
        {
            sub.Plan = "free";
            sub.UpdatedAt = DateTime.UtcNow;
            await _db.Subscriptions.ReplaceOneAsync(s => s.UserId == userId, sub);
        }
    }
}

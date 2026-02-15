namespace MusicStreamingApi.Services;

public interface ISubscriptionService
{
    Task<string> GetCurrentPlanAsync(string userId);
    Task PurchaseAsync(string userId, string plan, string txHash, string amount, string walletAddress);
    Task DowngradeAsync(string userId);
}

using System.ComponentModel.DataAnnotations;

namespace MusicStreamingApi.Dtos;

public class PurchaseSubscriptionRequest
{
    [Required]
    public string Plan { get; set; } = string.Empty;
    public string? TxHash { get; set; }
    public string? Amount { get; set; }
    public string? WalletAddress { get; set; }
}

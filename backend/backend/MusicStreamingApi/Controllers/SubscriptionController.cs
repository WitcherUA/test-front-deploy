using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MusicStreamingApi.Dtos;
using MusicStreamingApi.Services;

namespace MusicStreamingApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SubscriptionController : ControllerBase
{
    private readonly ISubscriptionService _subscriptionService;

    public SubscriptionController(ISubscriptionService subscriptionService)
    {
        _subscriptionService = subscriptionService;
    }

    private string? UserId => User.FindFirstValue(ClaimTypes.NameIdentifier);

    [HttpGet("current")]
    public async Task<IActionResult> GetCurrent()
    {
        if (string.IsNullOrEmpty(UserId))
            return Unauthorized();

        var plan = await _subscriptionService.GetCurrentPlanAsync(UserId);
        return Ok(new { plan });
    }

    [HttpPost("purchase")]
    public async Task<IActionResult> Purchase([FromBody] PurchaseSubscriptionRequest request)
    {
        if (string.IsNullOrEmpty(UserId))
            return Unauthorized();

        await _subscriptionService.PurchaseAsync(
            UserId,
            request.Plan,
            request.TxHash ?? "",
            request.Amount ?? "",
            request.WalletAddress ?? "");
        return Ok(new { message = "Subscription updated" });
    }

    [HttpPost("downgrade")]
    public async Task<IActionResult> Downgrade()
    {
        if (string.IsNullOrEmpty(UserId))
            return Unauthorized();

        await _subscriptionService.DowngradeAsync(UserId);
        return Ok(new { message = "Subscription downgraded" });
    }
}

using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MusicStreamingApi.Dtos;
using MusicStreamingApi.Services;

namespace MusicStreamingApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SupportController : ControllerBase
{
    private readonly ISupportService _supportService;

    public SupportController(ISupportService supportService)
    {
        _supportService = supportService;
    }

    private string? UserId => User.FindFirstValue(ClaimTypes.NameIdentifier);

    [HttpPost("message")]
    public async Task<IActionResult> SendMessage([FromBody] SupportMessageRequest request)
    {
        if (string.IsNullOrEmpty(UserId))
            return Unauthorized();

        await _supportService.SendMessageAsync(UserId, request.Message);
        return Ok(new { message = "Support message sent" });
    }
}

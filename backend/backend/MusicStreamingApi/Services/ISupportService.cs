namespace MusicStreamingApi.Services;

public interface ISupportService
{
    Task SendMessageAsync(string userId, string message);
}

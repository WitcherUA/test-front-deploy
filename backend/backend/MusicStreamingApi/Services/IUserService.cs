using MusicStreamingApi.Dtos;

namespace MusicStreamingApi.Services;

public interface IUserService
{
    Task<UserDto?> GetProfileAsync(string userId);
    Task<bool> UpdateSettingsAsync(string userId, UpdateSettingsRequest settings);
    Task DeleteAccountAsync(string userId);
}

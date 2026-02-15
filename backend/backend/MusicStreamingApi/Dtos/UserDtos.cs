namespace MusicStreamingApi.Dtos;

public class UpdateSettingsRequest
{
    public bool? AutoPlay { get; set; }
    public int? SleepTimer { get; set; }
}

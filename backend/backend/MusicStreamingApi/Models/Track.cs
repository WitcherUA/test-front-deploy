using System.Text.Json.Serialization;

namespace MusicStreamingApi.Models;

public class Track
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Preview { get; set; } = string.Empty;
    public int Duration { get; set; }
    public Artist Artist { get; set; } = new();
    public Album Album { get; set; } = new();
    [JsonPropertyName("cover_small")]
    public string CoverSmall { get; set; } = string.Empty;
    [JsonPropertyName("cover_large")]
    public string CoverLarge { get; set; } = string.Empty;
}

public class Artist
{
    public string Name { get; set; } = string.Empty;
}

public class Album
{
    public string Title { get; set; } = string.Empty;
    [JsonPropertyName("cover_small")]
    public string CoverSmall { get; set; } = string.Empty;
    [JsonPropertyName("cover_large")]
    public string CoverLarge { get; set; } = string.Empty;
}


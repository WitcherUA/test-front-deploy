using System.ComponentModel.DataAnnotations;

namespace MusicStreamingApi.Dtos;

public class CreatePlaylistRequest
{
    [Required]
    [MinLength(1)]
    public string Name { get; set; } = string.Empty;
}

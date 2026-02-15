using System.ComponentModel.DataAnnotations;

namespace MusicStreamingApi.Dtos;

public class SupportMessageRequest
{
    [Required]
    public string Message { get; set; } = string.Empty;
}

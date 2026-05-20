namespace IHCAE.Api.Features.Alumni.Models.DTOs;

/// <summary>
/// Result object returned from bulk account generation operations.
/// </summary>
public class BulkGenerateResultDto
{
    public int GeneratedCount { get; set; }
    public int LinkedCount { get; set; }
    public List<string> Errors { get; set; } = new();
}

using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;

namespace IHCAE.Api.Shared.Helpers;

public static class SlugHelper
{
    public static string GenerateSlug(string title)
    {
        if (string.IsNullOrWhiteSpace(title)) return "";
        string str = title.ToLower();
        str = Regex.Replace(str, @"[^a-z0-9\s-]", "");
        str = Regex.Replace(str, @"\s+", " ").Trim();
        str = str.Substring(0, str.Length <= 200 ? str.Length : 200).Trim();
        str = Regex.Replace(str, @"\s", "-");
        return str;
    }
}

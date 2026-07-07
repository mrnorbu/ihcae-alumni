using System;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace IHCAE.Api.Shared.Converters;

public class UtcDateTimeConverter : JsonConverter<DateTime>
{
    public override DateTime Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        return reader.GetDateTime().ToUniversalTime();
    }

    public override void Write(Utf8JsonWriter writer, DateTime value, JsonSerializerOptions options)
    {
        // Dates are stored as UTC in the database (via DateTime.UtcNow).
        // EF Core returns them as Unspecified. We must treat them as UTC.
        var date = value.Kind == DateTimeKind.Unspecified 
            ? DateTime.SpecifyKind(value, DateTimeKind.Utc) 
            : value;
            
        // Convert to UTC just in case it was somehow Local
        var utcDate = date.ToUniversalTime();
        writer.WriteStringValue(utcDate.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"));
    }
}

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
        // Pomelo MySQL driver converts UTC to server local time (e.g., IST) on insert
        // and returns it as Unspecified. We must treat Unspecified as Local.
        var date = value.Kind == DateTimeKind.Unspecified 
            ? DateTime.SpecifyKind(value, DateTimeKind.Local) 
            : value;
            
        // Convert to UTC before sending to client so client can properly convert back to its local time
        var utcDate = date.ToUniversalTime();
        writer.WriteStringValue(utcDate.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"));
    }
}

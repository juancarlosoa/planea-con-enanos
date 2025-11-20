using System.Text;
using System.Text.RegularExpressions;

namespace PCE.Shared.Abstractions.Domain;

public sealed class Slug
{
    public string Value { get; }

    private Slug(string value) => Value = value;

    public static Slug Create(string phrase)
    {
        if (string.IsNullOrWhiteSpace(phrase))
            throw new ArgumentException("Cannot create slug from empty phrase");

        return new Slug(GenerateSlug(phrase));
    }

    public override string ToString() => Value;

    private static string GenerateSlug(string phrase)
    {
        string str = phrase.ToLowerInvariant();
        str = RemoveDiacritics(str);
        str = Regex.Replace(str, @"[^a-z0-9\s-]", "");
        str = Regex.Replace(str, @"\s+", " ").Trim();
        str = str[..Math.Min(80, str.Length)];
        str = Regex.Replace(str, @"\s", "-");
        return str;
    }

    private static string RemoveDiacritics(string text)
    {
        var normalized = text.Normalize(NormalizationForm.FormD);
        var sb = new StringBuilder();
        foreach (var c in normalized)
        {
            if (System.Globalization.CharUnicodeInfo.GetUnicodeCategory(c) != System.Globalization.UnicodeCategory.NonSpacingMark)
                sb.Append(c);
        }
        return sb.ToString().Normalize(NormalizationForm.FormC);
    }

    public override bool Equals(object? obj) => obj is Slug other && Value == other.Value;
    public override int GetHashCode() => Value.GetHashCode();
}
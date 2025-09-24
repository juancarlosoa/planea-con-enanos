namespace EscapeRoomPlanner.Domain.ValueObjects;

public class PriceRange : ValueObject
{
    public decimal MinPrice { get; private set; }
    public decimal MaxPrice { get; private set; }
    public string Currency { get; private set; }

    private PriceRange() { } // For EF Core

    public PriceRange(decimal minPrice, decimal maxPrice, string currency = "EUR")
    {
        if (minPrice < 0)
            throw new ArgumentException("Minimum price cannot be negative", nameof(minPrice));
        if (maxPrice < 0)
            throw new ArgumentException("Maximum price cannot be negative", nameof(maxPrice));
        if (minPrice > maxPrice)
            throw new ArgumentException("Minimum price cannot be greater than maximum price");
        if (string.IsNullOrWhiteSpace(currency))
            throw new ArgumentException("Currency cannot be empty", nameof(currency));

        MinPrice = minPrice;
        MaxPrice = maxPrice;
        Currency = currency.ToUpperInvariant();
    }

    public static PriceRange Create(decimal price, string currency = "EUR")
    {
        return new PriceRange(price, price, currency);
    }

    public bool Contains(decimal price)
    {
        return price >= MinPrice && price <= MaxPrice;
    }

    public decimal GetAveragePrice()
    {
        return (MinPrice + MaxPrice) / 2;
    }

    public bool IsFixedPrice()
    {
        return MinPrice == MaxPrice;
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return MinPrice;
        yield return MaxPrice;
        yield return Currency;
    }

    public override string ToString()
    {
        if (IsFixedPrice())
            return $"{MinPrice:C} {Currency}";
        
        return $"{MinPrice:C} - {MaxPrice:C} {Currency}";
    }
}
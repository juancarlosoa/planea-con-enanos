namespace EscapeRoomPlanner.Domain.ValueObjects;

public class Coordinates : ValueObject
{
    public double Latitude { get; private set; }
    public double Longitude { get; private set; }

    private Coordinates() { } // For EF Core

    public Coordinates(double latitude, double longitude)
    {
        if (latitude < -90 || latitude > 90)
            throw new ArgumentOutOfRangeException(nameof(latitude), "Latitude must be between -90 and 90 degrees");
        if (longitude < -180 || longitude > 180)
            throw new ArgumentOutOfRangeException(nameof(longitude), "Longitude must be between -180 and 180 degrees");

        Latitude = latitude;
        Longitude = longitude;
    }

    public double DistanceTo(Coordinates other)
    {
        if (other == null)
            throw new ArgumentNullException(nameof(other));

        // Haversine formula for calculating distance between two points on Earth
        const double earthRadiusKm = 6371.0;
        
        var lat1Rad = ToRadians(Latitude);
        var lat2Rad = ToRadians(other.Latitude);
        var deltaLatRad = ToRadians(other.Latitude - Latitude);
        var deltaLonRad = ToRadians(other.Longitude - Longitude);

        var a = Math.Sin(deltaLatRad / 2) * Math.Sin(deltaLatRad / 2) +
                Math.Cos(lat1Rad) * Math.Cos(lat2Rad) *
                Math.Sin(deltaLonRad / 2) * Math.Sin(deltaLonRad / 2);
        
        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        
        return earthRadiusKm * c;
    }

    private static double ToRadians(double degrees)
    {
        return degrees * Math.PI / 180.0;
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Latitude;
        yield return Longitude;
    }

    public override string ToString()
    {
        return $"({Latitude:F6}, {Longitude:F6})";
    }
}
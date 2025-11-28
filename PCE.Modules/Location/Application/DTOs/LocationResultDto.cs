namespace PCE.Modules.Location.Application.DTOs;

public record LocationResultDto(
    string Lat,
    string Lon,
    string DisplayName
);
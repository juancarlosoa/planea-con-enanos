using PCE.Modules.EscapeManagement.Application.EscapeRooms.DTOs;

namespace PCE.Modules.EscapeManagement.Application.Companies.DTOs;

public record CompanyDto(
    string Slug,
    string Name,
    string Email,
    string Phone,
    double Latitude,
    double Longitude,
    string? Address,
    string? Website,
    DateTime CreatedAt,
    DateTime? UpdatedAt,
    List<EscapeRoomDto> EscapeRooms
);
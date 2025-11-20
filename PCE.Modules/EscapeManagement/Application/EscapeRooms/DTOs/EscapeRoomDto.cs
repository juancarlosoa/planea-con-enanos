namespace PCE.Modules.EscapeManagement.Application.EscapeRooms.DTOs;

public record EscapeRoomDto(
    Guid Id,
    string Slug,
    string Name,
    string Description,
    int MaxPlayers,
    int MinPlayers,
    int DurationMinutes,
    string DifficultyLevel,
    decimal PricePerPerson,
    bool IsActive,
    Guid CompanyId,
    string CompanySlug,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);
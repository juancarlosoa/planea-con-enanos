using MediatR;
using PCE.Shared.Primitives;

namespace PCE.Modules.EscapeManagement.Application.EscapeRooms.Create;

public record CreateEscapeRoomCommand(
    string Name,
    string Description,
    int MaxPlayers,
    int MinPlayers,
    int DurationMinutes,
    string DifficultyLevel,
    decimal PricePerPerson,
    string CompanySlug,
    string Address) : IRequest<Result<string>>;

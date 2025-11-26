using MediatR;
using PCE.Shared.Primitives;

namespace PCE.Modules.EscapeManagement.Application.EscapeRooms.Update;

public record UpdateEscapeRoomCommand(
    string Slug,
    string Name,
    string Description,
    int MaxPlayers,
    int MinPlayers,
    int DurationMinutes,
    string DifficultyLevel,
    decimal PricePerPerson,
    string Address) : IRequest<Result<string>>;

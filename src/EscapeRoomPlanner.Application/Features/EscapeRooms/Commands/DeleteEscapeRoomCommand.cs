using MediatR;

namespace EscapeRoomPlanner.Application.Features.EscapeRooms.Commands;

public record DeleteEscapeRoomCommand(Guid Id) : IRequest<bool>;
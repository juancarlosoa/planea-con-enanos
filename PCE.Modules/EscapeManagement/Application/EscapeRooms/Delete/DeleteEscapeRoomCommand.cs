using MediatR;
using PCE.Shared.Primitives;

namespace PCE.Modules.EscapeManagement.Application.EscapeRooms.Delete;

public record DeleteEscapeRoomCommand(string Slug) : IRequest<Result>;

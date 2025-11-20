using MediatR;
using PCE.Modules.EscapeManagement.Application.EscapeRooms.DTOs;
using PCE.Shared.Primitives;

namespace PCE.Modules.EscapeManagement.Application.EscapeRooms.GetAll;

public record GetAllEscapeRoomsQuery() : IRequest<Result<List<EscapeRoomDto>>>;

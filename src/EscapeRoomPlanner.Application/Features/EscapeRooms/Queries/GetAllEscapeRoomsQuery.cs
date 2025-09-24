using EscapeRoomPlanner.Application.Features.EscapeRooms.DTOs;
using MediatR;

namespace EscapeRoomPlanner.Application.Features.EscapeRooms.Queries;

public record GetAllEscapeRoomsQuery : IRequest<IEnumerable<EscapeRoomDto>>;
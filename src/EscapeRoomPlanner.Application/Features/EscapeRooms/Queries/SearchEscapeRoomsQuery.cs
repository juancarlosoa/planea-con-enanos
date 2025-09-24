using EscapeRoomPlanner.Application.Features.EscapeRooms.DTOs;
using EscapeRoomPlanner.Domain.Interfaces;
using MediatR;

namespace EscapeRoomPlanner.Application.Features.EscapeRooms.Queries;

public record SearchEscapeRoomsQuery(EscapeRoomSearchFilters Filters) : IRequest<IEnumerable<EscapeRoomDto>>;
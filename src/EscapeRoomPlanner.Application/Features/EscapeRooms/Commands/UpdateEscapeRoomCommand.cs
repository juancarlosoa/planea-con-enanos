using EscapeRoomPlanner.Application.Features.EscapeRooms.DTOs;
using MediatR;

namespace EscapeRoomPlanner.Application.Features.EscapeRooms.Commands;

public record UpdateEscapeRoomCommand(Guid Id, UpdateEscapeRoomDto EscapeRoom) : IRequest<EscapeRoomDto>;
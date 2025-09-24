using EscapeRoomPlanner.Application.Features.EscapeRooms.DTOs;
using MediatR;

namespace EscapeRoomPlanner.Application.Features.EscapeRooms.Commands;

public record CreateEscapeRoomCommand(CreateEscapeRoomDto EscapeRoom) : IRequest<EscapeRoomDto>;
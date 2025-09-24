using EscapeRoomPlanner.Application.Features.EscapeRooms.DTOs;
using EscapeRoomPlanner.Application.Features.EscapeRooms.Mappers;
using EscapeRoomPlanner.Application.Features.EscapeRooms.Queries;
using EscapeRoomPlanner.Domain.Interfaces;
using MediatR;

namespace EscapeRoomPlanner.Application.Features.EscapeRooms.Handlers;

public class GetEscapeRoomByIdHandler : IRequestHandler<GetEscapeRoomByIdQuery, EscapeRoomDto?>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetEscapeRoomByIdHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<EscapeRoomDto?> Handle(GetEscapeRoomByIdQuery request, CancellationToken cancellationToken)
    {
        var escapeRoom = await _unitOfWork.EscapeRooms.GetByIdAsync(request.Id, cancellationToken);
        return escapeRoom != null ? EscapeRoomMapper.ToDto(escapeRoom) : null;
    }
}
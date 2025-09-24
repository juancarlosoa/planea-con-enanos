using EscapeRoomPlanner.Application.Features.EscapeRooms.Commands;
using EscapeRoomPlanner.Application.Features.EscapeRooms.DTOs;
using EscapeRoomPlanner.Application.Features.EscapeRooms.Mappers;
using EscapeRoomPlanner.Domain.Interfaces;
using MediatR;

namespace EscapeRoomPlanner.Application.Features.EscapeRooms.Handlers;

public class CreateEscapeRoomHandler : IRequestHandler<CreateEscapeRoomCommand, EscapeRoomDto>
{
    private readonly IUnitOfWork _unitOfWork;

    public CreateEscapeRoomHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<EscapeRoomDto> Handle(CreateEscapeRoomCommand request, CancellationToken cancellationToken)
    {
        var escapeRoom = EscapeRoomMapper.ToEntity(request.EscapeRoom);
        
        var createdEscapeRoom = await _unitOfWork.EscapeRooms.AddAsync(escapeRoom, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        
        return EscapeRoomMapper.ToDto(createdEscapeRoom);
    }
}
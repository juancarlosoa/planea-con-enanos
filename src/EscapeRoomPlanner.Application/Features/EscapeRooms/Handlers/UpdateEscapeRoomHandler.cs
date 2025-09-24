using EscapeRoomPlanner.Application.Features.EscapeRooms.Commands;
using EscapeRoomPlanner.Application.Features.EscapeRooms.DTOs;
using EscapeRoomPlanner.Application.Features.EscapeRooms.Mappers;
using EscapeRoomPlanner.Domain.Enums;
using EscapeRoomPlanner.Domain.Interfaces;
using MediatR;

namespace EscapeRoomPlanner.Application.Features.EscapeRooms.Handlers;

public class UpdateEscapeRoomHandler : IRequestHandler<UpdateEscapeRoomCommand, EscapeRoomDto>
{
    private readonly IUnitOfWork _unitOfWork;

    public UpdateEscapeRoomHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<EscapeRoomDto> Handle(UpdateEscapeRoomCommand request, CancellationToken cancellationToken)
    {
        var escapeRoom = await _unitOfWork.EscapeRooms.GetByIdAsync(request.Id, cancellationToken);
        if (escapeRoom == null)
        {
            throw new KeyNotFoundException($"Escape room with ID {request.Id} not found");
        }

        var difficulty = Enum.Parse<DifficultyLevel>(request.EscapeRoom.Difficulty, ignoreCase: true);
        escapeRoom.UpdateBasicInfo(
            request.EscapeRoom.Name,
            request.EscapeRoom.Description,
            request.EscapeRoom.EstimatedDuration,
            difficulty);

        var updatedEscapeRoom = await _unitOfWork.EscapeRooms.UpdateAsync(escapeRoom, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return EscapeRoomMapper.ToDto(updatedEscapeRoom);
    }
}
using EscapeRoomPlanner.Application.Features.EscapeRooms.Commands;
using EscapeRoomPlanner.Domain.Interfaces;
using MediatR;

namespace EscapeRoomPlanner.Application.Features.EscapeRooms.Handlers;

public class DeleteEscapeRoomHandler : IRequestHandler<DeleteEscapeRoomCommand, bool>
{
    private readonly IUnitOfWork _unitOfWork;

    public DeleteEscapeRoomHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(DeleteEscapeRoomCommand request, CancellationToken cancellationToken)
    {
        var exists = await _unitOfWork.EscapeRooms.ExistsAsync(request.Id, cancellationToken);
        if (!exists)
        {
            return false;
        }

        await _unitOfWork.EscapeRooms.DeleteAsync(request.Id, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return true;
    }
}
using MediatR;
using PCE.Modules.EscapeManagement.Domain.EscapeRooms.Repositories;
using PCE.Shared.Abstractions.Persistence;
using PCE.Shared.Primitives;

namespace PCE.Modules.EscapeManagement.Application.EscapeRooms.Delete;

public class DeleteEscapeRoomCommandHandler : IRequestHandler<DeleteEscapeRoomCommand, Result>
{
    private readonly IEscapeRoomRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteEscapeRoomCommandHandler(IEscapeRoomRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(DeleteEscapeRoomCommand request, CancellationToken cancellationToken)
    {
        var escapeRoom = await _repository.GetBySlugAsync(request.Slug, cancellationToken);

        if (escapeRoom is null)
        {
            return Result.Failure("EscapeRoom not found", "EscapeRoom.NotFound");
        }

        _repository.Remove(escapeRoom);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}

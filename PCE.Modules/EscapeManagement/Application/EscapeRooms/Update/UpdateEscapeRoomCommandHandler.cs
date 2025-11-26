using MediatR;
using PCE.Modules.EscapeManagement.Domain.EscapeRooms.Repositories;
using PCE.Shared.Abstractions.Persistence;
using PCE.Shared.Primitives;
using PCE.Modules.EscapeManagement.Application.Services;

namespace PCE.Modules.EscapeManagement.Application.EscapeRooms.Update;

public class UpdateEscapeRoomCommandHandler : IRequestHandler<UpdateEscapeRoomCommand, Result<string>>
{
    private readonly IEscapeRoomRepository _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IGeocodingService _geocodingService;

    public UpdateEscapeRoomCommandHandler(
        IEscapeRoomRepository repository,
        IUnitOfWork unitOfWork,
        IGeocodingService geocodingService)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _geocodingService = geocodingService;
    }

    public async Task<Result<string>> Handle(UpdateEscapeRoomCommand request, CancellationToken cancellationToken)
    {
        var escapeRoom = await _repository.GetBySlugAsync(request.Slug, cancellationToken);

        if (escapeRoom is null)
        {
            return Result<string>.Failure("EscapeRoom not found", "EscapeRoom.NotFound");
        }

        var (lat, lon) = (escapeRoom.Latitude, escapeRoom.Longitude);
        if (request.Address != escapeRoom.Address && !string.IsNullOrWhiteSpace(request.Address))
        {
             (lat, lon) = await _geocodingService.GetCoordinatesAsync(request.Address);
        }

        escapeRoom.Update(
            request.Name,
            request.Description,
            request.MaxPlayers,
            request.MinPlayers,
            request.DurationMinutes,
            request.DifficultyLevel,
            request.PricePerPerson,
            lat,
            lon,
            request.Address);

        if (escapeRoom.Slug.Value != request.Slug)
        {
             if (await _repository.SlugExistsAsync(escapeRoom.Slug.Value, cancellationToken))
             {
                 return Result<string>.Failure("EscapeRoom with this name/slug already exists", "EscapeRoom.SlugAlreadyExists");
             }
        }

        _repository.Update(escapeRoom);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<string>.Success(escapeRoom.Slug.Value);
    }
}

using MediatR;
using PCE.Shared.Primitives;
using PCE.Modules.EscapeManagement.Application.EscapeRooms.Mappers;
using PCE.Modules.EscapeManagement.Application.EscapeRooms.DTOs;
using PCE.Modules.EscapeManagement.Domain.EscapeRooms.Repositories;

namespace PCE.Modules.EscapeManagement.Application.EscapeRooms.GetBySlug;

public class GetEscapeRoomBySlugQueryHandler : IRequestHandler<GetEscapeRoomBySlugQuery, Result<EscapeRoomDto>>
{
    private readonly IEscapeRoomRepository _repository;
    private readonly EscapeRoomMapper _mapper;

    public GetEscapeRoomBySlugQueryHandler(IEscapeRoomRepository repository, EscapeRoomMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }

    public async Task<Result<EscapeRoomDto>> Handle(GetEscapeRoomBySlugQuery request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Slug))
            return Result<EscapeRoomDto>.Failure("Slug inválido");

        var escapeRoom = await _repository.GetBySlugAsync(request.Slug, ct);

        if (escapeRoom is null)
            return Result<EscapeRoomDto>.Failure("EscapeRoom not found");

        var dto = _mapper.MapToDto(escapeRoom);

        return Result<EscapeRoomDto>.Success(dto);
    }
}
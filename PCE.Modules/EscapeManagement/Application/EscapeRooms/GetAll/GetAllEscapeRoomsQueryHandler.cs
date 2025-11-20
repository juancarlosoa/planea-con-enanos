using MediatR;
using PCE.Modules.EscapeManagement.Application.EscapeRooms.DTOs;
using PCE.Modules.EscapeManagement.Application.EscapeRooms.Mappers;
using PCE.Modules.EscapeManagement.Domain.EscapeRooms.Repositories;
using PCE.Shared.Primitives;

namespace PCE.Modules.EscapeManagement.Application.EscapeRooms.GetAll;

public class GetAllEscapeRoomsQueryHandler : IRequestHandler<GetAllEscapeRoomsQuery, Result<List<EscapeRoomDto>>>
{
    private readonly IEscapeRoomRepository _repository;
    private readonly EscapeRoomMapper _mapper;

    public GetAllEscapeRoomsQueryHandler(IEscapeRoomRepository repository, EscapeRoomMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }

    public async Task<Result<List<EscapeRoomDto>>> Handle(GetAllEscapeRoomsQuery request, CancellationToken cancellationToken)
    {
        var escapeRooms = await _repository.ListAsync(cancellationToken);

        var dtos = escapeRooms.Select(e => _mapper.MapToDto(e)).ToList();

        return Result<List<EscapeRoomDto>>.Success(dtos);
    }
}

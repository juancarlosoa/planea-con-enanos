using EscapeRoomPlanner.Application.Features.EscapeRooms.DTOs;
using EscapeRoomPlanner.Application.Features.EscapeRooms.Mappers;
using EscapeRoomPlanner.Application.Features.EscapeRooms.Queries;
using EscapeRoomPlanner.Domain.Interfaces;
using MediatR;

namespace EscapeRoomPlanner.Application.Features.EscapeRooms.Handlers;

public class SearchEscapeRoomsHandler : IRequestHandler<SearchEscapeRoomsQuery, IEnumerable<EscapeRoomDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public SearchEscapeRoomsHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<EscapeRoomDto>> Handle(SearchEscapeRoomsQuery request, CancellationToken cancellationToken)
    {
        var escapeRooms = await _unitOfWork.EscapeRooms.SearchWithFiltersAsync(request.Filters, cancellationToken);
        return EscapeRoomMapper.ToDto(escapeRooms);
    }
}
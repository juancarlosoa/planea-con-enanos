using MediatR;
using PCE.Modules.EscapeManagement.Application.EscapeRooms.DTOs;
using PCE.Shared.Primitives;

namespace PCE.Modules.EscapeManagement.Application.EscapeRooms.GetBySlug;

public record GetEscapeRoomBySlugQuery(string Slug) : IRequest<Result<EscapeRoomDto>>;
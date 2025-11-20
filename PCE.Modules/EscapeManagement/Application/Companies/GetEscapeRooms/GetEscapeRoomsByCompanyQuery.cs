using MediatR;
using PCE.Modules.EscapeManagement.Application.EscapeRooms.DTOs;
using PCE.Shared.Primitives;

namespace PCE.Modules.EscapeManagement.Application.Companies.GetEscapeRooms;

public record GetEscapeRoomsByCompanyQuery(string CompanySlug) : IRequest<Result<List<EscapeRoomDto>>>;

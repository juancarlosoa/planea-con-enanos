using PCE.Modules.EscapeManagement.Application.EscapeRooms.DTOs;
using PCE.Modules.EscapeManagement.Domain.EscapeRooms.Entities;
using Riok.Mapperly.Abstractions;

namespace PCE.Modules.EscapeManagement.Application.EscapeRooms.Mappers;

[Mapper]
public partial class EscapeRoomMapper
{
    [MapperIgnoreSource(nameof(EscapeRoom.Id))]
    [MapperIgnoreSource(nameof(EscapeRoom.CompanyId))]
    [MapperIgnoreSource(nameof(EscapeRoom.Company))]
    [MapProperty(nameof(EscapeRoom.Company.Slug.Value), nameof(EscapeRoomDto.CompanySlug))]
    [MapProperty(nameof(EscapeRoom.Slug.Value), nameof(EscapeRoomDto.Slug))]
    public partial EscapeRoomDto MapToDto(EscapeRoom escapeRoom);
}
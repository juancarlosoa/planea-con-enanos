using PCE.Modules.EscapeManagement.Application.EscapeRooms.DTOs;
using PCE.Modules.EscapeManagement.Domain.EscapeRooms.Entities;
using Riok.Mapperly.Abstractions;

namespace PCE.Modules.EscapeManagement.Application.EscapeRooms.Mappers;

[Mapper]
public partial class EscapeRoomMapper
{
    public partial EscapeRoomDto MapToDto(EscapeRoom escapeRoom);
}
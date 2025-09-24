using EscapeRoomPlanner.Application.Features.EscapeRooms.DTOs;
using EscapeRoomPlanner.Domain.Entities;
using EscapeRoomPlanner.Domain.Enums;
using EscapeRoomPlanner.Domain.ValueObjects;
using Riok.Mapperly.Abstractions;

namespace EscapeRoomPlanner.Application.Features.EscapeRooms.Mappers;

[Mapper]
public static partial class EscapeRoomMapper
{
    // Entity to DTO mappings
    public static partial EscapeRoomDto ToDto(EscapeRoom escapeRoom);
    public static partial List<EscapeRoomDto> ToDto(List<EscapeRoom> escapeRooms);
    public static partial IEnumerable<EscapeRoomDto> ToDto(IEnumerable<EscapeRoom> escapeRooms);

    // DTO to Entity mappings
    public static EscapeRoom ToEntity(CreateEscapeRoomDto dto)
    {
        return new EscapeRoom(
            dto.Name,
            dto.Description,
            ToEntity(dto.Address),
            ToEntity(dto.Location),
            dto.EstimatedDuration,
            MapStringToDifficulty(dto.Difficulty),
            ToEntity(dto.PriceRange),
            ToEntity(dto.Schedule),
            ToEntity(dto.ContactInfo)
        );
    }

    // Value Object mappings
    public static partial AddressDto ToDto(Address address);
    public static partial Address ToEntity(AddressDto dto);

    public static partial CoordinatesDto ToDto(Coordinates coordinates);
    public static partial Coordinates ToEntity(CoordinatesDto dto);

    public static partial PriceRangeDto ToDto(PriceRange priceRange);
    public static partial PriceRange ToEntity(PriceRangeDto dto);

    public static partial ContactInfoDto ToDto(ContactInfo contactInfo);
    public static partial ContactInfo ToEntity(ContactInfoDto dto);

    public static partial GooglePlacesInfoDto? ToDto(GooglePlacesInfo? googlePlacesInfo);
    public static partial GooglePlacesInfo? ToEntity(GooglePlacesInfoDto? dto);

    public static partial ScheduleDto ToDto(Schedule schedule);
    public static partial Schedule ToEntity(ScheduleDto dto);

    public static partial TimeRangeDto ToDto(TimeRange timeRange);
    public static partial TimeRange ToEntity(TimeRangeDto dto);

    public static partial SpecialScheduleDto ToDto(SpecialSchedule specialSchedule);
    public static partial SpecialSchedule ToEntity(SpecialScheduleDto dto);

    // Custom enum mappings
    [MapProperty(nameof(EscapeRoom.Difficulty), nameof(EscapeRoomDto.Difficulty))]
    private static string MapDifficultyToString(DifficultyLevel difficulty) => difficulty.ToString();

    [MapProperty(nameof(CreateEscapeRoomDto.Difficulty), nameof(EscapeRoom.Difficulty))]
    private static DifficultyLevel MapStringToDifficulty(string difficulty) => 
        Enum.Parse<DifficultyLevel>(difficulty, ignoreCase: true);

    // Dictionary mappings for Schedule
    public static Dictionary<DayOfWeek, TimeRangeDto> MapWeeklyScheduleToDto(Dictionary<DayOfWeek, TimeRange> weeklySchedule)
    {
        return weeklySchedule.ToDictionary(
            kvp => kvp.Key,
            kvp => ToDto(kvp.Value)
        );
    }

    public static Dictionary<DayOfWeek, TimeRange> MapWeeklyScheduleToEntity(Dictionary<DayOfWeek, TimeRangeDto> weeklySchedule)
    {
        return weeklySchedule.ToDictionary(
            kvp => kvp.Key,
            kvp => ToEntity(kvp.Value)
        );
    }

    // List mappings for SpecialSchedule
    public static List<SpecialScheduleDto> MapSpecialDatesToDto(List<SpecialSchedule> specialDates)
    {
        return specialDates.Select(ToDto).ToList();
    }

    public static List<SpecialSchedule> MapSpecialDatesToEntity(List<SpecialScheduleDto> specialDates)
    {
        return specialDates.Select(ToEntity).ToList();
    }
}
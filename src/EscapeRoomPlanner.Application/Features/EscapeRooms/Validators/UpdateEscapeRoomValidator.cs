using EscapeRoomPlanner.Application.Features.EscapeRooms.DTOs;
using EscapeRoomPlanner.Domain.Enums;
using FluentValidation;

namespace EscapeRoomPlanner.Application.Features.EscapeRooms.Validators;

public class UpdateEscapeRoomValidator : AbstractValidator<UpdateEscapeRoomDto>
{
    public UpdateEscapeRoomValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Name is required")
            .MaximumLength(200)
            .WithMessage("Name cannot exceed 200 characters");

        RuleFor(x => x.Description)
            .MaximumLength(2000)
            .WithMessage("Description cannot exceed 2000 characters");

        RuleFor(x => x.EstimatedDuration)
            .GreaterThan(TimeSpan.Zero)
            .WithMessage("Estimated duration must be greater than zero")
            .LessThanOrEqualTo(TimeSpan.FromHours(8))
            .WithMessage("Estimated duration cannot exceed 8 hours");

        RuleFor(x => x.Difficulty)
            .NotEmpty()
            .WithMessage("Difficulty is required")
            .Must(BeValidDifficulty)
            .WithMessage("Invalid difficulty level. Valid values are: Easy, Medium, Hard, Expert");
    }

    private static bool BeValidDifficulty(string difficulty)
    {
        return Enum.TryParse<DifficultyLevel>(difficulty, ignoreCase: true, out _);
    }
}
using EscapeRoomPlanner.Application.Features.EscapeRooms.Commands;
using FluentValidation;

namespace EscapeRoomPlanner.Application.Features.EscapeRooms.Validators;

public class CreateEscapeRoomCommandValidator : AbstractValidator<CreateEscapeRoomCommand>
{
    public CreateEscapeRoomCommandValidator()
    {
        RuleFor(x => x.EscapeRoom)
            .NotNull()
            .WithMessage("Escape room data is required")
            .SetValidator(new CreateEscapeRoomValidator());
    }
}
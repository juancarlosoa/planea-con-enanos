using EscapeRoomPlanner.Application.Features.EscapeRooms.Commands;
using FluentValidation;

namespace EscapeRoomPlanner.Application.Features.EscapeRooms.Validators;

public class UpdateEscapeRoomCommandValidator : AbstractValidator<UpdateEscapeRoomCommand>
{
    public UpdateEscapeRoomCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Escape room ID is required");

        RuleFor(x => x.EscapeRoom)
            .NotNull()
            .WithMessage("Escape room data is required")
            .SetValidator(new UpdateEscapeRoomValidator());
    }
}
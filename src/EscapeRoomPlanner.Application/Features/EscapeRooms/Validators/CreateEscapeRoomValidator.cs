using EscapeRoomPlanner.Application.Features.EscapeRooms.DTOs;
using EscapeRoomPlanner.Domain.Enums;
using FluentValidation;

namespace EscapeRoomPlanner.Application.Features.EscapeRooms.Validators;

public class CreateEscapeRoomValidator : AbstractValidator<CreateEscapeRoomDto>
{
    public CreateEscapeRoomValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Name is required")
            .MaximumLength(200)
            .WithMessage("Name cannot exceed 200 characters");

        RuleFor(x => x.Description)
            .MaximumLength(2000)
            .WithMessage("Description cannot exceed 2000 characters");

        RuleFor(x => x.Address)
            .NotNull()
            .WithMessage("Address is required")
            .SetValidator(new AddressValidator());

        RuleFor(x => x.Location)
            .NotNull()
            .WithMessage("Location is required")
            .SetValidator(new CoordinatesValidator());

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

        RuleFor(x => x.PriceRange)
            .NotNull()
            .WithMessage("Price range is required")
            .SetValidator(new PriceRangeValidator());

        RuleFor(x => x.Schedule)
            .NotNull()
            .WithMessage("Schedule is required")
            .SetValidator(new ScheduleValidator());

        RuleFor(x => x.ContactInfo)
            .NotNull()
            .WithMessage("Contact info is required")
            .SetValidator(new ContactInfoValidator());
    }

    private static bool BeValidDifficulty(string difficulty)
    {
        return Enum.TryParse<DifficultyLevel>(difficulty, ignoreCase: true, out _);
    }
}

public class AddressValidator : AbstractValidator<AddressDto>
{
    public AddressValidator()
    {
        RuleFor(x => x.Street)
            .NotEmpty()
            .WithMessage("Street is required")
            .MaximumLength(200)
            .WithMessage("Street cannot exceed 200 characters");

        RuleFor(x => x.City)
            .NotEmpty()
            .WithMessage("City is required")
            .MaximumLength(100)
            .WithMessage("City cannot exceed 100 characters");

        RuleFor(x => x.PostalCode)
            .NotEmpty()
            .WithMessage("Postal code is required")
            .MaximumLength(20)
            .WithMessage("Postal code cannot exceed 20 characters");

        RuleFor(x => x.Country)
            .NotEmpty()
            .WithMessage("Country is required")
            .MaximumLength(100)
            .WithMessage("Country cannot exceed 100 characters");
    }
}

public class CoordinatesValidator : AbstractValidator<CoordinatesDto>
{
    public CoordinatesValidator()
    {
        RuleFor(x => x.Latitude)
            .InclusiveBetween(-90, 90)
            .WithMessage("Latitude must be between -90 and 90 degrees");

        RuleFor(x => x.Longitude)
            .InclusiveBetween(-180, 180)
            .WithMessage("Longitude must be between -180 and 180 degrees");
    }
}

public class PriceRangeValidator : AbstractValidator<PriceRangeDto>
{
    public PriceRangeValidator()
    {
        RuleFor(x => x.MinPrice)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Minimum price cannot be negative");

        RuleFor(x => x.MaxPrice)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Maximum price cannot be negative");

        RuleFor(x => x)
            .Must(x => x.MaxPrice >= x.MinPrice)
            .WithMessage("Maximum price must be greater than or equal to minimum price");

        RuleFor(x => x.Currency)
            .NotEmpty()
            .WithMessage("Currency is required")
            .Length(3)
            .WithMessage("Currency must be a 3-letter ISO code (e.g., EUR, USD)");
    }
}

public class ContactInfoValidator : AbstractValidator<ContactInfoDto>
{
    public ContactInfoValidator()
    {
        RuleFor(x => x.Phone)
            .MaximumLength(20)
            .WithMessage("Phone cannot exceed 20 characters")
            .When(x => !string.IsNullOrEmpty(x.Phone));

        RuleFor(x => x.Email)
            .EmailAddress()
            .WithMessage("Invalid email format")
            .MaximumLength(100)
            .WithMessage("Email cannot exceed 100 characters")
            .When(x => !string.IsNullOrEmpty(x.Email));

        RuleFor(x => x.Website)
            .Must(BeValidUrl)
            .WithMessage("Invalid website URL")
            .MaximumLength(500)
            .WithMessage("Website URL cannot exceed 500 characters")
            .When(x => !string.IsNullOrEmpty(x.Website));
    }

    private static bool BeValidUrl(string? url)
    {
        if (string.IsNullOrEmpty(url))
            return true;

        return Uri.TryCreate(url, UriKind.Absolute, out var result) &&
               (result.Scheme == Uri.UriSchemeHttp || result.Scheme == Uri.UriSchemeHttps);
    }
}

public class ScheduleValidator : AbstractValidator<ScheduleDto>
{
    public ScheduleValidator()
    {
        RuleFor(x => x.WeeklySchedule)
            .NotNull()
            .WithMessage("Weekly schedule is required");

        RuleForEach(x => x.WeeklySchedule.Values)
            .SetValidator(new TimeRangeValidator())
            .When(x => x.WeeklySchedule != null);

        RuleForEach(x => x.SpecialDates)
            .SetValidator(new SpecialScheduleValidator())
            .When(x => x.SpecialDates != null);
    }
}

public class TimeRangeValidator : AbstractValidator<TimeRangeDto>
{
    public TimeRangeValidator()
    {
        RuleFor(x => x.StartTime)
            .LessThan(x => x.EndTime)
            .WithMessage("Start time must be before end time");

        RuleFor(x => x.EndTime)
            .GreaterThan(x => x.StartTime)
            .WithMessage("End time must be after start time");
    }
}

public class SpecialScheduleValidator : AbstractValidator<SpecialScheduleDto>
{
    public SpecialScheduleValidator()
    {
        RuleFor(x => x.Date)
            .NotEmpty()
            .WithMessage("Special date is required");

        RuleFor(x => x.TimeRange)
            .SetValidator(new TimeRangeValidator()!)
            .When(x => x.TimeRange != null && !x.IsClosed);

        RuleFor(x => x.Description)
            .MaximumLength(200)
            .WithMessage("Description cannot exceed 200 characters")
            .When(x => !string.IsNullOrEmpty(x.Description));
    }
}
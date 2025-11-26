using MediatR;
using PCE.Modules.EscapeManagement.Domain.EscapeRooms.Entities;
using PCE.Modules.EscapeManagement.Domain.EscapeRooms.Repositories;
using PCE.Modules.EscapeManagement.Domain.Companies.Repositories;
using PCE.Shared.Abstractions.Persistence;
using PCE.Shared.Primitives;

namespace PCE.Modules.EscapeManagement.Application.EscapeRooms.Create;

public class CreateEscapeRoomCommandHandler : IRequestHandler<CreateEscapeRoomCommand, Result<string>>
{
    private readonly IEscapeRoomRepository _repository;
    private readonly ICompanyRepository _companyRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateEscapeRoomCommandHandler(
        IEscapeRoomRepository repository,
        ICompanyRepository companyRepository,
        IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _companyRepository = companyRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<string>> Handle(CreateEscapeRoomCommand request, CancellationToken cancellationToken)
    {
        var company = await _companyRepository.GetBySlugAsync(request.CompanySlug, cancellationToken);

        if (company is null)
        {
            return Result<string>.Failure("Company not found", "Company.NotFound");
        }

        var escapeRoom = EscapeRoom.Create(
            request.Name,
            request.Description,
            request.MaxPlayers,
            request.MinPlayers,
            request.DurationMinutes,
            request.DifficultyLevel,
            request.PricePerPerson,
            company.Id,
            request.Latitude,
            request.Longitude);

        if (await _repository.SlugExistsAsync(escapeRoom.Slug.Value, cancellationToken))
        {
            return Result<string>.Failure("EscapeRoom with this name/slug already exists", "EscapeRoom.SlugAlreadyExists");
        }

        await _repository.AddAsync(escapeRoom, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<string>.Success(escapeRoom.Slug.Value);
    }
}

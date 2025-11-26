using MediatR;
using PCE.Modules.EscapeManagement.Domain.Companies.Entities;
using PCE.Modules.EscapeManagement.Domain.Companies.Repositories;
using PCE.Shared.Abstractions.Persistence;
using PCE.Shared.Primitives;
using PCE.Modules.EscapeManagement.Application.Services;

namespace PCE.Modules.EscapeManagement.Application.Companies.Create;

public class CreateCompanyCommandHandler : IRequestHandler<CreateCompanyCommand, Result<string>>
{
    private readonly ICompanyRepository _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IGeocodingService _geocodingService;

    public CreateCompanyCommandHandler(
        ICompanyRepository repository,
        IUnitOfWork unitOfWork,
        IGeocodingService geocodingService)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _geocodingService = geocodingService;
    }

    public async Task<Result<string>> Handle(CreateCompanyCommand request, CancellationToken cancellationToken)
    {
        if (await _repository.GetByEmailAsync(request.Email, cancellationToken) is not null)
        {
            return Result<string>.Failure("Company with this email already exists", "Company.EmailAlreadyExists");
        }

        var (lat, lon) = (0.0, 0.0);
        if (!string.IsNullOrWhiteSpace(request.Address))
        {
            (lat, lon) = await _geocodingService.GetCoordinatesAsync(request.Address);
        }

        var company = Company.Create(
            request.Name,
            request.Email,
            request.Phone,
            lat,
            lon,
            request.Address,
            request.Website);

        if (await _repository.SlugExistsAsync(company.Slug.Value, cancellationToken))
        {
             return Result<string>.Failure("Company with this slug already exists", "Company.SlugAlreadyExists");
        }

        await _repository.AddAsync(company, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<string>.Success(company.Slug.Value);
    }
}

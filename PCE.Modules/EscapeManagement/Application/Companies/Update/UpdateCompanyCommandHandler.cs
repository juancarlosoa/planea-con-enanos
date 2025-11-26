using MediatR;
using PCE.Modules.EscapeManagement.Domain.Companies.Repositories;
using PCE.Shared.Abstractions.Persistence;
using PCE.Shared.Primitives;
using PCE.Modules.EscapeManagement.Application.Services;

namespace PCE.Modules.EscapeManagement.Application.Companies.Update;

public class UpdateCompanyCommandHandler : IRequestHandler<UpdateCompanyCommand, Result<string>>
{
    private readonly ICompanyRepository _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IGeocodingService _geocodingService;

    public UpdateCompanyCommandHandler(
        ICompanyRepository repository,
        IUnitOfWork unitOfWork,
        IGeocodingService geocodingService)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _geocodingService = geocodingService;
    }

    public async Task<Result<string>> Handle(UpdateCompanyCommand request, CancellationToken cancellationToken)
    {
        var company = await _repository.GetBySlugAsync(request.Slug, cancellationToken);

        if (company is null)
        {
            return Result<string>.Failure("Company not found", "Company.NotFound");
        }

        // Check if email is taken by another company
        var existingCompanyByEmail = await _repository.GetByEmailAsync(request.Email, cancellationToken);
        if (existingCompanyByEmail is not null && existingCompanyByEmail.Id != company.Id)
        {
            return Result<string>.Failure("Email already in use", "Company.EmailAlreadyExists");
        }

        var (lat, lon) = (company.Latitude, company.Longitude);
        // Re-geocode if address changed or if it was empty and now is not
        if (request.Address != company.Address && !string.IsNullOrWhiteSpace(request.Address))
        {
             (lat, lon) = await _geocodingService.GetCoordinatesAsync(request.Address);
        }

        company.Update(
            request.Name,
            request.Email,
            request.Phone,
            lat,
            lon,
            request.Address,
            request.Website);

        // If name changed, slug might have changed, check uniqueness
        if (company.Slug.Value != request.Slug)
        {
             if (await _repository.SlugExistsAsync(company.Slug.Value, cancellationToken))
             {
                 return Result<string>.Failure("Company with this name/slug already exists", "Company.SlugAlreadyExists");
             }
        }

        _repository.Update(company);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<string>.Success(company.Slug.Value);
    }
}

using MediatR;
using PCE.Modules.EscapeManagement.Domain.Companies.Entities;
using PCE.Modules.EscapeManagement.Domain.Companies.Repositories;
using PCE.Shared.Abstractions.Persistence;
using PCE.Shared.Primitives;

namespace PCE.Modules.EscapeManagement.Application.Companies.Create;

public class CreateCompanyCommandHandler : IRequestHandler<CreateCompanyCommand, Result<string>>
{
    private readonly ICompanyRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateCompanyCommandHandler(
        ICompanyRepository repository,
        IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<string>> Handle(CreateCompanyCommand request, CancellationToken cancellationToken)
    {
        if (await _repository.GetByEmailAsync(request.Email, cancellationToken) is not null)
        {
            return Result<string>.Failure("Company with this email already exists", "Company.EmailAlreadyExists");
        }

        var company = Company.Create(
            request.Name,
            request.Email,
            request.Phone,
            request.Latitude ?? 0.0,
            request.Longitude ?? 0.0,
            request.Address ?? string.Empty,
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


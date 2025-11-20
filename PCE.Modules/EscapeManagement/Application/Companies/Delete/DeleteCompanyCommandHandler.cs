using MediatR;
using PCE.Modules.EscapeManagement.Domain.Companies.Repositories;
using PCE.Shared.Abstractions.Persistence;
using PCE.Shared.Primitives;

namespace PCE.Modules.EscapeManagement.Application.Companies.Delete;

public class DeleteCompanyCommandHandler : IRequestHandler<DeleteCompanyCommand, Result>
{
    private readonly ICompanyRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteCompanyCommandHandler(ICompanyRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(DeleteCompanyCommand request, CancellationToken cancellationToken)
    {
        var company = await _repository.GetBySlugAsync(request.Slug, cancellationToken);

        if (company is null)
        {
            return Result.Failure("Company not found", "Company.NotFound");
        }

        _repository.Remove(company);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}

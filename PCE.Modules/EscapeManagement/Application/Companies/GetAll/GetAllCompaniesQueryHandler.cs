using MediatR;
using PCE.Modules.EscapeManagement.Application.Companies.DTOs;
using PCE.Modules.EscapeManagement.Application.Companies.Mappers;
using PCE.Modules.EscapeManagement.Domain.Companies.Repositories;
using PCE.Shared.Primitives;

namespace PCE.Modules.EscapeManagement.Application.Companies.GetAll;

public class GetAllCompaniesQueryHandler : IRequestHandler<GetAllCompaniesQuery, Result<List<CompanyDto>>>
{
    private readonly ICompanyRepository _repository;
    private readonly CompanyMapper _mapper;

    public GetAllCompaniesQueryHandler(ICompanyRepository repository, CompanyMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }

    public async Task<Result<List<CompanyDto>>> Handle(GetAllCompaniesQuery request, CancellationToken cancellationToken)
    {
        var companies = await _repository.ListAsync(cancellationToken);

        var dtos = companies.Select(c => _mapper.MapToDto(c)).ToList();

        return Result<List<CompanyDto>>.Success(dtos);
    }
}

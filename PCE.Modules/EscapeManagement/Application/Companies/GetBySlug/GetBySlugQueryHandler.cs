using MediatR;
using PCE.Shared.Primitives;
using PCE.Modules.EscapeManagement.Application.Companies.Mappers;
using PCE.Modules.EscapeManagement.Domain.Companies.Repositories;
using PCE.Modules.EscapeManagement.Application.Companies.DTOs;

namespace PCE.Modules.EscapeManagement.Application.Companies.GetBySlug;

public class GetCompanyBySlugQueryHandler : IRequestHandler<GetCompanyBySlugQuery, Result<CompanyDto>>
{
    private readonly ICompanyRepository _repository;
    private readonly CompanyMapper _mapper;

    public GetCompanyBySlugQueryHandler(ICompanyRepository repository, CompanyMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }

    public async Task<Result<CompanyDto>> Handle(GetCompanyBySlugQuery request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Slug))
            return Result<CompanyDto>.Failure("Slug inválido");

        var company = await _repository.GetBySlugAsync(request.Slug, cancellationToken);

        if (company is null)
            return Result<CompanyDto>.Failure("Company not found");

        var dto = _mapper.MapToDto(company);

        return Result<CompanyDto>.Success(dto);
    }
}
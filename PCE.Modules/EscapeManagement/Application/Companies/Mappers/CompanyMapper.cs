using PCE.Modules.EscapeManagement.Application.Companies.DTOs;
using PCE.Modules.EscapeManagement.Domain.Companies.Entities;
using Riok.Mapperly.Abstractions;

namespace PCE.Modules.EscapeManagement.Application.Companies.Mappers;

[Mapper]
public partial class CompanyMapper
{
    [MapperIgnoreSource(nameof(Company.Id))]
    [MapProperty(nameof(Company.Slug.Value), nameof(CompanyDto.Slug))]
    public partial CompanyDto MapToDto(Company company);
}
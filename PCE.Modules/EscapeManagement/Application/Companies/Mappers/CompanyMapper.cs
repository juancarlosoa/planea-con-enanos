using PCE.Modules.EscapeManagement.Application.Companies.DTOs;
using PCE.Modules.EscapeManagement.Domain.Companies.Entities;
using Riok.Mapperly.Abstractions;

namespace PCE.Modules.EscapeManagement.Application.Companies.Mappers;

[Mapper]
public partial class CompanyMapper
{
    public partial CompanyDto MapToDto(Company company);
}
using MediatR;
using PCE.Modules.EscapeManagement.Application.EscapeRooms.DTOs;
using PCE.Modules.EscapeManagement.Application.EscapeRooms.Mappers;
using PCE.Modules.EscapeManagement.Domain.Companies.Repositories;
using PCE.Shared.Primitives;

namespace PCE.Modules.EscapeManagement.Application.Companies.GetEscapeRooms;

public class GetEscapeRoomsByCompanyQueryHandler : IRequestHandler<GetEscapeRoomsByCompanyQuery, Result<List<EscapeRoomDto>>>
{
    private readonly ICompanyRepository _companyRepository;
    private readonly EscapeRoomMapper _mapper;

    public GetEscapeRoomsByCompanyQueryHandler(
        ICompanyRepository companyRepository,
        EscapeRoomMapper mapper)
    {
        _companyRepository = companyRepository;
        _mapper = mapper;
    }

    public async Task<Result<List<EscapeRoomDto>>> Handle(GetEscapeRoomsByCompanyQuery request, CancellationToken cancellationToken)
    {
        var company = await _companyRepository.GetBySlugAsync(request.CompanySlug, cancellationToken);
        if (company is null)
        {
            return Result<List<EscapeRoomDto>>.Failure("Company not found", "Company.NotFound");
        }

        var companyEscapeRooms = company.EscapeRooms;

        var dtos = companyEscapeRooms.Select(er => _mapper.MapToDto(er)).ToList();

        return Result<List<EscapeRoomDto>>.Success(dtos);
    }
}

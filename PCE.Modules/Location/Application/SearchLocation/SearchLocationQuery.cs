using MediatR;
using PCE.Modules.Location.Application.DTOs;
using PCE.Shared.Primitives;

namespace PCE.Modules.Location.Application.SearchLocation;

public record SearchLocationQuery(
    string Street,
    string City,
    string State,
    string PostalCode,
    string Country) : IRequest<Result<List<LocationResultDto>>>;
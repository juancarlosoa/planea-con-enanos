using Microsoft.EntityFrameworkCore;
using PCE.Modules.EscapeManagement.Domain.Companies.Repositories;
using PCE.Modules.EscapeManagement.Domain.EscapeRooms.Repositories;
using PCE.Modules.EscapeManagement.Infrastructure.Persistence;
using PCE.Shared.Abstractions.Persistence;
using PCE.Modules.EscapeManagement.Infrastructure.Repositories.Companies;
using PCE.Modules.EscapeManagement.Application.Companies.Mappers;
using PCE.Modules.EscapeManagement.Application.EscapeRooms.Mappers;
using PCE.Modules.EscapeManagement.Infrastructure.Repositories.EscapeRooms;

namespace PCE.Modules.EscapeManagement;

public static class EscapeManagementModule
{
    public static IServiceCollection AddEscapeManagementModule(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<EscapeManagementDbContext>(options =>
        {
            options.UseNpgsql(configuration.GetConnectionString("EscapeManagement"), npgsqlOptions =>
            {
                npgsqlOptions.EnableRetryOnFailure(5, TimeSpan.FromSeconds(10), null);
            });
        });

        services.AddScoped<ICompanyRepository, CompanyRepository>();
        services.AddScoped<IEscapeRoomRepository, EscapeRoomRepository>();
        services.AddScoped<IUnitOfWork>(sp => sp.GetRequiredService<EscapeManagementDbContext>());
        services.AddSingleton<CompanyMapper>();
        services.AddSingleton<EscapeRoomMapper>();

        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(EscapeManagementModule).Assembly));

        return services;
    }
}

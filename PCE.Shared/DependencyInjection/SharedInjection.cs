using Microsoft.Extensions.DependencyInjection;

namespace PCE.Shared.DependencyInjection;

public static class SharedInjection
{
    public static IServiceCollection AddShared(this IServiceCollection services)
    {
        return services;
    }
}
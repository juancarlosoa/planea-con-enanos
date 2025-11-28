namespace PCE.Modules.Infrastructure.Security;

public class InternalSecurityMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IConfiguration _configuration;
    private const string HeaderName = "X-Internal-Secret";

    public InternalSecurityMiddleware(RequestDelegate next, IConfiguration configuration)
    {
        _next = next;
        _configuration = configuration;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var secret = _configuration["INTERNAL_SECRET"];

        if (string.IsNullOrEmpty(secret))
        {
            context.Response.StatusCode = 500;
            await context.Response.WriteAsync("Internal Security Error: Secret not configured.");
            return;
        }

        if (!context.Request.Headers.TryGetValue(HeaderName, out var extractedSecret) || 
            extractedSecret != secret)
        {
            context.Response.StatusCode = 403;
            await context.Response.WriteAsync("Forbidden: Invalid Internal Secret.");
            return;
        }

        await _next(context);
    }
}

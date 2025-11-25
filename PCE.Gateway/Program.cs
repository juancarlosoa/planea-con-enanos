using Yarp.ReverseProxy.Transforms;

var builder = WebApplication.CreateBuilder(args);

var allowedOrigins = builder.Configuration["ALLOWED_ORIGINS"]?.Split(',') ?? Array.Empty<string>();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"))
    .AddTransforms(builderContext =>
    {
        builderContext.AddRequestTransform(transformContext =>
        {
            var secret = builder.Configuration["INTERNAL_SECRET"];
            if (!string.IsNullOrEmpty(secret))
            {
                transformContext.ProxyRequest.Headers.Add("X-Internal-Secret", secret);
            }
            return ValueTask.CompletedTask;
        });
    });

var app = builder.Build();

app.UseCors();

app.MapReverseProxy();

app.Run();

using Microsoft.EntityFrameworkCore;
using PCE.Shared.DependencyInjection;
using PCE.Modules.EscapeManagement;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services
    .AddShared()
    .AddEscapeManagementModule(builder.Configuration);

builder.WebHost.UseUrls("http://0.0.0.0:5000");

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<PCE.Modules.EscapeManagement.Infrastructure.Persistence.EscapeManagementDbContext>();
    dbContext.Database.Migrate();
}

app.Run();
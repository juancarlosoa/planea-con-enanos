using FluentValidation;
using System.Net;
using System.Text.Json;

namespace EscapeRoomPlanner.Api.Middleware;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        object response = exception switch
        {
            ValidationException validationEx => new
            {
                error = "Validation failed",
                details = validationEx.Errors.Select(e => new { field = e.PropertyName, message = e.ErrorMessage }),
                statusCode = (int)HttpStatusCode.BadRequest
            },
            KeyNotFoundException => new
            {
                error = exception.Message,
                statusCode = (int)HttpStatusCode.NotFound
            },
            ArgumentException => new
            {
                error = exception.Message,
                statusCode = (int)HttpStatusCode.BadRequest
            },
            UnauthorizedAccessException => new
            {
                error = "Unauthorized access",
                statusCode = (int)HttpStatusCode.Unauthorized
            },
            _ => new
            {
                error = "An internal server error occurred",
                statusCode = (int)HttpStatusCode.InternalServerError
            }
        };

        var statusCode = exception switch
        {
            ValidationException => (int)HttpStatusCode.BadRequest,
            KeyNotFoundException => (int)HttpStatusCode.NotFound,
            ArgumentException => (int)HttpStatusCode.BadRequest,
            UnauthorizedAccessException => (int)HttpStatusCode.Unauthorized,
            _ => (int)HttpStatusCode.InternalServerError
        };

        context.Response.StatusCode = statusCode;

        var jsonResponse = JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await context.Response.WriteAsync(jsonResponse);
    }
}
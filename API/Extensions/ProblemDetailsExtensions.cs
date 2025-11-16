using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace LowcodeAPI.API.Extensions;

public static class ProblemDetailsExtensions
{
    public static ProblemDetails ToProblemDetails(this ValidationException ex)
    {
        var problemDetails = new ProblemDetails
        {
            Type = "https://tools.ietf.org/html/rfc7231#section-6.5.1",
            Title = "Validation error",
            Status = StatusCodes.Status400BadRequest,
            Detail = "One or more validation errors occurred."
        };

        var errors = ex.Errors
            .GroupBy(e => e.PropertyName)
            .ToDictionary(
                g => g.Key,
                g => g.Select(e => e.ErrorMessage).ToArray());

        problemDetails.Extensions.Add("errors", errors);

        return problemDetails;
    }
}

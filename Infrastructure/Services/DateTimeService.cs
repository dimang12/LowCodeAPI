using LowcodeAPI.Application.Common.Interfaces;

namespace LowcodeAPI.Infrastructure.Services;

public class DateTimeService : IDateTime
{
    public DateTime UtcNow => DateTime.UtcNow;
}


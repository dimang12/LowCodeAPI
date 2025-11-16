using LowcodeAPI.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace LowcodeAPI.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<T> Set<T>() where T : class;
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}


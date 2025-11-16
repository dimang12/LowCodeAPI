namespace LowcodeAPI.Domain.Common;

public interface IDomainEvent
{
    DateTime OccurredOn { get; }
}


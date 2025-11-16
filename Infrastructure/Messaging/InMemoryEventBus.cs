using LowcodeAPI.Domain.Common;
using Microsoft.Extensions.Logging;

namespace LowcodeAPI.Infrastructure.Messaging;

public class InMemoryEventBus : IEventBus
{
    private readonly ILogger<InMemoryEventBus> _logger;

    public InMemoryEventBus(ILogger<InMemoryEventBus> logger)
    {
        _logger = logger;
    }

    public Task PublishAsync<T>(T @event, CancellationToken cancellationToken = default) where T : IDomainEvent
    {
        _logger.LogInformation("Publishing domain event {EventType}: {EventId}", typeof(T).Name, @event.GetType().Name);
        // In-memory implementation - replace with actual event bus (Kafka/RabbitMQ/Azure Service Bus)
        return Task.CompletedTask;
    }

    public Task PublishAsync(IEnumerable<IDomainEvent> events, CancellationToken cancellationToken = default)
    {
        return Task.WhenAll(events.Select(e => PublishAsync(e, cancellationToken)));
    }
}


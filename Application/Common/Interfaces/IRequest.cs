using MediatR;

namespace LowcodeAPI.Application.Common.Interfaces;

public interface IRequest<TResponse> : MediatR.IRequest<TResponse>
{
}

public interface IRequest : MediatR.IRequest
{
}


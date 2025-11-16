using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.IdentityModel.Tokens;

namespace LowcodeAPI.API.Configuration;

public static class AuthenticationExtensions
{
    public static IServiceCollection AddAuthenticationServices(this IServiceCollection services, IConfiguration configuration)
    {
        // OIDC Configuration
        var authority = configuration["Authentication:Authority"];
        var clientId = configuration["Authentication:ClientId"];
        var clientSecret = configuration["Authentication:ClientSecret"];
        
        if (!string.IsNullOrEmpty(authority) && !string.IsNullOrEmpty(clientId))
        {
            // JWT Bearer Authentication (for API)
            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.Authority = authority;
                options.Audience = clientId;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ClockSkew = TimeSpan.Zero
                };
            });

            // OpenID Connect (for web frontend)
            services.AddAuthentication()
                .AddOpenIdConnect(OpenIdConnectDefaults.AuthenticationScheme, options =>
                {
                    options.Authority = authority;
                    options.ClientId = clientId;
                    if (!string.IsNullOrEmpty(clientSecret))
                    {
                        options.ClientSecret = clientSecret;
                    }
                    options.ResponseType = "code";
                    options.SaveTokens = true;
                    options.GetClaimsFromUserInfoEndpoint = true;
                });
        }

        // Add Authorization policies
        services.AddAuthorization(options =>
        {
            // Example policies - customize as needed
            options.AddPolicy("RequireAdmin", policy => policy.RequireClaim("role", "admin"));
            options.AddPolicy("RequireUser", policy => policy.RequireAuthenticatedUser());
        });

        return services;
    }
}


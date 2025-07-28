## Build stage for the eligibility service
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore as distinct layers
COPY *.csproj ./
RUN dotnet restore

# Copy the remaining source code
COPY . .

# Publish the application for production
RUN dotnet publish -c Release -o /app

## Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

COPY --from=build /app .

# The ASP.NET Core runtime listens on port 80 by default when
# ASPNETCORE_URLS is set (configured in docker-compose).  No further
# configuration is required here.
ENTRYPOINT ["dotnet", "EligibilityService.dll"]
## Build stage for the orchestrator service
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project file and restore dependencies
COPY *.csproj ./
RUN dotnet restore

# Copy source and publish
COPY . .
RUN dotnet publish -c Release -o /app

## Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app .

# Install the required .NET runtime
RUN apt-get update && apt-get install -y wget && \
    wget https://dot.net/v1/dotnet-install.sh && \
    chmod +x dotnet-install.sh && \
    ./dotnet-install.sh --runtime aspnetcore --version 8.0.0 && \
    rm dotnet-install.sh

# The orchestrator hosts an HTTP API on port 80 and runs a
# Temporal worker in the background via a hosted service.
ENTRYPOINT ["dotnet", "Orchestrator.dll"]
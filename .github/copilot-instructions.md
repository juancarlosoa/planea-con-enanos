# Copilot Instructions for planea-con-enanos

## Project Overview

This is a multi-project .NET solution for managing escape room businesses. It uses a modular architecture with clear service boundaries:

- **PCE.Gateway**: API gateway and entry point for external requests.
- **PCE.Modules**: Main business logic, organized by domain (e.g., EscapeManagement).
- **PCE.Shared**: Shared abstractions, primitives, and utilities.

## Architecture & Patterns

- **Modular Structure**: Each module (e.g., EscapeManagement) contains its own API, Application, Domain, and Infrastructure layers. Follow this separation for new features.
- **Domain-Driven Design**: Domain logic is in `Domain/`, application services in `Application/`, and persistence/repositories in `Infrastructure/`.
- **Shared Contracts**: Use interfaces and base types from `PCE.Shared/Abstractions` for cross-module communication.
- **Configuration**: Each project has its own `appsettings.json` and `appsettings.Development.json`.

## Developer Workflows

- **Build**: Use `dotnet build planea-con-enanos.sln` from the root.
- **Run Locally**: Use Docker Compose (`docker-compose up -d --build`) to start all services. Each service has its own Dockerfile.
- **Database Initialization**: Run `DbInit/init.sh` (requires Bash) for initial DB setup.
- **Debugging**: Use launch profiles in `Properties/launchSettings.json` for each project.

## Conventions & Practices

- **HTTP APIs**: Controllers are in `Api/` folders. Use attribute routing and dependency injection.
- **Persistence**: Repositories implement interfaces from `PCE.Shared/Abstractions/Persistence`.
- **Messaging**: Commands, events, and queries use interfaces in `PCE.Shared/Abstractions/Messaging`.
- **Error Handling**: Use `PCE.Shared/Primitives/Error.cs` and `Result.cs` for consistent error/result patterns.
- **Pagination**: Use types from `PCE.Shared/Pagination/` for paged results.

## Integration Points

- **External Services**: Integrate via the Gateway. Add new integrations in `PCE.Gateway`.
- **Security**: Middleware in `PCE.Modules/Infrastructure/Security/`.
- **Cross-Module Communication**: Use shared abstractions and dependency injection.

## Examples

- To add a new domain entity: create in `Domain/`, add repository in `Infrastructure/Repositories`, expose via `Api/` controller.
- To add a new shared type: place in `PCE.Shared/Abstractions` or relevant subfolder.

## Key Files & Directories

- `planea-con-enanos.sln`: Solution file.
- `docker-compose.yml`: Service orchestration.
- `DbInit/init.sh`: DB setup.
- `PCE.Gateway/`: API gateway.
- `PCE.Modules/`: Business modules.
- `PCE.Shared/`: Shared contracts and utilities.

---

For unclear workflows or missing conventions, ask the user for clarification before proceeding.

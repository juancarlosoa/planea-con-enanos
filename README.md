# Escape Room Planner

A web application for planning escape room routes with interactive maps, multi-day planning, and intelligent recommendations.

## Features

- 🗺️ Interactive map with escape room locations
- 📅 Multi-day route planning
- 🤖 Intelligent chat-based recommendations
- ⏱️ Travel time optimization
- 💰 Budget management
- 📱 Responsive design
- 🔗 Social sharing capabilities

## Tech Stack

### Backend (.NET 8)
- ASP.NET Core Web API
- Entity Framework Core with PostgreSQL
- Clean Architecture
- MediatR (CQRS)
- FluentValidation
- Mapperly
- SignalR
- Serilog

### Database
- PostgreSQL 15+ with JSONB support
- Optimized for geospatial queries
- JSONB for complex schedule data
- UUID primary keys

### Frontend (React + TypeScript)
- React 18 with TypeScript
- Vite
- Tailwind CSS
- React Query (TanStack Query)
- Zustand
- Mapbox GL JS
- Socket.io Client
- Framer Motion

## Getting Started

### Prerequisites
- .NET 8 SDK
- Node.js 18+
- PostgreSQL 15+ (or Docker for easy setup)

### Backend Setup

1. **Setup PostgreSQL** (choose one option):
   
   **Option A: Docker (Recommended)**
   ```bash
   docker run --name postgres-escaperoom \
     -e POSTGRES_PASSWORD=postgres \
     -e POSTGRES_DB=EscapeRoomPlannerDb_Dev \
     -p 5432:5432 \
     -d postgres:15
   ```
   
   **Option B: Local Installation**
   - Install PostgreSQL from https://www.postgresql.org/download/
   - Create database: `EscapeRoomPlannerDb_Dev`
   - Update connection string if needed

2. Navigate to the project root
3. Restore NuGet packages:
   ```bash
   dotnet restore
   ```
4. Run database migrations:
   ```bash
   dotnet ef database update --project src/EscapeRoomPlanner.Infrastructure --startup-project src/EscapeRoomPlanner.Api
   ```
5. Run the API:
   ```bash
   dotnet run --project src/EscapeRoomPlanner.Api
   ```

The API will automatically seed the database with sample escape rooms on first run.

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```
4. Update the environment variables with your API keys
5. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
EscapeRoomPlanner/
├── src/
│   ├── EscapeRoomPlanner.Api/          # Web API
│   ├── EscapeRoomPlanner.Application/  # Application Layer
│   ├── EscapeRoomPlanner.Domain/       # Domain Layer
│   └── EscapeRoomPlanner.Infrastructure/ # Infrastructure Layer
├── tests/
│   ├── EscapeRoomPlanner.UnitTests/
│   └── EscapeRoomPlanner.IntegrationTests/
└── frontend/                           # React Frontend
    └── src/
        ├── features/                   # Feature-based organization
        └── shared/                     # Shared components and utilities
```

## Development

The project follows Clean Architecture principles with feature-based organization. Each feature contains its own controllers, services, models, and validations.

### Running Tests

```bash
# Backend tests
dotnet test

# Frontend tests (when implemented)
cd frontend && npm test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License.
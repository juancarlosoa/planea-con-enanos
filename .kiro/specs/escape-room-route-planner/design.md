# Documento de Diseño - Planificador de Rutas de Escape Rooms

## Visión General

El sistema será desarrollado como una aplicación web .NET siguiendo arquitectura limpia (Clean Architecture) con el patrón de features. Cada funcionalidad principal será organizada como una feature independiente con sus propios controladores, servicios, modelos y validaciones, promoviendo alta cohesión y bajo acoplamiento.

## Decisiones Arquitectónicas Clave

### Base de Datos: PostgreSQL

**Justificación**: Se eligió PostgreSQL sobre SQL Server por las siguientes ventajas específicas para nuestro dominio:

#### Ventajas para Escape Room Planner:

1. **JSONB Nativo**: 
   - Los horarios complejos (`Schedule`) se almacenan como JSONB indexable
   - Consultas eficientes sobre horarios especiales y disponibilidad
   - Mejor rendimiento que serialización JSON a string

2. **Capacidades Geoespaciales**:
   - Soporte nativo para consultas de proximidad geográfica
   - Índices espaciales para búsquedas "escape rooms cerca de mí"
   - Preparado para futuras extensiones con PostGIS

3. **Tipos de Datos Avanzados**:
   - `UUID` nativo para IDs únicos distribuidos
   - `INTERVAL` para duraciones (mejor que TIME)
   - `TIMESTAMP WITH TIME ZONE` para manejo correcto de zonas horarias

4. **Rendimiento y Escalabilidad**:
   - Mejor concurrencia con MVCC (Multi-Version Concurrency Control)
   - Índices GIN para consultas JSONB complejas
   - Mejor rendimiento en consultas analíticas

5. **Costo y Licenciamiento**:
   - Completamente gratuito y open source
   - Sin restricciones de licencia para despliegue en la nube

#### Ejemplos de Consultas Optimizadas:

```sql
-- Buscar escape rooms disponibles un día específico
SELECT * FROM "EscapeRooms" 
WHERE "Schedule_WeeklySchedule" ? 'Saturday'
  AND "IsActive" = true;

-- Encontrar escape rooms cercanos con dificultad específica
SELECT *, 
  SQRT(POW("Location_Latitude" - $lat, 2) + POW("Location_Longitude" - $lng, 2)) as distance
FROM "EscapeRooms" 
WHERE "Difficulty" = 'Medium'
ORDER BY distance LIMIT 10;
```

## Arquitectura

### Estructura del Proyecto (Feature Pattern)

```
EscapeRoomPlanner/
├── backend/
│   ├── EscapeRoomPlanner.Api/              # API REST
│   │   ├── Features/
│   │   │   ├── EscapeRooms/                # Feature: Gestión de Escape Rooms
│   │   │   │   ├── Controllers/
│   │   │   │   └── Endpoints/
│   │   │   ├── Routes/                     # Feature: Gestión de Rutas
│   │   │   ├── Plans/                      # Feature: Planes Multi-día
│   │   │   ├── Maps/                       # Feature: Mapas y Geocoding
│   │   │   ├── Chat/                       # Feature: Chat Inteligente
│   │   │   ├── SocialSharing/              # Feature: Compartir en RRSS
│   │   │   └── Admin/                      # Feature: Administración
│   │   ├── Hubs/                           # SignalR Hubs para tiempo real
│   │   └── Middleware/                     # Middleware personalizado
├── frontend/
│   ├── src/
│   │   ├── features/
│   │   │   ├── escape-rooms/               # Feature: Gestión de Escape Rooms
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   ├── services/
│   │   │   │   └── types/
│   │   │   ├── route-planning/             # Feature: Planificación de Rutas
│   │   │   ├── maps/                       # Feature: Mapas Interactivos
│   │   │   ├── chat/                       # Feature: Chat Inteligente
│   │   │   ├── social-sharing/             # Feature: Compartir en RRSS
│   │   │   └── plans/                      # Feature: Planes Multi-día
│   │   ├── shared/
│   │   │   ├── components/                 # Componentes reutilizables
│   │   │   ├── hooks/                      # Custom hooks
│   │   │   ├── services/                   # Servicios API
│   │   │   ├── stores/                     # Zustand stores
│   │   │   ├── types/                      # TypeScript types
│   │   │   └── utils/                      # Utilidades
│   │   ├── assets/                         # Imágenes, iconos, etc.
│   │   └── styles/                         # Estilos globales
│   ├── EscapeRoomPlanner.Application/       # Capa de Aplicación
│   │   ├── Features/
│   │   │   ├── EscapeRooms/
│   │   │   │   ├── Commands/
│   │   │   │   ├── Queries/
│   │   │   │   ├── Handlers/
│   │   │   │   └── Validators/
│   │   │   ├── Routes/
│   │   │   ├── Plans/
│   │   │   └── Maps/
│   │   ├── Common/
│   │   │   ├── Interfaces/
│   │   │   ├── Behaviors/
│   │   │   └── Exceptions/
│   │   └── Services/
│   ├── EscapeRoomPlanner.Domain/            # Capa de Dominio
│   │   ├── Entities/
│   │   ├── ValueObjects/
│   │   ├── Enums/
│   │   ├── Interfaces/
│   │   └── Events/
│   └── EscapeRoomPlanner.Infrastructure/    # Capa de Infraestructura
│       ├── Data/
│       │   ├── Configurations/
│       │   ├── Repositories/
│       │   └── Migrations/
│       ├── ExternalServices/
│       │   ├── GoogleMaps/
│       │   ├── GooglePlaces/
│       │   └── SocialMedia/
│       └── Services/
└── tests/
    ├── EscapeRoomPlanner.UnitTests/
    ├── EscapeRoomPlanner.IntegrationTests/
    └── EscapeRoomPlanner.E2ETests/
```

### Patrones Arquitectónicos

- **Clean Architecture**: Separación clara de responsabilidades en capas
- **Feature Pattern**: Organización por funcionalidades en lugar de por tipo técnico
- **CQRS**: Separación de comandos y consultas usando MediatR
- **Repository Pattern**: Abstracción del acceso a datos
- **Unit of Work**: Gestión de transacciones
- **Dependency Injection**: Inversión de dependencias

## Arquitectura Frontend (React + TypeScript)

### Estructura de Componentes

```typescript
// Componente principal del mapa
interface MapComponentProps {
  escapeRooms: EscapeRoom[];
  selectedRoute?: Route;
  onRoomSelect: (room: EscapeRoom) => void;
  onRouteUpdate: (route: Route) => void;
}

const MapComponent: React.FC<MapComponentProps> = ({
  escapeRooms,
  selectedRoute,
  onRoomSelect,
  onRouteUpdate
}) => {
  const mapRef = useRef<mapboxgl.Map>();
  const [markers, setMarkers] = useState<mapboxgl.Marker[]>([]);
  
  // Inicialización del mapa con Mapbox GL JS
  useEffect(() => {
    mapRef.current = new mapboxgl.Map({
      container: 'map-container',
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [2.1734, 41.3851], // Barcelona
      zoom: 12
    });
    
    return () => mapRef.current?.remove();
  }, []);
  
  // Gestión de marcadores y rutas
  useMapMarkers(mapRef.current, escapeRooms, onRoomSelect);
  useRouteVisualization(mapRef.current, selectedRoute);
  
  return <div id="map-container" className="w-full h-full" />;
};
```

### Gestión de Estado con Zustand

```typescript
interface PlannerState {
  // Estado del planificador
  currentPlan: Plan | null;
  selectedEscapeRooms: EscapeRoom[];
  currentRoute: Route | null;
  
  // Acciones
  addEscapeRoom: (room: EscapeRoom) => void;
  removeEscapeRoom: (roomId: string) => void;
  updateRoute: (route: Route) => void;
  savePlan: (plan: Plan) => void;
}

const usePlannerStore = create<PlannerState>((set, get) => ({
  currentPlan: null,
  selectedEscapeRooms: [],
  currentRoute: null,
  
  addEscapeRoom: (room) => set((state) => ({
    selectedEscapeRooms: [...state.selectedEscapeRooms, room]
  })),
  
  removeEscapeRoom: (roomId) => set((state) => ({
    selectedEscapeRooms: state.selectedEscapeRooms.filter(r => r.id !== roomId)
  })),
  
  updateRoute: (route) => set({ currentRoute: route }),
  
  savePlan: async (plan) => {
    await planService.savePlan(plan);
    set({ currentPlan: plan });
  }
}));
```

### Hooks Personalizados para Mapas

```typescript
// Hook para gestión de marcadores
const useMapMarkers = (
  map: mapboxgl.Map | undefined,
  escapeRooms: EscapeRoom[],
  onRoomSelect: (room: EscapeRoom) => void
) => {
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  
  useEffect(() => {
    if (!map) return;
    
    // Limpiar marcadores existentes
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current.clear();
    
    // Agregar nuevos marcadores
    escapeRooms.forEach(room => {
      const marker = new mapboxgl.Marker({
        color: getDifficultyColor(room.difficulty)
      })
        .setLngLat([room.location.longitude, room.location.latitude])
        .setPopup(new mapboxgl.Popup().setHTML(createPopupContent(room)))
        .addTo(map);
      
      marker.getElement().addEventListener('click', () => onRoomSelect(room));
      markersRef.current.set(room.id, marker);
    });
    
    return () => {
      markersRef.current.forEach(marker => marker.remove());
    };
  }, [map, escapeRooms, onRoomSelect]);
};

// Hook para visualización de rutas
const useRouteVisualization = (
  map: mapboxgl.Map | undefined,
  route: Route | undefined
) => {
  useEffect(() => {
    if (!map || !route) return;
    
    // Agregar capa de ruta
    if (map.getSource('route')) {
      map.removeLayer('route');
      map.removeSource('route');
    }
    
    map.addSource('route', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: route.coordinates
        }
      }
    });
    
    map.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#3b82f6',
        'line-width': 4
      }
    });
    
    return () => {
      if (map.getSource('route')) {
        map.removeLayer('route');
        map.removeSource('route');
      }
    };
  }, [map, route]);
};
```

### Servicios API con React Query

```typescript
// Servicio para escape rooms
const useEscapeRooms = (filters?: EscapeRoomFilters) => {
  return useQuery({
    queryKey: ['escapeRooms', filters],
    queryFn: () => escapeRoomService.getEscapeRooms(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Servicio para optimización de rutas
const useRouteOptimization = () => {
  return useMutation({
    mutationFn: (escapeRooms: EscapeRoom[]) => 
      routeService.optimizeRoute(escapeRooms),
    onSuccess: (optimizedRoute) => {
      usePlannerStore.getState().updateRoute(optimizedRoute);
    }
  });
};

// Servicio para chat en tiempo real
const useChatService = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_API_URL);
    setSocket(newSocket);
    
    newSocket.on('chatMessage', (message: ChatMessage) => {
      setMessages(prev => [...prev, message]);
    });
    
    return () => newSocket.close();
  }, []);
  
  const sendMessage = useCallback((message: string) => {
    socket?.emit('sendMessage', { message, timestamp: new Date() });
  }, [socket]);
  
  return { messages, sendMessage };
};
```

## Componentes y Interfaces

### Capa de Dominio

#### Entidades Principales

```csharp
// EscapeRoom Entity
public class EscapeRoom : BaseEntity
{
    public string Name { get; private set; }
    public string Description { get; private set; }
    public Address Address { get; private set; }
    public Coordinates Location { get; private set; }
    public TimeSpan EstimatedDuration { get; private set; }
    public DifficultyLevel Difficulty { get; private set; }
    public PriceRange PriceRange { get; private set; }
    public Schedule Schedule { get; private set; }
    public ContactInfo ContactInfo { get; private set; }
    public GooglePlacesInfo GooglePlacesInfo { get; private set; }
}

// Plan Entity (Multi-día)
public class Plan : BaseEntity
{
    public string Name { get; private set; }
    public string Description { get; private set; }
    public DateRange DateRange { get; private set; }
    public UserId CreatedBy { get; private set; }
    public List<DailyRoute> DailyRoutes { get; private set; }
    public PlanStatus Status { get; private set; }
}

// DailyRoute Entity
public class DailyRoute : BaseEntity
{
    public Date Date { get; private set; }
    public List<RouteStop> Stops { get; private set; }
    public TimeSpan EstimatedTotalTime { get; private set; }
    public Money EstimatedCost { get; private set; }
}

// RouteStop Entity
public class RouteStop : BaseEntity
{
    public EscapeRoomId EscapeRoomId { get; private set; }
    public int Order { get; private set; }
    public TimeSpan EstimatedArrivalTime { get; private set; }
    public TimeSpan EstimatedTravelTime { get; private set; }
}
```

#### Value Objects

```csharp
public class Address : ValueObject
{
    public string Street { get; }
    public string City { get; }
    public string PostalCode { get; }
    public string Country { get; }
}

public class Coordinates : ValueObject
{
    public double Latitude { get; }
    public double Longitude { get; }
}

public class Schedule : ValueObject
{
    public Dictionary<DayOfWeek, TimeRange> WeeklySchedule { get; }
    public List<SpecialSchedule> SpecialDates { get; }
}
```

### Capa de Aplicación

#### DTOs y Mapeo

```csharp
// DTOs para transferencia de datos
public record EscapeRoomDto
{
    public Guid Id { get; init; }
    public string Name { get; init; }
    public string Description { get; init; }
    public AddressDto Address { get; init; }
    public CoordinatesDto Location { get; init; }
    public TimeSpan EstimatedDuration { get; init; }
    public string Difficulty { get; init; }
    public PriceRangeDto PriceRange { get; init; }
    public GooglePlacesDto GooglePlaces { get; init; }
}

public record CreateEscapeRoomDto
{
    public string Name { get; init; }
    public string Description { get; init; }
    public AddressDto Address { get; init; }
    public CoordinatesDto Location { get; init; }
    public TimeSpan EstimatedDuration { get; init; }
    public string Difficulty { get; init; }
}

public record PlanDto
{
    public Guid Id { get; init; }
    public string Name { get; init; }
    public string Description { get; init; }
    public DateOnly StartDate { get; init; }
    public DateOnly EndDate { get; init; }
    public List<DailyRouteDto> DailyRoutes { get; init; }
    public string Status { get; init; }
}
```

#### Mappers con Mapperly

```csharp
[Mapper]
public static partial class EscapeRoomMapper
{
    // Mapeo básico de entidad a DTO
    public static partial EscapeRoomDto ToDto(EscapeRoom escapeRoom);
    public static partial List<EscapeRoomDto> ToDto(List<EscapeRoom> escapeRooms);
    
    // Mapeo personalizado para enums
    [MapProperty(nameof(EscapeRoom.Difficulty), nameof(EscapeRoomDto.Difficulty))]
    private static string MapDifficulty(DifficultyLevel difficulty) => difficulty.ToString();
    
    // Mapeo de creación
    [MapperIgnoreTarget(nameof(EscapeRoom.Id))]
    [MapperIgnoreTarget(nameof(EscapeRoom.CreatedAt))]
    public static partial EscapeRoom ToEntity(CreateEscapeRoomDto dto);
}

[Mapper]
public static partial class PlanMapper
{
    public static partial PlanDto ToDto(Plan plan);
    public static partial List<PlanDto> ToDto(List<Plan> plans);
    
    [MapProperty(nameof(Plan.Status), nameof(PlanDto.Status))]
    private static string MapStatus(PlanStatus status) => status.ToString();
}

[Mapper]
public static partial class RouteMapper
{
    public static partial DailyRouteDto ToDto(DailyRoute route);
    public static partial RouteStopDto ToDto(RouteStop stop);
    public static partial List<DailyRouteDto> ToDto(List<DailyRoute> routes);
}
```

#### Interfaces de Servicios

```csharp
public interface IRouteOptimizationService
{
    Task<OptimizedRoute> OptimizeRouteAsync(List<EscapeRoom> escapeRooms, RoutePreferences preferences);
    Task<TimeSpan> CalculateTravelTimeAsync(Coordinates from, Coordinates to, TransportMode mode);
}

public interface IGooglePlacesService
{
    Task<GooglePlaceDetails> GetPlaceDetailsAsync(string placeId);
    Task<List<GoogleReview>> GetReviewsAsync(string placeId);
    Task<List<EscapeRoom>> SearchNearbyEscapeRoomsAsync(Coordinates center, int radiusKm);
}

public interface IChatService
{
    Task<ChatResponse> ProcessUserMessageAsync(string message, UserContext context);
    Task<List<EscapeRoom>> GenerateRecommendationsAsync(UserPreferences preferences);
}

public interface ISocialSharingService
{
    Task<ShareableContent> GenerateShareableContentAsync(Plan plan);
    Task<string> CreatePublicLinkAsync(Plan plan);
}
```

### Capa de Infraestructura

#### Configuración de Base de Datos PostgreSQL

```csharp
public class EscapeRoomConfiguration : IEntityTypeConfiguration<EscapeRoom>
{
    public void Configure(EntityTypeBuilder<EscapeRoom> builder)
    {
        builder.ToTable("EscapeRooms");
        
        builder.HasKey(e => e.Id);
        
        // Configuración básica
        builder.Property(e => e.Name)
            .IsRequired()
            .HasMaxLength(200);
            
        builder.Property(e => e.Description)
            .HasMaxLength(2000);
            
        builder.Property(e => e.Difficulty)
            .IsRequired()
            .HasConversion<string>();
        
        // Value Objects
        builder.OwnsOne(e => e.Address, address =>
        {
            address.Property(a => a.Street)
                .HasMaxLength(200)
                .HasColumnName("Address_Street");
            address.Property(a => a.City)
                .HasMaxLength(100)
                .HasColumnName("Address_City");
            address.Property(a => a.PostalCode)
                .HasMaxLength(20)
                .HasColumnName("Address_PostalCode");
            address.Property(a => a.Country)
                .HasMaxLength(100)
                .HasColumnName("Address_Country");
        });
        
        builder.OwnsOne(e => e.Location, location =>
        {
            location.Property(l => l.Latitude)
                .HasPrecision(10, 8)
                .HasColumnName("Location_Latitude");
            location.Property(l => l.Longitude)
                .HasPrecision(11, 8)
                .HasColumnName("Location_Longitude");
        });
        
        builder.OwnsOne(e => e.PriceRange, priceRange =>
        {
            priceRange.Property(p => p.MinPrice)
                .HasPrecision(10, 2)
                .HasColumnName("PriceRange_MinPrice");
            priceRange.Property(p => p.MaxPrice)
                .HasPrecision(10, 2)
                .HasColumnName("PriceRange_MaxPrice");
            priceRange.Property(p => p.Currency)
                .HasMaxLength(3)
                .HasColumnName("PriceRange_Currency");
        });
        
        // PostgreSQL JSONB para Schedule (ventaja clave)
        builder.OwnsOne(e => e.Schedule, schedule =>
        {
            schedule.Property(s => s.WeeklySchedule)
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                    v => JsonSerializer.Deserialize<Dictionary<DayOfWeek, TimeRange>>(v, (JsonSerializerOptions?)null) ?? new())
                .HasColumnName("Schedule_WeeklySchedule")
                .HasColumnType("jsonb"); // PostgreSQL JSONB nativo
                
            schedule.Property(s => s.SpecialDates)
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                    v => JsonSerializer.Deserialize<List<SpecialSchedule>>(v, (JsonSerializerOptions?)null) ?? new())
                .HasColumnName("Schedule_SpecialDates")
                .HasColumnType("jsonb"); // PostgreSQL JSONB nativo
        });
        
        // Índices optimizados para PostgreSQL
        builder.HasIndex(e => e.Name);
        builder.HasIndex(e => e.Difficulty);
        builder.HasIndex(e => e.IsActive);
    }
}

// Configuración del DbContext para PostgreSQL
public class EscapeRoomPlannerDbContext : DbContext
{
    public EscapeRoomPlannerDbContext(DbContextOptions<EscapeRoomPlannerDbContext> options)
        : base(options) { }

    public DbSet<EscapeRoom> EscapeRooms { get; set; }
    public DbSet<Plan> Plans { get; set; }
    public DbSet<DailyRoute> DailyRoutes { get; set; }
    public DbSet<RouteStop> RouteStops { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Aplicar configuraciones
        modelBuilder.ApplyConfiguration(new EscapeRoomConfiguration());
        modelBuilder.ApplyConfiguration(new PlanConfiguration());
        modelBuilder.ApplyConfiguration(new DailyRouteConfiguration());
        modelBuilder.ApplyConfiguration(new RouteStopConfiguration());
    }
}

// Configuración de servicios para PostgreSQL
public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // PostgreSQL con Npgsql
        services.AddDbContext<EscapeRoomPlannerDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));

        services.AddScoped<DbSeeder>();
        
        return services;
    }
}
```

## Modelos de Datos

### Esquema de Base de Datos PostgreSQL

```sql
-- Tabla principal de Escape Rooms
CREATE TABLE "EscapeRooms" (
    "Id" UUID PRIMARY KEY,
    "Name" VARCHAR(200) NOT NULL,
    "Description" VARCHAR(2000),
    "Address_Street" VARCHAR(200),
    "Address_City" VARCHAR(100),
    "Address_PostalCode" VARCHAR(20),
    "Address_Country" VARCHAR(100),
    "Location_Latitude" DOUBLE PRECISION,
    "Location_Longitude" DOUBLE PRECISION,
    "EstimatedDuration" INTERVAL,
    "Difficulty" TEXT,
    "PriceRange_MinPrice" NUMERIC(10,2),
    "PriceRange_MaxPrice" NUMERIC(10,2),
    "PriceRange_Currency" VARCHAR(3),
    "Schedule_WeeklySchedule" JSONB,
    "Schedule_SpecialDates" JSONB,
    "ContactInfo_Phone" VARCHAR(20),
    "ContactInfo_Email" VARCHAR(100),
    "ContactInfo_Website" VARCHAR(500),
    "GooglePlaces_PlaceId" VARCHAR(100),
    "GooglePlaces_Rating" DOUBLE PRECISION,
    "GooglePlaces_ReviewCount" INTEGER,
    "GooglePlaces_LastUpdated" TIMESTAMP WITH TIME ZONE,
    "IsActive" BOOLEAN DEFAULT true,
    "CreatedAt" TIMESTAMP WITH TIME ZONE,
    "UpdatedAt" TIMESTAMP WITH TIME ZONE
);

-- Índices para optimización
CREATE INDEX "IX_EscapeRooms_Name" ON "EscapeRooms" ("Name");
CREATE INDEX "IX_EscapeRooms_Difficulty" ON "EscapeRooms" ("Difficulty");
CREATE INDEX "IX_EscapeRooms_IsActive" ON "EscapeRooms" ("IsActive");
CREATE INDEX "IX_EscapeRooms_Location" ON "EscapeRooms" ("Location_Latitude", "Location_Longitude");

-- Índices GIN para consultas JSONB (PostgreSQL específico)
CREATE INDEX "IX_EscapeRooms_Schedule_WeeklySchedule" ON "EscapeRooms" USING GIN ("Schedule_WeeklySchedule");
CREATE INDEX "IX_EscapeRooms_Schedule_SpecialDates" ON "EscapeRooms" USING GIN ("Schedule_SpecialDates");

-- Tabla de Planes Multi-día
CREATE TABLE "Plans" (
    "Id" UUID PRIMARY KEY,
    "Name" VARCHAR(200) NOT NULL,
    "Description" VARCHAR(2000),
    "StartDate" DATE,
    "EndDate" DATE,
    "CreatedBy" UUID,
    "Status" TEXT DEFAULT 'Draft',
    "CreatedAt" TIMESTAMP WITH TIME ZONE,
    "UpdatedAt" TIMESTAMP WITH TIME ZONE
);

-- Tabla de Rutas Diarias
CREATE TABLE "DailyRoutes" (
    "Id" UUID PRIMARY KEY,
    "PlanId" UUID REFERENCES "Plans"("Id") ON DELETE CASCADE,
    "Date" DATE,
    "EstimatedTotalTime" INTERVAL,
    "EstimatedCost" NUMERIC(10,2) DEFAULT 0,
    "PreferredTransportMode" TEXT DEFAULT 'Driving',
    "MultiModalStrategy" TEXT DEFAULT 'SingleMode',
    "CreatedAt" TIMESTAMP WITH TIME ZONE,
    "UpdatedAt" TIMESTAMP WITH TIME ZONE
);

-- Tabla de Paradas de Ruta
CREATE TABLE "RouteStops" (
    "Id" UUID PRIMARY KEY,
    "DailyRouteId" UUID REFERENCES "DailyRoutes"("Id") ON DELETE CASCADE,
    "EscapeRoomId" UUID REFERENCES "EscapeRooms"("Id") ON DELETE RESTRICT,
    "Order" INTEGER,
    "EstimatedArrivalTime" INTERVAL,
    "EstimatedTravelTime" INTERVAL,
    "Notes" VARCHAR(500),
    "TransportModeToNext" TEXT,
    "IsMultiModalSegment" BOOLEAN DEFAULT false,
    "CreatedAt" TIMESTAMP WITH TIME ZONE,
    "UpdatedAt" TIMESTAMP WITH TIME ZONE
);

-- Índices únicos para integridad
CREATE UNIQUE INDEX "IX_DailyRoutes_PlanId_Date" ON "DailyRoutes" ("PlanId", "Date");
CREATE UNIQUE INDEX "IX_RouteStops_DailyRouteId_Order" ON "RouteStops" ("DailyRouteId", "Order");
CREATE UNIQUE INDEX "IX_RouteStops_DailyRouteId_EscapeRoomId" ON "RouteStops" ("DailyRouteId", "EscapeRoomId");
```

### Consultas PostgreSQL Avanzadas

```sql
-- Buscar escape rooms por horario usando JSONB
SELECT * FROM "EscapeRooms" 
WHERE "Schedule_WeeklySchedule" ? 'Monday'
  AND "Schedule_WeeklySchedule"->>'Monday' IS NOT NULL;

-- Buscar escape rooms con horarios especiales en una fecha
SELECT * FROM "EscapeRooms" 
WHERE "Schedule_SpecialDates" @> '[{"Date": "2024-12-25"}]';

-- Consulta geoespacial para encontrar escape rooms cercanos
SELECT *, 
  SQRT(POW("Location_Latitude" - 41.3851, 2) + POW("Location_Longitude" - 2.1734, 2)) as distance
FROM "EscapeRooms" 
WHERE "IsActive" = true
ORDER BY distance 
LIMIT 10;

-- Consulta compleja combinando JSONB y geolocalización
SELECT e.*, 
  SQRT(POW(e."Location_Latitude" - $1, 2) + POW(e."Location_Longitude" - $2, 2)) as distance
FROM "EscapeRooms" e
WHERE e."IsActive" = true
  AND e."Schedule_WeeklySchedule" ? $3  -- día de la semana
  AND e."Difficulty" = ANY($4)          -- array de dificultades
ORDER BY distance
LIMIT $5;
```

## Manejo de Errores

### Jerarquía de Excepciones

```csharp
public abstract class DomainException : Exception
{
    protected DomainException(string message) : base(message) { }
}

public class EscapeRoomNotFoundException : DomainException
{
    public EscapeRoomNotFoundException(Guid id) 
        : base($"Escape room with ID {id} was not found.") { }
}

public class InvalidRouteException : DomainException
{
    public InvalidRouteException(string reason) 
        : base($"Invalid route: {reason}") { }
}

public class ExternalServiceException : Exception
{
    public string ServiceName { get; }
    
    public ExternalServiceException(string serviceName, string message) 
        : base($"Error in {serviceName}: {message}")
    {
        ServiceName = serviceName;
    }
}
```

### Middleware de Manejo de Errores

```csharp
public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var response = exception switch
        {
            DomainException => new { error = exception.Message, statusCode = 400 },
            ExternalServiceException => new { error = "External service unavailable", statusCode = 503 },
            _ => new { error = "An error occurred", statusCode = 500 }
        };

        context.Response.StatusCode = response.statusCode;
        await context.Response.WriteAsync(JsonSerializer.Serialize(response));
    }
}
```

## Estrategia de Testing

### Estructura de Tests

```csharp
// Unit Tests - Domain
[TestClass]
public class EscapeRoomTests
{
    [TestMethod]
    public void CreateEscapeRoom_WithValidData_ShouldSucceed()
    {
        // Arrange
        var name = "Mystery Room";
        var address = new Address("123 Main St", "Barcelona", "08001", "Spain");
        
        // Act
        var escapeRoom = EscapeRoom.Create(name, address, /* other params */);
        
        // Assert
        Assert.AreEqual(name, escapeRoom.Name);
        Assert.AreEqual(address, escapeRoom.Address);
    }
}

// Integration Tests - Application
[TestClass]
public class RouteOptimizationServiceTests
{
    [TestMethod]
    public async Task OptimizeRoute_WithMultipleEscapeRooms_ShouldReturnOptimalOrder()
    {
        // Arrange
        var service = new RouteOptimizationService(mockGoogleMapsService);
        var escapeRooms = CreateTestEscapeRooms();
        
        // Act
        var result = await service.OptimizeRouteAsync(escapeRooms, preferences);
        
        // Assert
        Assert.IsTrue(result.TotalTravelTime < TimeSpan.FromHours(2));
    }
}

// E2E Tests - Web
[TestClass]
public class PlanCreationE2ETests
{
    [TestMethod]
    public async Task CreatePlan_CompleteWorkflow_ShouldSucceed()
    {
        // Test complete user journey from plan creation to sharing
    }
}
```

### Mocking de Servicios Externos

```csharp
public class MockGooglePlacesService : IGooglePlacesService
{
    public Task<GooglePlaceDetails> GetPlaceDetailsAsync(string placeId)
    {
        return Task.FromResult(new GooglePlaceDetails
        {
            PlaceId = placeId,
            Rating = 4.5,
            ReviewCount = 150,
            Reviews = CreateMockReviews()
        });
    }
}
```

## Tecnologías y Librerías

### Stack Tecnológico

- **.NET 8**: Framework principal
- **ASP.NET Core MVC**: Capa de presentación
- **Entity Framework Core**: ORM
- **PostgreSQL**: Base de datos principal con soporte JSONB y geoespacial
- **Redis**: Cache distribuido
- **MediatR**: Patrón CQRS
- **FluentValidation**: Validaciones
- **Mapperly**: Mapeo de objetos con source generators para máximo rendimiento
- **Serilog**: Logging estructurado

### Frontend

- **React 18 + TypeScript**: Framework principal para UI interactiva
- **Vite**: Build tool moderno y rápido
- **Tailwind CSS**: Framework CSS utility-first
- **React Query (TanStack Query)**: Gestión de estado del servidor
- **Zustand**: Gestión de estado local ligero
- **Mapbox GL JS**: Mapas interactivos de alto rendimiento
- **Socket.io Client**: Comunicación en tiempo real para chat
- **React Hook Form**: Gestión de formularios
- **Framer Motion**: Animaciones fluidas

### Servicios Externos

- **Mapbox API**: Mapas base y geocoding
- **Google Maps API**: Cálculo de rutas y tiempos (Directions API)
- **Google Places API**: Información y reseñas de lugares
- **Socket.io**: Comunicación en tiempo real
- **Social Media APIs**: Facebook, Twitter, Instagram para compartir

### Herramientas de Desarrollo

- **Docker**: Containerización
- **GitHub Actions**: CI/CD
- **SonarQube**: Análisis de calidad de código
- **Swagger/OpenAPI**: Documentación de API
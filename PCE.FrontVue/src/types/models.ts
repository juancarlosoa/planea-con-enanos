export interface EscapeRoomDto {
  slug: string;
  name: string;
  description: string;
  maxPlayers: number;
  minPlayers: number;
  durationMinutes: number;
  difficultyLevel: string;
  pricePerPerson: number;
  isActive: boolean;
  companySlug: string;
  createdAt: string;
  updatedAt: string | null;
  latitude: number;
  longitude: number;
  address: string;
}

// Interfaz extendida para el mapa con coordenadas (ahora redundante pero útil para futuro)
export interface EscapeRoomMapDto extends EscapeRoomDto {
  // Hereda latitude y longitude del DTO base
}

export interface CompanyDto {
  slug: string;
  name: string;
  email: string;
  phone: string;
  address: string | null;
  website: string | null;
  createdAt: string;
  updatedAt: string | null;
  latitude: number;
  longitude: number;
  escapeRooms: EscapeRoomDto[];
}

export interface CreateEscapeRoomRequest {
  name: string;
  description: string;
  maxPlayers: number;
  minPlayers: number;
  durationMinutes: number;
  difficultyLevel: string;
  pricePerPerson: number;
  companySlug: string;
  latitude: number;
  longitude: number;
  address: string;
}

export interface UpdateEscapeRoomRequest {
  slug: string;
  name: string;
  description: string;
  maxPlayers: number;
  minPlayers: number;
  durationMinutes: number;
  difficultyLevel: string;
  pricePerPerson: number;
  latitude: number;
  longitude: number;
  address: string;
}

export interface CreateCompanyRequest {
  name: string;
  email: string;
  phone: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  website?: string;
}

export interface UpdateCompanyRequest {
  slug: string;
  name: string;
  email: string;
  phone: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  website?: string;
}

export interface LocationResult {
  lat: string;
  lon: string;
  displayName: string;
}

export interface SearchLocationParams {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

// Routing types
export interface RouteCoordinate {
  longitude: number;
  latitude: number;
}

export interface RouteRequest {
  origin: RouteCoordinate;
  destination: RouteCoordinate;
  mode: 'car' | 'foot';
}

export interface RouteResponse {
  distance: number; // in meters
  duration: number; // in seconds
  geometry?: number[][]; // array of [lon, lat] coordinates
}

export interface MockEscapeRoom {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
}

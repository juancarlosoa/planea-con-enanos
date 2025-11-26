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
}

export interface CreateCompanyRequest {
  name: string;
  email: string;
  phone: string;
  address?: string;
  website?: string;
}

export interface UpdateCompanyRequest {
  slug: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  website?: string;
}

// Common types used across the application

export interface EscapeRoom {
    id: string
    name: string
    description: string
    address: string
    latitude: number
    longitude: number
    rating: number
    priceRange: string
    duration: number // in minutes
    difficulty: 'easy' | 'medium' | 'hard'
    theme: string
    maxPlayers: number
    minPlayers: number
    imageUrl?: string
    website?: string
    phone?: string
}

export interface Route {
    id: string
    name: string
    description?: string
    escapeRooms: EscapeRoom[]
    totalDuration: number // in minutes
    totalDistance: number // in kilometers
    estimatedCost: number
    createdAt: Date
    updatedAt: Date
}

export interface Plan {
    id: string
    name: string
    description?: string
    routes: Route[]
    startDate: Date
    endDate: Date
    participants: number
    status: 'draft' | 'confirmed' | 'completed' | 'cancelled'
    createdAt: Date
    updatedAt: Date
}

export interface Location {
    latitude: number
    longitude: number
    address?: string
}

export interface Coordinates {
    latitude: number
    longitude: number
}

export interface ApiResponse<T> {
    data: T
    success: boolean
    message?: string
}

export interface PaginatedResponse<T> {
    data: T[]
    total: number
    page: number
    pageSize: number
    totalPages: number
}
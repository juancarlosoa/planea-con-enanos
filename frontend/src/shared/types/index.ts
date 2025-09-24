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

export interface RouteStop {
    id: string
    escapeRoomId: string
    escapeRoom?: EscapeRoom
    order: number
    estimatedArrivalTime: number // minutes from start of day
    estimatedTravelTime: number // minutes to next stop
    notes?: string
    transportModeToNext?: string
    isMultiModalSegment: boolean
}

export interface DailyRoute {
    id: string
    date: string // ISO date string
    planId: string
    estimatedTotalTime: number // in minutes
    estimatedCost: number
    preferredTransportMode: 'driving' | 'walking' | 'publicTransport' | 'cycling'
    multiModalStrategy: 'singleMode' | 'parkAndWalk' | 'publicTransportAndWalk' | 'automatic'
    stops: RouteStop[]
    createdAt: Date
    updatedAt: Date
}

export interface Plan {
    id: string
    name: string
    description?: string
    startDate: string // ISO date string
    endDate: string // ISO date string
    dailyRoutes: DailyRoute[]
    createdBy: string
    status: 'draft' | 'active' | 'completed' | 'cancelled' | 'archived'
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
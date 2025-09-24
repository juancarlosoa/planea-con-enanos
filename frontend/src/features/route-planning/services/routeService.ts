import { apiService } from '../../../shared/services/api';
import { Coordinates } from '../../../shared/types';

export interface RoutePreferences {
  allowedTransportModes: string[];
  preferredTransportMode: string;
  strategy: string;
  maxTotalTimeMinutes?: number;
  maxBudget?: number;
  optimizeForTime: boolean;
  optimizeForCost: boolean;
  startLocation?: Coordinates;
  endLocation?: Coordinates;
  multiModalSettings?: MultiModalPreferences;
}

export interface MultiModalPreferences {
  maxWalkingDistanceKm: number;
  maxCyclingDistanceKm: number;
  preferParkAndWalk: boolean;
  allowPublicTransportTransfers: boolean;
  maxTransfers: number;
  maxTransferWaitTimeMinutes: number;
}

export interface OptimizedRoute {
  escapeRoomIds: string[];
  totalTravelTimeMinutes: number;
  totalCost: number;
  segments: RouteSegment[];
  optimizationScore: number;
}

export interface RouteSegment {
  from: Coordinates;
  to: Coordinates;
  travelTimeMinutes: number;
  cost: number;
  distance: number;
  mode: string;
  routePoints: Coordinates[];
  instructions?: string;
  legs: TransportLeg[];
}

export interface TransportLeg {
  from: Coordinates;
  to: Coordinates;
  mode: string;
  durationMinutes: number;
  cost: number;
  distance: number;
  instructions?: string;
  path: Coordinates[];
}

export interface TravelTime {
  travelTimeMinutes: number;
  estimatedCost: number;
  distance: number;
}

export interface OptimizeRouteRequest {
  escapeRoomIds: string[];
  preferences: RoutePreferences;
}

export interface CalculateTravelTimeRequest {
  from: Coordinates;
  to: Coordinates;
  transportMode: string;
}

export interface GetRouteSegmentRequest {
  from: Coordinates;
  to: Coordinates;
  transportMode: string;
}

export interface GetOptimalTransportModesRequest {
  waypoints: Coordinates[];
  preferences: RoutePreferences;
}

class RouteService {
  async optimizeRoute(request: OptimizeRouteRequest): Promise<OptimizedRoute> {
    return await apiService.post<OptimizedRoute>('/api/routes/optimize', request);
  }

  async calculateTravelTime(request: CalculateTravelTimeRequest): Promise<TravelTime> {
    return await apiService.post<TravelTime>('/api/routes/travel-time', request);
  }

  async getRouteSegment(request: GetRouteSegmentRequest): Promise<RouteSegment> {
    return await apiService.post<RouteSegment>('/api/routes/route-segment', request);
  }

  async getOptimalTransportModes(request: GetOptimalTransportModesRequest): Promise<string[]> {
    return await apiService.post<string[]>('/api/routes/optimal-transport-modes', request);
  }

  // Helper method to create default preferences
  createDefaultPreferences(): RoutePreferences {
    return {
      allowedTransportModes: ['Driving'],
      preferredTransportMode: 'Driving',
      strategy: 'SingleMode',
      optimizeForTime: true,
      optimizeForCost: false,
      multiModalSettings: {
        maxWalkingDistanceKm: 1.0,
        maxCyclingDistanceKm: 5.0,
        preferParkAndWalk: false,
        allowPublicTransportTransfers: true,
        maxTransfers: 2,
        maxTransferWaitTimeMinutes: 15
      }
    };
  }

  // Helper method to estimate travel time using Haversine distance
  estimateTravelTime(from: Coordinates, to: Coordinates, mode: string = 'Driving'): number {
    const distance = this.calculateHaversineDistance(from, to);
    
    const speedKmh = {
      'Driving': 30, // City driving
      'Walking': 5,
      'Cycling': 15,
      'PublicTransport': 20
    }[mode] || 30;

    return Math.round((distance / speedKmh) * 60); // Convert to minutes
  }

  // Helper method to calculate Haversine distance
  private calculateHaversineDistance(from: Coordinates, to: Coordinates): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(to.latitude - from.latitude);
    const dLon = this.toRadians(to.longitude - from.longitude);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(from.latitude)) * Math.cos(this.toRadians(to.latitude)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

export const routeService = new RouteService();
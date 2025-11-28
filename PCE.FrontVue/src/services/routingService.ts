import axios from 'axios';
import type { RouteRequest, RouteResponse, MockEscapeRoom } from '../types/models';

// Mock data for Madrid escape rooms with real coordinates
export const mockMadridRooms: MockEscapeRoom[] = [
    {
        id: 'room-1',
        name: 'The Fox in the Box - Gran Vía',
        latitude: 40.4200,
        longitude: -3.7038,
        address: 'Gran Vía, 32, Madrid'
    },
    {
        id: 'room-2',
        name: 'Parapark - Chueca',
        latitude: 40.4231,
        longitude: -3.6958,
        address: 'Calle de Hortaleza, 74, Madrid'
    },
    {
        id: 'room-3',
        name: 'Escape Room Madrid - Sol',
        latitude: 40.4168,
        longitude: -3.7038,
        address: 'Puerta del Sol, 7, Madrid'
    },
    {
        id: 'room-4',
        name: 'Mystery Escape - Malasaña',
        latitude: 40.4267,
        longitude: -3.7038,
        address: 'Calle de San Bernardo, 5, Madrid'
    },
    {
        id: 'room-5',
        name: 'Enigma Express - Retiro',
        latitude: 40.4153,
        longitude: -3.6844,
        address: 'Calle de Alcalá, 45, Madrid'
    },
    {
        id: 'room-6',
        name: 'Time Escape - Salamanca',
        latitude: 40.4260,
        longitude: -3.6844,
        address: 'Calle de Goya, 28, Madrid'
    }
];

class RoutingService {
    private getOsrmUrl(mode: 'car' | 'foot'): string {
        // Port 7000 for car, 7001 for foot
        const port = mode === 'car' ? 7000 : 7001;
        return `http://localhost:${port}/route/v1/${mode}`;
    }

    async getRoute(request: RouteRequest): Promise<RouteResponse> {
        const { origin, destination, mode } = request;

        // OSRM expects coordinates in lon,lat format
        const coords = `${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}`;
        const url = `${this.getOsrmUrl(mode)}/${coords}`;

        try {
            const response = await axios.get(url, {
                params: {
                    overview: 'full', // Get full geometry
                    geometries: 'geojson', // Use GeoJSON format for geometry
                    steps: false
                }
            });

            if (response.data.code !== 'Ok' || !response.data.routes || response.data.routes.length === 0) {
                throw new Error('No route found');
            }

            const route = response.data.routes[0];

            // Extract geometry coordinates from GeoJSON format
            const geometry = route.geometry?.coordinates || [];

            return {
                distance: route.distance, // meters
                duration: route.duration, // seconds
                geometry: geometry // array of [lon, lat]
            };
        } catch (error) {
            console.error('Error fetching route:', error);
            throw error;
        }
    }

    getMockRooms(): MockEscapeRoom[] {
        return mockMadridRooms;
    }
}

export const routingService = new RoutingService();

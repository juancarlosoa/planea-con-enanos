import apiClient from './api';
import type { LocationResult, SearchLocationParams } from '../types/models';

export const locationService = {
    async searchLocation(params: SearchLocationParams): Promise<LocationResult[]> {
        const queryParams = new URLSearchParams();
        if (params.street) queryParams.append('street', params.street);
        if (params.city) queryParams.append('city', params.city);
        if (params.state) queryParams.append('state', params.state);
        if (params.postalCode) queryParams.append('postalCode', params.postalCode);
        if (params.country) queryParams.append('country', params.country);

        const response = await apiClient.get<LocationResult[]>(`/location/search?${queryParams.toString()}`);
        return response.data;
    }
};

import { useMutation, useQuery } from '@tanstack/react-query';
import { routeService, OptimizeRouteRequest, CalculateTravelTimeRequest, GetRouteSegmentRequest, GetOptimalTransportModesRequest } from '../services/routeService';
import { Coordinates } from '../../../shared/types';

export const useRouteOptimization = () => {
  return useMutation({
    mutationFn: (request: OptimizeRouteRequest) => routeService.optimizeRoute(request),
    onError: (error) => {
      console.error('Error optimizing route:', error);
    }
  });
};

export const useTravelTimeCalculation = () => {
  return useMutation({
    mutationFn: (request: CalculateTravelTimeRequest) => routeService.calculateTravelTime(request),
    onError: (error) => {
      console.error('Error calculating travel time:', error);
    }
  });
};

export const useRouteSegment = () => {
  return useMutation({
    mutationFn: (request: GetRouteSegmentRequest) => routeService.getRouteSegment(request),
    onError: (error) => {
      console.error('Error getting route segment:', error);
    }
  });
};

export const useOptimalTransportModes = () => {
  return useMutation({
    mutationFn: (request: GetOptimalTransportModesRequest) => routeService.getOptimalTransportModes(request),
    onError: (error) => {
      console.error('Error getting optimal transport modes:', error);
    }
  });
};

// Hook for quick travel time estimation (client-side calculation)
export const useEstimateTravelTime = (from?: Coordinates, to?: Coordinates, mode: string = 'Driving') => {
  return useQuery({
    queryKey: ['estimateTravelTime', from, to, mode],
    queryFn: () => {
      if (!from || !to) return null;
      return {
        travelTimeMinutes: routeService.estimateTravelTime(from, to, mode),
        estimatedCost: 0,
        distance: 0
      };
    },
    enabled: !!from && !!to,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
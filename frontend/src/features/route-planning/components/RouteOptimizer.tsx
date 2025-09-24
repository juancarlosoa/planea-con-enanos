import React, { useState } from 'react';
import { useRouteOptimization } from '../hooks/useRouteOptimization';
import { RoutePreferences, routeService } from '../services/routeService';
import { EscapeRoom } from '../../../shared/types';
import { usePlannerStore } from '../../../shared/stores/plannerStore';

interface RouteOptimizerProps {
  escapeRooms: EscapeRoom[];
  onRouteOptimized?: (optimizedRoute: any) => void;
}

export const RouteOptimizer: React.FC<RouteOptimizerProps> = ({
  escapeRooms,
  onRouteOptimized
}) => {
  const { setOptimizedRoute } = usePlannerStore();
  const optimizeRouteMutation = useRouteOptimization();
  
  const [preferences, setPreferences] = useState<RoutePreferences>(() => 
    routeService.createDefaultPreferences()
  );

  const handleOptimizeRoute = async () => {
    if (escapeRooms.length < 2) {
      alert('Please select at least 2 escape rooms to optimize the route.');
      return;
    }

    try {
      const result = await optimizeRouteMutation.mutateAsync({
        escapeRoomIds: escapeRooms.map(er => er.id),
        preferences
      });

      setOptimizedRoute(result);
      onRouteOptimized?.(result);
    } catch (error) {
      console.error('Failed to optimize route:', error);
    }
  };

  const handlePreferenceChange = (key: keyof RoutePreferences, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleTransportModeToggle = (mode: string) => {
    setPreferences(prev => ({
      ...prev,
      allowedTransportModes: prev.allowedTransportModes.includes(mode)
        ? prev.allowedTransportModes.filter(m => m !== mode)
        : [...prev.allowedTransportModes, mode]
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Route Optimization</h3>
      
      {/* Transport Mode Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Transport Modes
        </label>
        <div className="flex flex-wrap gap-2">
          {['Driving', 'Walking', 'Cycling', 'PublicTransport'].map(mode => (
            <button
              key={mode}
              onClick={() => handleTransportModeToggle(mode)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                preferences.allowedTransportModes.includes(mode)
                  ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                  : 'bg-gray-100 text-gray-600 border-2 border-gray-200 hover:bg-gray-200'
              }`}
            >
              {mode === 'PublicTransport' ? 'Public Transport' : mode}
            </button>
          ))}
        </div>
      </div>

      {/* Preferred Transport Mode */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Preferred Mode
        </label>
        <select
          value={preferences.preferredTransportMode}
          onChange={(e) => handlePreferenceChange('preferredTransportMode', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {preferences.allowedTransportModes.map(mode => (
            <option key={mode} value={mode}>
              {mode === 'PublicTransport' ? 'Public Transport' : mode}
            </option>
          ))}
        </select>
      </div>

      {/* Strategy Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Strategy
        </label>
        <select
          value={preferences.strategy}
          onChange={(e) => handlePreferenceChange('strategy', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="SingleMode">Single Mode</option>
          <option value="DistanceBased">Distance Based</option>
          <option value="ParkAndWalk">Park and Walk</option>
          <option value="PublicTransportAndWalk">Public Transport + Walk</option>
          <option value="Automatic">Automatic</option>
        </select>
      </div>

      {/* Optimization Preferences */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Optimize For
        </label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={preferences.optimizeForTime}
              onChange={(e) => handlePreferenceChange('optimizeForTime', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">Time</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={preferences.optimizeForCost}
              onChange={(e) => handlePreferenceChange('optimizeForCost', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">Cost</span>
          </label>
        </div>
      </div>

      {/* Time and Budget Constraints */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Max Time (minutes)
          </label>
          <input
            type="number"
            value={preferences.maxTotalTimeMinutes || ''}
            onChange={(e) => handlePreferenceChange('maxTotalTimeMinutes', 
              e.target.value ? parseInt(e.target.value) : undefined)}
            placeholder="No limit"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Max Budget (€)
          </label>
          <input
            type="number"
            step="0.01"
            value={preferences.maxBudget || ''}
            onChange={(e) => handlePreferenceChange('maxBudget', 
              e.target.value ? parseFloat(e.target.value) : undefined)}
            placeholder="No limit"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Optimize Button */}
      <button
        onClick={handleOptimizeRoute}
        disabled={optimizeRouteMutation.isPending || escapeRooms.length < 2}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {optimizeRouteMutation.isPending ? 'Optimizing...' : 'Optimize Route'}
      </button>

      {/* Results Summary */}
      {optimizeRouteMutation.data && (
        <div className="mt-4 p-4 bg-green-50 rounded-md">
          <h4 className="font-medium text-green-800 mb-2">Route Optimized!</h4>
          <div className="text-sm text-green-700 space-y-1">
            <p>Total Travel Time: {optimizeRouteMutation.data.totalTravelTimeMinutes} minutes</p>
            <p>Estimated Cost: €{optimizeRouteMutation.data.totalCost.toFixed(2)}</p>
            <p>Optimization Score: {(optimizeRouteMutation.data.optimizationScore * 100).toFixed(1)}%</p>
            <p>Route Segments: {optimizeRouteMutation.data.segments.length}</p>
          </div>
        </div>
      )}

      {/* Error Display */}
      {optimizeRouteMutation.error && (
        <div className="mt-4 p-4 bg-red-50 rounded-md">
          <h4 className="font-medium text-red-800 mb-2">Optimization Failed</h4>
          <p className="text-sm text-red-700">
            {optimizeRouteMutation.error.message || 'An error occurred while optimizing the route.'}
          </p>
        </div>
      )}
    </div>
  );
};
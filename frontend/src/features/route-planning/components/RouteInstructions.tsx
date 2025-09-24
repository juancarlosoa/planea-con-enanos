import React from 'react'
import { RouteSegment } from '../services/routeService'
import { useRouteInstructions } from '../../maps/hooks/useRouteVisualization'

interface RouteInstructionsProps {
  routeSegments?: RouteSegment[]
  className?: string
  showDetails?: boolean
}

const getTransportModeIcon = (mode: string): string => {
  switch (mode.toLowerCase()) {
    case 'driving':
      return '🚗'
    case 'walking':
      return '🚶'
    case 'cycling':
      return '🚴'
    case 'publictransport':
      return '🚌'
    default:
      return '📍'
  }
}

const getTransportModeColor = (mode: string): string => {
  switch (mode.toLowerCase()) {
    case 'driving':
      return 'bg-blue-100 text-blue-800'
    case 'walking':
      return 'bg-green-100 text-green-800'
    case 'cycling':
      return 'bg-yellow-100 text-yellow-800'
    case 'publictransport':
      return 'bg-purple-100 text-purple-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
}

const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`
  }
  return `${distance.toFixed(1)} km`
}

export const RouteInstructions: React.FC<RouteInstructionsProps> = ({
  routeSegments,
  className = '',
  showDetails = true
}) => {
  const instructions = useRouteInstructions(routeSegments)

  if (!routeSegments || routeSegments.length === 0) {
    return (
      <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
        <p className="text-gray-500 text-center">No hay instrucciones de ruta disponibles</p>
      </div>
    )
  }

  const totalDuration = routeSegments.reduce((sum, segment) => sum + segment.travelTimeMinutes, 0)
  const totalDistance = routeSegments.reduce((sum, segment) => sum + segment.distance, 0)
  const totalCost = routeSegments.reduce((sum, segment) => sum + segment.cost, 0)

  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      {/* Summary Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Instrucciones de Ruta</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="font-medium text-gray-900">{formatDuration(totalDuration)}</div>
            <div className="text-gray-500">Tiempo total</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-gray-900">{formatDistance(totalDistance)}</div>
            <div className="text-gray-500">Distancia</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-gray-900">€{totalCost.toFixed(2)}</div>
            <div className="text-gray-500">Coste estimado</div>
          </div>
        </div>
      </div>

      {/* Instructions List */}
      <div className="p-4">
        <div className="space-y-4">
          {instructions.map((instruction, index) => (
            <div key={index} className="flex items-start space-x-3">
              {/* Step Number */}
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                {instruction.step}
              </div>

              {/* Instruction Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-lg">{getTransportModeIcon(instruction.mode)}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTransportModeColor(instruction.mode)}`}>
                    {instruction.mode === 'PublicTransport' ? 'Transporte Público' : instruction.mode}
                  </span>
                </div>

                <div className="text-sm text-gray-900 mb-1">
                  {instruction.instructions}
                </div>

                {showDetails && (
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>{formatDuration(instruction.duration)}</span>
                    <span>{formatDistance(instruction.distance)}</span>
                    <span>€{instruction.cost.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Multi-modal legs if available */}
        {routeSegments.some(segment => segment.legs && segment.legs.length > 0) && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Detalles de Transporte Multimodal</h4>
            <div className="space-y-3">
              {routeSegments.map((segment, segmentIndex) => 
                segment.legs && segment.legs.length > 0 ? (
                  <div key={segmentIndex} className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm font-medium text-gray-900 mb-2">
                      Segmento {segmentIndex + 1}
                    </div>
                    <div className="space-y-2">
                      {segment.legs.map((leg, legIndex) => (
                        <div key={legIndex} className="flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-2">
                            <span>{getTransportModeIcon(leg.mode)}</span>
                            <span className="text-gray-600">{leg.mode}</span>
                          </div>
                          <div className="flex items-center space-x-3 text-gray-500">
                            <span>{formatDuration(leg.durationMinutes)}</span>
                            <span>{formatDistance(leg.distance)}</span>
                            <span>€{leg.cost.toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RouteInstructions
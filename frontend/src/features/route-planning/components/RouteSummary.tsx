import React from 'react'
import { Clock, MapPin, Route as RouteIcon, AlertTriangle } from 'lucide-react'
import { EscapeRoom } from '@/shared/types'
import { Card, LoadingSpinner } from '@/shared/components'

interface RouteSummaryProps {
  escapeRooms: EscapeRoom[]
  isCalculating?: boolean
  routePreview?: {
    totalTime: number
    totalDistance: number
    estimatedCost: number
  } | null
  className?: string
}

const RouteSummary: React.FC<RouteSummaryProps> = ({
  escapeRooms,
  isCalculating = false,
  routePreview,
  className = ''
}) => {
  // Calculate basic stats from escape rooms
  const totalEscapeRoomTime = escapeRooms.reduce((total, room) => total + room.duration, 0)
  const estimatedTravelTime = escapeRooms.length > 1 ? (escapeRooms.length - 1) * 30 : 0 // 30 min between each
  const totalTimeWithTravel = totalEscapeRoomTime + estimatedTravelTime

  const averagePrice = escapeRooms.length > 0 
    ? escapeRooms.reduce((sum, room) => {
        const price = parseFloat(room.priceRange.split('-')[0].replace('€', '')) || 25
        return sum + price
      }, 0) / escapeRooms.length
    : 0

  const totalEstimatedCost = escapeRooms.reduce((sum, room) => {
    const price = parseFloat(room.priceRange.split('-')[0].replace('€', '')) || 25
    return sum + price
  }, 0)

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
    }
    return `${mins}m`
  }

  const formatDistance = (km: number): string => {
    return km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`
  }

  if (escapeRooms.length === 0) {
    return (
      <Card className={className}>
        <Card.Header>
          <Card.Title>Resumen de Ruta</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="text-center text-gray-500 py-8">
            <RouteIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-sm">Selecciona escape rooms para ver el resumen</p>
          </div>
        </Card.Content>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <Card.Header>
        <Card.Title>Resumen de Ruta</Card.Title>
      </Card.Header>
      <Card.Content>
        <div className="space-y-4">
          {/* Basic stats grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <MapPin className="h-4 w-4 text-gray-600 mr-1" />
                <span className="text-sm font-medium text-gray-700">Escape Rooms</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{escapeRooms.length}</p>
            </div>

            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <Clock className="h-4 w-4 text-gray-600 mr-1" />
                <span className="text-sm font-medium text-gray-700">Tiempo Total</span>
              </div>
              <p className="text-xl font-bold text-gray-900">
                {routePreview ? formatTime(routePreview.totalTime) : formatTime(totalTimeWithTravel)}
              </p>
            </div>
          </div>

          {/* Detailed breakdown */}
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tiempo en escape rooms:</span>
              <span className="font-medium text-gray-900">{formatTime(totalEscapeRoomTime)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tiempo de viaje estimado:</span>
              <span className="font-medium text-gray-900">
                {routePreview ? formatTime(routePreview.totalTime - totalEscapeRoomTime) : formatTime(estimatedTravelTime)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Distancia total:</span>
              <span className="font-medium text-gray-900">
                {routePreview ? formatDistance(routePreview.totalDistance) : 'Calculando...'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Costo estimado:</span>
              <span className="font-medium text-gray-900">
                €{routePreview ? routePreview.estimatedCost.toFixed(2) : totalEstimatedCost.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Precio promedio:</span>
              <span className="font-medium text-gray-900">€{averagePrice.toFixed(2)}</span>
            </div>
          </div>

          {/* Calculation status */}
          {isCalculating && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center text-blue-700">
                <LoadingSpinner size="sm" className="mr-2" />
                <span className="text-sm">Calculando ruta optimizada...</span>
              </div>
            </div>
          )}

          {/* Warnings */}
          {totalTimeWithTravel > 480 && ( // More than 8 hours
            <div className="bg-yellow-50 p-3 rounded-lg">
              <div className="flex items-start text-yellow-700">
                <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">Ruta muy larga</p>
                  <p>Esta ruta podría ser demasiado larga para un solo día. Considera dividirla en múltiples días.</p>
                </div>
              </div>
            </div>
          )}

          {escapeRooms.length > 6 && (
            <div className="bg-orange-50 p-3 rounded-lg">
              <div className="flex items-start text-orange-700">
                <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">Muchas paradas</p>
                  <p>Considera reducir el número de escape rooms para una experiencia más relajada.</p>
                </div>
              </div>
            </div>
          )}

          {/* Difficulty distribution */}
          {escapeRooms.length > 0 && (
            <div className="pt-3 border-t">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Distribución de Dificultad</h4>
              <div className="flex gap-2">
                {['easy', 'medium', 'hard'].map(difficulty => {
                  const count = escapeRooms.filter(room => room.difficulty === difficulty).length
                  const percentage = (count / escapeRooms.length) * 100
                  
                  if (count === 0) return null
                  
                  const colors = {
                    easy: 'bg-green-500',
                    medium: 'bg-yellow-500',
                    hard: 'bg-red-500'
                  }
                  
                  return (
                    <div key={difficulty} className="flex-1">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span className="capitalize">{difficulty}</span>
                        <span>{count}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${colors[difficulty as keyof typeof colors]}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </Card.Content>
    </Card>
  )
}

export default RouteSummary
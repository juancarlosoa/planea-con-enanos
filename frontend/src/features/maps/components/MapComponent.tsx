import React, { useEffect, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import { EscapeRoom } from '@/shared/types'
import { useOptimizedRoute } from '../../../shared/stores/plannerStore'
import { RouteSegment } from '../../route-planning/services/routeService'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in Leaflet with Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface MapComponentProps {
  escapeRooms: EscapeRoom[]
  selectedEscapeRoom?: EscapeRoom | null
  selectedEscapeRooms?: EscapeRoom[]
  onEscapeRoomSelect?: (escapeRoom: EscapeRoom) => void
  onEscapeRoomDeselect?: () => void
  onEscapeRoomToggle?: (escapeRoom: EscapeRoom) => void
  className?: string
  center?: [number, number] // [latitude, longitude] - Leaflet uses lat, lng order
  zoom?: number
  showRoute?: boolean
  showOptimizedRoute?: boolean
}

// Component to handle map bounds and centering
const MapController: React.FC<{
  escapeRooms: EscapeRoom[]
  selectedEscapeRoom?: EscapeRoom | null
  optimizedRoute?: any
}> = ({ escapeRooms, selectedEscapeRoom, optimizedRoute }) => {
  const map = useMap()

  useEffect(() => {
    if (escapeRooms.length === 0) return

    if (selectedEscapeRoom) {
      // Center on selected escape room
      map.setView([selectedEscapeRoom.latitude, selectedEscapeRoom.longitude], 15)
    } else if (optimizedRoute && optimizedRoute.segments.length > 0) {
      // Fit bounds to optimized route
      const bounds = L.latLngBounds([])
      optimizedRoute.segments.forEach((segment: RouteSegment) => {
        bounds.extend([segment.from.latitude, segment.from.longitude])
        bounds.extend([segment.to.latitude, segment.to.longitude])
        if (segment.routePoints && segment.routePoints.length > 0) {
          segment.routePoints.forEach(point => {
            bounds.extend([point.latitude, point.longitude])
          })
        }
      })
      map.fitBounds(bounds, { padding: [20, 20] })
    } else if (escapeRooms.length > 1) {
      // Fit bounds to show all escape rooms
      const bounds = L.latLngBounds(
        escapeRooms.map(room => [room.latitude, room.longitude])
      )
      map.fitBounds(bounds, { padding: [20, 20] })
    } else if (escapeRooms.length === 1) {
      // Center on single escape room
      map.setView([escapeRooms[0].latitude, escapeRooms[0].longitude], 14)
    }
  }, [map, escapeRooms, selectedEscapeRoom, optimizedRoute])

  return null
}

// Helper function to get difficulty color
const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return '#10b981' // green
    case 'medium':
      return '#f59e0b' // yellow
    case 'hard':
      return '#ef4444' // red
    default:
      return '#6b7280' // gray
  }
}

const MapComponent: React.FC<MapComponentProps> = ({
  escapeRooms,
  selectedEscapeRoom,
  selectedEscapeRooms = [],
  onEscapeRoomSelect,
  onEscapeRoomDeselect: _onEscapeRoomDeselect,
  onEscapeRoomToggle,
  className = 'w-full h-full',
  center = [41.3851, 2.1734], // Barcelona coordinates [lat, lng]
  zoom = 12,
  showRoute = false,
  showOptimizedRoute = true
}) => {
  const optimizedRoute = useOptimizedRoute()

  // Create custom icon for each escape room
  const createCustomIcon = useCallback((escapeRoom: EscapeRoom, isSelected: boolean = false, isInRoute: boolean = false, routeOrder?: number) => {
    const color = getDifficultyColor(escapeRoom.difficulty)
    const size = isSelected ? 40 : (isInRoute ? 35 : 30)
    const borderColor = isInRoute ? '#3b82f6' : 'white'
    const borderWidth = isInRoute ? 4 : 3

    return L.divIcon({
      html: `
        <div style="
          width: ${size}px;
          height: ${size}px;
          background-color: ${color};
          border: ${borderWidth}px solid ${borderColor};
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        ">
          ${isInRoute && routeOrder !== undefined ? `
            <div style="
              position: absolute;
              top: -8px;
              right: -8px;
              width: 20px;
              height: 20px;
              background-color: #3b82f6;
              color: white;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 12px;
              font-weight: bold;
              border: 2px solid white;
            ">${routeOrder + 1}</div>
          ` : ''}
          <div style="
            width: 8px;
            height: 8px;
            background-color: white;
            border-radius: 50%;
          "></div>
        </div>
      `,
      className: 'custom-escape-room-marker',
      iconSize: [size, size],
      iconAnchor: [size / 2, size],
      popupAnchor: [0, -size]
    })
  }, [])

  // Create optimized route polylines
  const createOptimizedRoutePolylines = useCallback(() => {
    if (!optimizedRoute || !optimizedRoute.segments || optimizedRoute.segments.length === 0) {
      return []
    }

    return optimizedRoute.segments.map((segment: RouteSegment, index: number) => {
      const positions: [number, number][] = []

      if (segment.routePoints && segment.routePoints.length > 0) {
        // Use detailed route points if available
        segment.routePoints.forEach(point => {
          positions.push([point.latitude, point.longitude])
        })
      } else {
        // Fallback to straight line
        positions.push([segment.from.latitude, segment.from.longitude])
        positions.push([segment.to.latitude, segment.to.longitude])
      }

      return (
        <Polyline
          key={`optimized-segment-${index}`}
          positions={positions}
          color="#10b981"
          weight={6}
          opacity={0.8}
        />
      )
    })
  }, [optimizedRoute])

  return (
    <div className={className}>
      <MapContainer
        center={center}
        zoom={zoom}
        className="w-full h-full rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController
          escapeRooms={escapeRooms}
          selectedEscapeRoom={selectedEscapeRoom}
          optimizedRoute={optimizedRoute}
        />

        {/* Simple route visualization for selected escape rooms */}
        {showRoute && selectedEscapeRooms.length > 1 && (
          <Polyline
            positions={selectedEscapeRooms.map(room => [room.latitude, room.longitude])}
            color="#3b82f6"
            weight={4}
            opacity={0.7}
            dashArray="10, 10"
          />
        )}

        {/* Optimized route visualization */}
        {showOptimizedRoute && createOptimizedRoutePolylines()}

        {escapeRooms.map((escapeRoom) => {
          const isSelected = selectedEscapeRoom?.id === escapeRoom.id
          const isInRoute = selectedEscapeRooms.some(room => room.id === escapeRoom.id)
          const routeOrder = selectedEscapeRooms.findIndex(room => room.id === escapeRoom.id)

          return (
            <Marker
              key={escapeRoom.id}
              position={[escapeRoom.latitude, escapeRoom.longitude]}
              icon={createCustomIcon(escapeRoom, isSelected, isInRoute, routeOrder >= 0 ? routeOrder : undefined)}
              eventHandlers={{
                click: (e) => {
                  e.originalEvent.stopPropagation()
                  if (onEscapeRoomToggle) {
                    onEscapeRoomToggle(escapeRoom)
                  } else if (onEscapeRoomSelect) {
                    onEscapeRoomSelect(escapeRoom)
                  }
                }
              }}
            >
              <Popup>
                <div className="p-3 min-w-[250px]">
                  <h3 className="font-bold text-lg mb-2">{escapeRoom.name}</h3>
                  <p className="text-gray-600 text-sm mb-3">{escapeRoom.description}</p>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Dirección:</span>
                      <span className="text-gray-600">{escapeRoom.address}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-medium">Dificultad:</span>
                      <span
                        className="px-2 py-1 rounded text-xs font-medium"
                        style={{
                          backgroundColor: `${getDifficultyColor(escapeRoom.difficulty)}20`,
                          color: getDifficultyColor(escapeRoom.difficulty)
                        }}
                      >
                        {escapeRoom.difficulty.charAt(0).toUpperCase() + escapeRoom.difficulty.slice(1)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-medium">Duración:</span>
                      <span className="text-gray-600">{escapeRoom.duration} min</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-medium">Jugadores:</span>
                      <span className="text-gray-600">{escapeRoom.minPlayers}-{escapeRoom.maxPlayers}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-medium">Precio:</span>
                      <span className="text-gray-600">{escapeRoom.priceRange}</span>
                    </div>

                    {escapeRoom.rating && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Rating:</span>
                        <span className="text-gray-600">⭐ {escapeRoom.rating}/5</span>
                      </div>
                    )}

                    {isInRoute && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Posición en ruta:</span>
                        <span className="text-blue-600 font-medium">#{routeOrder + 1}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t">
                    {onEscapeRoomToggle ? (
                      <button
                        className={`w-full px-3 py-2 rounded text-sm font-medium transition-colors ${isInRoute
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        onClick={() => onEscapeRoomToggle(escapeRoom)}
                      >
                        {isInRoute ? 'Quitar de la Ruta' : 'Agregar a la Ruta'}
                      </button>
                    ) : (
                      <button
                        className="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
                        onClick={() => onEscapeRoomSelect && onEscapeRoomSelect(escapeRoom)}
                      >
                        Seleccionar Escape Room
                      </button>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}

export default MapComponent
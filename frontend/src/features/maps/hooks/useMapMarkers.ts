import { useEffect, useRef, useCallback } from 'react'
import L from 'leaflet'
import { EscapeRoom } from '../../../shared/types'

interface UseMapMarkersOptions {
  onMarkerClick?: (escapeRoom: EscapeRoom) => void
  selectedEscapeRooms?: EscapeRoom[]
  selectedEscapeRoom?: EscapeRoom | null
  showPopups?: boolean
}

export const useMapMarkers = (
  map: L.Map | undefined,
  escapeRooms: EscapeRoom[],
  options: UseMapMarkersOptions = {}
) => {
  const {
    onMarkerClick,
    selectedEscapeRooms = [],
    selectedEscapeRoom,
    showPopups = true
  } = options

  const markersRef = useRef<Map<string, L.Marker>>(new Map())

  // Helper function to get difficulty color
  const getDifficultyColor = useCallback((difficulty: string): string => {
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
  }, [])

  // Create custom marker icon
  const createMarkerIcon = useCallback((
    escapeRoom: EscapeRoom,
    isSelected: boolean = false,
    isInRoute: boolean = false,
    routeOrder?: number
  ) => {
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
  }, [getDifficultyColor])

  // Create popup content
  const createPopupContent = useCallback((
    escapeRoom: EscapeRoom,
    isInRoute: boolean,
    routeOrder: number
  ) => {
    const color = getDifficultyColor(escapeRoom.difficulty)
    
    return `
      <div class="p-3 min-w-[250px]">
        <h3 class="font-bold text-lg mb-2">${escapeRoom.name}</h3>
        <p class="text-gray-600 text-sm mb-3">${escapeRoom.description}</p>

        <div class="space-y-2 text-sm">
          <div class="flex items-center gap-2">
            <span class="font-medium">Dirección:</span>
            <span class="text-gray-600">${escapeRoom.address}</span>
          </div>

          <div class="flex items-center gap-2">
            <span class="font-medium">Dificultad:</span>
            <span class="px-2 py-1 rounded text-xs font-medium" style="background-color: ${color}20; color: ${color}">
              ${escapeRoom.difficulty.charAt(0).toUpperCase() + escapeRoom.difficulty.slice(1)}
            </span>
          </div>

          <div class="flex items-center gap-2">
            <span class="font-medium">Duración:</span>
            <span class="text-gray-600">${escapeRoom.duration} min</span>
          </div>

          <div class="flex items-center gap-2">
            <span class="font-medium">Jugadores:</span>
            <span class="text-gray-600">${escapeRoom.minPlayers}-${escapeRoom.maxPlayers}</span>
          </div>

          <div class="flex items-center gap-2">
            <span class="font-medium">Precio:</span>
            <span class="text-gray-600">${escapeRoom.priceRange}</span>
          </div>

          ${escapeRoom.rating ? `
            <div class="flex items-center gap-2">
              <span class="font-medium">Rating:</span>
              <span class="text-gray-600">⭐ ${escapeRoom.rating}/5</span>
            </div>
          ` : ''}

          ${isInRoute ? `
            <div class="flex items-center gap-2">
              <span class="font-medium">Posición en ruta:</span>
              <span class="text-blue-600 font-medium">#${routeOrder + 1}</span>
            </div>
          ` : ''}
        </div>
      </div>
    `
  }, [getDifficultyColor])

  // Update markers when escape rooms or selection changes
  useEffect(() => {
    if (!map) return

    // Clear existing markers
    markersRef.current.forEach(marker => map.removeLayer(marker))
    markersRef.current.clear()

    // Add new markers
    escapeRooms.forEach((escapeRoom) => {
      const isSelected = selectedEscapeRoom?.id === escapeRoom.id
      const isInRoute = selectedEscapeRooms.some(room => room.id === escapeRoom.id)
      const routeOrder = selectedEscapeRooms.findIndex(room => room.id === escapeRoom.id)

      const icon = createMarkerIcon(
        escapeRoom,
        isSelected,
        isInRoute,
        routeOrder >= 0 ? routeOrder : undefined
      )
      
      const marker = L.marker([escapeRoom.latitude, escapeRoom.longitude], { icon })
        .addTo(map)

      // Add popup if enabled
      if (showPopups) {
        const popupContent = createPopupContent(escapeRoom, isInRoute, routeOrder)
        marker.bindPopup(popupContent)
      }

      // Add click handler
      marker.on('click', () => {
        onMarkerClick?.(escapeRoom)
      })

      markersRef.current.set(escapeRoom.id, marker)
    })

    return () => {
      markersRef.current.forEach(marker => map.removeLayer(marker))
      markersRef.current.clear()
    }
  }, [
    map,
    escapeRooms,
    selectedEscapeRoom,
    selectedEscapeRooms,
    showPopups,
    onMarkerClick,
    createMarkerIcon,
    createPopupContent
  ])

  // Get marker by escape room ID
  const getMarker = useCallback((escapeRoomId: string) => {
    return markersRef.current.get(escapeRoomId)
  }, [])

  return {
    markers: markersRef.current,
    getMarker
  }
}
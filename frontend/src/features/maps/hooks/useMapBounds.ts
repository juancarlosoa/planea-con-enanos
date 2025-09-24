import { useEffect, useCallback } from 'react'
import L from 'leaflet'
import { EscapeRoom, Coordinates } from '../../../shared/types'

interface UseMapBoundsOptions {
  padding?: [number, number]
  maxZoom?: number
  duration?: number
  fitOnMount?: boolean
}

export const useMapBounds = (
  map: L.Map | undefined,
  escapeRooms: EscapeRoom[],
  options: UseMapBoundsOptions = {}
) => {
  const {
    padding = [20, 20],
    maxZoom = 16,
    duration = 1000,
    fitOnMount = true
  } = options

  // Fit bounds to show all escape rooms
  const fitBounds = useCallback((customEscapeRooms?: EscapeRoom[], customOptions?: Partial<UseMapBoundsOptions>) => {
    if (!map) return

    const rooms = customEscapeRooms || escapeRooms
    const opts = { ...options, ...customOptions }

    if (rooms.length === 0) return

    if (rooms.length === 1) {
      map.setView([rooms[0].latitude, rooms[0].longitude], 14, {
        animate: true,
        duration: (opts.duration || duration) / 1000
      })
    } else {
      const bounds = L.latLngBounds(
        rooms.map(room => [room.latitude, room.longitude])
      )
      
      map.fitBounds(bounds, {
        padding: opts.padding || padding,
        maxZoom: opts.maxZoom || maxZoom
      })
    }
  }, [map, escapeRooms, options, padding, maxZoom, duration])

  // Fit bounds to coordinates
  const fitBoundsToCoordinates = useCallback((
    coordinates: Coordinates[],
    customOptions?: Partial<UseMapBoundsOptions>
  ) => {
    if (!map || coordinates.length === 0) return

    const opts = { ...options, ...customOptions }

    if (coordinates.length === 1) {
      map.setView([coordinates[0].latitude, coordinates[0].longitude], 14, {
        animate: true,
        duration: (opts.duration || duration) / 1000
      })
    } else {
      const bounds = L.latLngBounds(
        coordinates.map(coord => [coord.latitude, coord.longitude])
      )
      
      map.fitBounds(bounds, {
        padding: opts.padding || padding,
        maxZoom: opts.maxZoom || maxZoom
      })
    }
  }, [map, options, padding, maxZoom, duration])

  // Center on specific escape room
  const centerOnEscapeRoom = useCallback((
    escapeRoomId: string,
    zoom: number = 15,
    customDuration?: number
  ) => {
    if (!map) return

    const escapeRoom = escapeRooms.find(er => er.id === escapeRoomId)
    if (escapeRoom) {
      map.setView([escapeRoom.latitude, escapeRoom.longitude], zoom, {
        animate: true,
        duration: (customDuration ?? duration) / 1000
      })
    }
  }, [map, escapeRooms, duration])

  // Center on coordinates
  const centerOnCoordinates = useCallback((
    coordinates: Coordinates,
    zoom: number = 15,
    customDuration?: number
  ) => {
    if (!map) return

    map.setView([coordinates.latitude, coordinates.longitude], zoom, {
      animate: true,
      duration: (customDuration ?? duration) / 1000
    })
  }, [map, duration])

  // Get current bounds
  const getCurrentBounds = useCallback(() => {
    if (!map) return null
    return map.getBounds()
  }, [map])

  // Check if coordinates are in current view
  const isInView = useCallback((coordinates: Coordinates) => {
    if (!map) return false
    
    const bounds = map.getBounds()
    return bounds.contains([coordinates.latitude, coordinates.longitude])
  }, [map])

  // Get visible escape rooms
  const getVisibleEscapeRooms = useCallback(() => {
    if (!map) return []
    
    const bounds = map.getBounds()
    return escapeRooms.filter(room => {
      return bounds.contains([room.latitude, room.longitude])
    })
  }, [map, escapeRooms])

  // Calculate bounds for escape rooms
  const calculateBounds = useCallback((rooms: EscapeRoom[]) => {
    if (rooms.length === 0) return null

    return L.latLngBounds(
      rooms.map(room => [room.latitude, room.longitude])
    )
  }, [])

  // Calculate bounds for coordinates
  const calculateBoundsForCoordinates = useCallback((coordinates: Coordinates[]) => {
    if (coordinates.length === 0) return null

    return L.latLngBounds(
      coordinates.map(coord => [coord.latitude, coord.longitude])
    )
  }, [])

  // Auto-fit bounds when escape rooms change
  useEffect(() => {
    if (fitOnMount && escapeRooms.length > 0) {
      fitBounds()
    }
  }, [escapeRooms, fitOnMount, fitBounds])

  return {
    fitBounds,
    fitBoundsToCoordinates,
    centerOnEscapeRoom,
    centerOnCoordinates,
    getCurrentBounds,
    isInView,
    getVisibleEscapeRooms,
    calculateBounds,
    calculateBoundsForCoordinates
  }
}

export const useMapViewport = (map: L.Map | undefined) => {
  // Get current center
  const getCenter = useCallback(() => {
    if (!map) return null
    return map.getCenter()
  }, [map])

  // Get current zoom
  const getZoom = useCallback(() => {
    if (!map) return null
    return map.getZoom()
  }, [map])

  // Set viewport
  const setViewport = useCallback((
    center: [number, number],
    zoom: number,
    duration: number = 1000
  ) => {
    if (!map) return

    map.setView(center, zoom, {
      animate: true,
      duration: duration / 1000
    })
  }, [map])

  // Reset viewport to default
  const resetViewport = useCallback((
    defaultCenter: [number, number] = [41.3851, 2.1734], // Barcelona
    defaultZoom: number = 12,
    duration: number = 1000
  ) => {
    if (!map) return

    map.setView(defaultCenter, defaultZoom, {
      animate: true,
      duration: duration / 1000
    })
  }, [map])

  return {
    getCenter,
    getZoom,
    setViewport,
    resetViewport
  }
}
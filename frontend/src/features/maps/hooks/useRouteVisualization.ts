import { useEffect } from 'react'
import L from 'leaflet'
import { RouteSegment } from '../../route-planning/services/routeService'
import { Coordinates } from '../../../shared/types'

export const useRouteVisualization = (
  map: L.Map | undefined,
  routeSegments: RouteSegment[] | undefined
) => {
  useEffect(() => {
    if (!map || !routeSegments || routeSegments.length === 0) {
      return
    }

    // Create route polylines from segments
    const polylines: L.Polyline[] = []
    
    routeSegments.forEach((segment) => {
      const positions: L.LatLngExpression[] = []
      
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

      const polyline = L.polyline(positions, {
        color: '#3b82f6',
        weight: 4,
        opacity: 0.8
      }).addTo(map)

      polylines.push(polyline)
    })

    // Add waypoint markers
    const markers: L.CircleMarker[] = []
    const waypoints: Coordinates[] = []

    routeSegments.forEach((segment, index) => {
      if (index === 0) {
        waypoints.push(segment.from)
      }
      waypoints.push(segment.to)
    })

    waypoints.forEach((waypoint, index) => {
      const isStart = index === 0
      const isEnd = index === waypoints.length - 1
      
      const color = isStart ? '#10b981' : isEnd ? '#ef4444' : '#3b82f6'
      
      const marker = L.circleMarker([waypoint.latitude, waypoint.longitude], {
        radius: isStart || isEnd ? 8 : 6,
        fillColor: color,
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
      }).addTo(map)

      markers.push(marker)
    })

    // Fit map to route bounds
    if (waypoints.length > 0) {
      const bounds = L.latLngBounds(waypoints.map(w => [w.latitude, w.longitude]))
      map.fitBounds(bounds, { padding: [20, 20] })
    }

    // Cleanup function
    return () => {
      polylines.forEach(polyline => map.removeLayer(polyline))
      markers.forEach(marker => map.removeLayer(marker))
    }
  }, [map, routeSegments])
}

export const useRouteInstructions = (routeSegments: RouteSegment[] | undefined) => {
  return routeSegments?.map((segment, index) => ({
    step: index + 1,
    from: segment.from,
    to: segment.to,
    mode: segment.mode,
    duration: segment.travelTimeMinutes,
    distance: segment.distance,
    cost: segment.cost,
    instructions: segment.instructions || `Travel from point ${index + 1} to point ${index + 2} via ${segment.mode.toLowerCase()}`
  })) || []
}
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { EscapeRoom, Route } from '../types'

// Route planning specific state
interface RoutePlanningState {
  // Route optimization state
  isCalculatingRoute: boolean
  routeCalculationError: string | null
  
  // Route preferences
  transportMode: 'driving' | 'walking' | 'transit'
  optimizeFor: 'time' | 'distance' | 'cost'
  maxTravelTime: number // in minutes
  
  // Temporary route data during planning
  tempRoute: Route | null
  routePreview: {
    totalTime: number
    totalDistance: number
    estimatedCost: number
  } | null
  
  // Actions
  setCalculatingRoute: (isCalculating: boolean) => void
  setRouteCalculationError: (error: string | null) => void
  setTransportMode: (mode: 'driving' | 'walking' | 'transit') => void
  setOptimizeFor: (criteria: 'time' | 'distance' | 'cost') => void
  setMaxTravelTime: (minutes: number) => void
  setTempRoute: (route: Route | null) => void
  setRoutePreview: (preview: RoutePlanningState['routePreview']) => void
  calculateRoutePreview: (escapeRooms: EscapeRoom[]) => Promise<void>
  resetRoutePlanning: () => void
}

// Initial state
const initialState = {
  isCalculatingRoute: false,
  routeCalculationError: null,
  transportMode: 'driving' as const,
  optimizeFor: 'time' as const,
  maxTravelTime: 480, // 8 hours default
  tempRoute: null,
  routePreview: null,
}

export const useRoutePlanningStore = create<RoutePlanningState>()(
  devtools(
    (set) => ({
      ...initialState,
      
      setCalculatingRoute: (isCalculating: boolean) => {
        set(
          () => ({ isCalculatingRoute: isCalculating }),
          false,
          'setCalculatingRoute'
        )
      },
      
      setRouteCalculationError: (error: string | null) => {
        set(
          () => ({ routeCalculationError: error }),
          false,
          'setRouteCalculationError'
        )
      },
      
      setTransportMode: (mode: 'driving' | 'walking' | 'transit') => {
        set(
          () => ({ transportMode: mode }),
          false,
          'setTransportMode'
        )
      },
      
      setOptimizeFor: (criteria: 'time' | 'distance' | 'cost') => {
        set(
          () => ({ optimizeFor: criteria }),
          false,
          'setOptimizeFor'
        )
      },
      
      setMaxTravelTime: (minutes: number) => {
        set(
          () => ({ maxTravelTime: Math.max(60, minutes) }), // Minimum 1 hour
          false,
          'setMaxTravelTime'
        )
      },
      
      setTempRoute: (route: Route | null) => {
        set(
          () => ({ tempRoute: route }),
          false,
          'setTempRoute'
        )
      },
      
      setRoutePreview: (preview: RoutePlanningState['routePreview']) => {
        set(
          () => ({ routePreview: preview }),
          false,
          'setRoutePreview'
        )
      },
      
      calculateRoutePreview: async (escapeRooms: EscapeRoom[]) => {
        if (escapeRooms.length < 2) {
          set(() => ({ routePreview: null }))
          return
        }
        
        // const { transportMode, optimizeFor } = get() // TODO: Use these for actual calculation
        
        set(() => ({ isCalculatingRoute: true, routeCalculationError: null }))
        
        try {
          // Mock calculation - in real implementation, this would call the route optimization service
          const totalTime = escapeRooms.reduce((sum, room) => sum + room.duration, 0) + 
                           (escapeRooms.length - 1) * 30 // 30 min travel between each
          
          const totalDistance = escapeRooms.length * 5 // Mock 5km between each
          
          const estimatedCost = escapeRooms.reduce((sum, room) => {
            const price = parseFloat(room.priceRange.split('-')[0].replace('€', '')) || 25
            return sum + price
          }, 0) + (totalDistance * 0.5) // Add travel cost
          
          const preview = {
            totalTime,
            totalDistance,
            estimatedCost,
          }
          
          set(() => ({ 
            routePreview: preview,
            isCalculatingRoute: false 
          }))
          
        } catch (error) {
          set(() => ({ 
            routeCalculationError: error instanceof Error ? error.message : 'Failed to calculate route',
            isCalculatingRoute: false 
          }))
        }
      },
      
      resetRoutePlanning: () => {
        set(
          () => ({ ...initialState }),
          false,
          'resetRoutePlanning'
        )
      },
    }),
    {
      name: 'route-planning-store',
    }
  )
)

// Selector hooks
export const useTransportMode = () => useRoutePlanningStore(state => state.transportMode)
export const useOptimizeFor = () => useRoutePlanningStore(state => state.optimizeFor)
export const useRoutePreview = () => useRoutePlanningStore(state => state.routePreview)
export const useIsCalculatingRoute = () => useRoutePlanningStore(state => state.isCalculatingRoute)
export const useRouteCalculationError = () => useRoutePlanningStore(state => state.routeCalculationError)

// Individual action hooks to prevent infinite re-renders
export const useSetCalculatingRoute = () => useRoutePlanningStore(state => state.setCalculatingRoute)
export const useSetRouteCalculationError = () => useRoutePlanningStore(state => state.setRouteCalculationError)
export const useSetTransportMode = () => useRoutePlanningStore(state => state.setTransportMode)
export const useSetOptimizeFor = () => useRoutePlanningStore(state => state.setOptimizeFor)
export const useSetMaxTravelTime = () => useRoutePlanningStore(state => state.setMaxTravelTime)
export const useSetTempRoute = () => useRoutePlanningStore(state => state.setTempRoute)
export const useSetRoutePreview = () => useRoutePlanningStore(state => state.setRoutePreview)
export const useCalculateRoutePreview = () => useRoutePlanningStore(state => state.calculateRoutePreview)
export const useResetRoutePlanning = () => useRoutePlanningStore(state => state.resetRoutePlanning)
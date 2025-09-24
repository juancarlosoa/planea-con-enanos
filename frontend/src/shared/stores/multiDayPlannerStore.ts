import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { EscapeRoom, Plan, DailyRoute, RouteStop } from '../types'

// Store state interface
interface MultiDayPlannerState {
  // Current multi-day plan state
  currentPlan: Plan | null
  selectedDayIndex: number
  timeLimit: number // minutes per day
  
  // UI state
  isOptimizingRoute: boolean
  isDirty: boolean
  validationErrors: Record<string, string[]>
  suggestions: PlanSuggestion[]
  
  // Actions for plan management
  createNewPlan: (name: string, description: string, startDate: string, endDate: string) => void
  loadPlan: (plan: Plan) => void
  updatePlanInfo: (name: string, description: string) => void
  updateDateRange: (startDate: string, endDate: string) => void
  clearCurrentPlan: () => void
  
  // Actions for day navigation
  selectDay: (dayIndex: number) => void
  getSelectedDay: () => DailyRoute | null
  
  // Actions for escape room management
  addEscapeRoomToDay: (dayIndex: number, escapeRoom: EscapeRoom) => void
  removeEscapeRoomFromDay: (dayIndex: number, escapeRoomId: string) => void
  moveEscapeRoomBetweenDays: (escapeRoomId: string, fromDayIndex: number, toDayIndex: number) => void
  reorderEscapeRoomsInDay: (dayIndex: number, fromIndex: number, toIndex: number) => void
  
  // Actions for time management
  setTimeLimit: (minutes: number) => void
  validateDayTime: (dayIndex: number) => boolean
  getTotalTimeForDay: (dayIndex: number) => number
  getExceededTimeForDay: (dayIndex: number) => number
  
  // Actions for suggestions
  generateSuggestions: () => void
  applySuggestion: (suggestionId: string) => void
  dismissSuggestion: (suggestionId: string) => void
  
  // Utility actions
  markDirty: () => void
  markClean: () => void
  resetStore: () => void
}

interface PlanSuggestion {
  id: string
  type: 'moveEscapeRoom' | 'removeEscapeRoom' | 'reorderDay' | 'splitDay'
  dayIndex: number
  escapeRoomId?: string
  targetDayIndex?: number
  message: string
  severity: 'warning' | 'error' | 'info'
}

// Helper functions
const createEmptyDailyRoute = (date: string, planId: string): DailyRoute => ({
  id: `temp-${Date.now()}-${Math.random()}`,
  date,
  planId,
  estimatedTotalTime: 0,
  estimatedCost: 0,
  preferredTransportMode: 'driving',
  multiModalStrategy: 'singleMode',
  stops: [],
  createdAt: new Date(),
  updatedAt: new Date(),
})

const generateDateRange = (startDate: string, endDate: string): string[] => {
  const dates: string[] = []
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(d.toISOString().split('T')[0])
  }
  
  return dates
}

const calculateRouteTime = (stops: RouteStop[], escapeRooms: EscapeRoom[]): number => {
  let totalTime = 0
  
  stops.forEach(stop => {
    const escapeRoom = escapeRooms.find(er => er.id === stop.escapeRoomId)
    if (escapeRoom) {
      totalTime += escapeRoom.duration // Time at escape room
      totalTime += stop.estimatedTravelTime // Travel time to next stop
    }
  })
  
  return totalTime
}

// Initial state
const initialState = {
  currentPlan: null,
  selectedDayIndex: 0,
  timeLimit: 480, // 8 hours in minutes
  isOptimizingRoute: false,
  isDirty: false,
  validationErrors: {},
  suggestions: [],
}

// Create the store
export const useMultiDayPlannerStore = create<MultiDayPlannerState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        // Plan management actions
        createNewPlan: (name: string, description: string, startDate: string, endDate: string) => {
          const planId = `plan-${Date.now()}`
          const dates = generateDateRange(startDate, endDate)
          
          const dailyRoutes = dates.map(date => createEmptyDailyRoute(date, planId))
          
          const newPlan: Plan = {
            id: planId,
            name,
            description,
            startDate,
            endDate,
            dailyRoutes,
            createdBy: 'current-user', // TODO: Get from auth
            status: 'draft',
            createdAt: new Date(),
            updatedAt: new Date(),
          }
          
          set(
            () => ({
              currentPlan: newPlan,
              selectedDayIndex: 0,
              isDirty: true,
              validationErrors: {},
              suggestions: [],
            }),
            false,
            'createNewPlan'
          )
        },
        
        loadPlan: (plan: Plan) => {
          set(
            () => ({
              currentPlan: plan,
              selectedDayIndex: 0,
              isDirty: false,
              validationErrors: {},
              suggestions: [],
            }),
            false,
            'loadPlan'
          )
        },
        
        updatePlanInfo: (name: string, description: string) => {
          const { currentPlan } = get()
          if (!currentPlan) return
          
          set(
            (state) => ({
              currentPlan: {
                ...state.currentPlan!,
                name,
                description,
                updatedAt: new Date(),
              },
              isDirty: true,
            }),
            false,
            'updatePlanInfo'
          )
        },
        
        updateDateRange: (startDate: string, endDate: string) => {
          const { currentPlan } = get()
          if (!currentPlan) return
          
          const dates = generateDateRange(startDate, endDate)
          const existingRoutes = currentPlan.dailyRoutes
          
          // Create new daily routes for the new date range
          const newDailyRoutes = dates.map(date => {
            const existingRoute = existingRoutes.find(r => r.date === date)
            return existingRoute || createEmptyDailyRoute(date, currentPlan.id)
          })
          
          set(
            (state) => ({
              currentPlan: {
                ...state.currentPlan!,
                startDate,
                endDate,
                dailyRoutes: newDailyRoutes,
                updatedAt: new Date(),
              },
              selectedDayIndex: 0,
              isDirty: true,
            }),
            false,
            'updateDateRange'
          )
        },
        
        clearCurrentPlan: () => {
          set(
            () => ({
              currentPlan: null,
              selectedDayIndex: 0,
              isDirty: false,
              validationErrors: {},
              suggestions: [],
            }),
            false,
            'clearCurrentPlan'
          )
        },
        
        // Day navigation actions
        selectDay: (dayIndex: number) => {
          const { currentPlan } = get()
          if (!currentPlan || dayIndex < 0 || dayIndex >= currentPlan.dailyRoutes.length) {
            return
          }
          
          set(
            () => ({ selectedDayIndex: dayIndex }),
            false,
            'selectDay'
          )
        },
        
        getSelectedDay: () => {
          const { currentPlan, selectedDayIndex } = get()
          if (!currentPlan || selectedDayIndex < 0 || selectedDayIndex >= currentPlan.dailyRoutes.length) {
            return null
          }
          return currentPlan.dailyRoutes[selectedDayIndex]
        },
        
        // Escape room management actions
        addEscapeRoomToDay: (dayIndex: number, escapeRoom: EscapeRoom) => {
          const { currentPlan } = get()
          if (!currentPlan || dayIndex < 0 || dayIndex >= currentPlan.dailyRoutes.length) {
            return
          }
          
          const dailyRoute = currentPlan.dailyRoutes[dayIndex]
          
          // Check if escape room is already in this day
          if (dailyRoute.stops.some(stop => stop.escapeRoomId === escapeRoom.id)) {
            return
          }
          
          const newStop: RouteStop = {
            id: `stop-${Date.now()}-${Math.random()}`,
            escapeRoomId: escapeRoom.id,
            escapeRoom,
            order: dailyRoute.stops.length + 1,
            estimatedArrivalTime: 0, // Will be calculated by optimization
            estimatedTravelTime: 0, // Will be calculated by optimization
            isMultiModalSegment: false,
          }
          
          const updatedDailyRoutes = [...currentPlan.dailyRoutes]
          updatedDailyRoutes[dayIndex] = {
            ...dailyRoute,
            stops: [...dailyRoute.stops, newStop],
            updatedAt: new Date(),
          }
          
          set(
            (state) => ({
              currentPlan: {
                ...state.currentPlan!,
                dailyRoutes: updatedDailyRoutes,
                updatedAt: new Date(),
              },
              isDirty: true,
            }),
            false,
            'addEscapeRoomToDay'
          )
          
          // Trigger validation and suggestions
          get().generateSuggestions()
        },
        
        removeEscapeRoomFromDay: (dayIndex: number, escapeRoomId: string) => {
          const { currentPlan } = get()
          if (!currentPlan || dayIndex < 0 || dayIndex >= currentPlan.dailyRoutes.length) {
            return
          }
          
          const dailyRoute = currentPlan.dailyRoutes[dayIndex]
          const updatedStops = dailyRoute.stops
            .filter(stop => stop.escapeRoomId !== escapeRoomId)
            .map((stop, index) => ({ ...stop, order: index + 1 }))
          
          const updatedDailyRoutes = [...currentPlan.dailyRoutes]
          updatedDailyRoutes[dayIndex] = {
            ...dailyRoute,
            stops: updatedStops,
            updatedAt: new Date(),
          }
          
          set(
            (state) => ({
              currentPlan: {
                ...state.currentPlan!,
                dailyRoutes: updatedDailyRoutes,
                updatedAt: new Date(),
              },
              isDirty: true,
            }),
            false,
            'removeEscapeRoomFromDay'
          )
          
          get().generateSuggestions()
        },
        
        moveEscapeRoomBetweenDays: (escapeRoomId: string, fromDayIndex: number, toDayIndex: number) => {
          const { currentPlan } = get()
          if (!currentPlan || 
              fromDayIndex < 0 || fromDayIndex >= currentPlan.dailyRoutes.length ||
              toDayIndex < 0 || toDayIndex >= currentPlan.dailyRoutes.length ||
              fromDayIndex === toDayIndex) {
            return
          }
          
          const fromRoute = currentPlan.dailyRoutes[fromDayIndex]
          const toRoute = currentPlan.dailyRoutes[toDayIndex]
          
          const stopToMove = fromRoute.stops.find(stop => stop.escapeRoomId === escapeRoomId)
          if (!stopToMove) return
          
          // Check if escape room is already in target day
          if (toRoute.stops.some(stop => stop.escapeRoomId === escapeRoomId)) {
            return
          }
          
          // Remove from source day
          const updatedFromStops = fromRoute.stops
            .filter(stop => stop.escapeRoomId !== escapeRoomId)
            .map((stop, index) => ({ ...stop, order: index + 1 }))
          
          // Add to target day
          const updatedToStops = [
            ...toRoute.stops,
            {
              ...stopToMove,
              id: `stop-${Date.now()}-${Math.random()}`,
              order: toRoute.stops.length + 1,
            }
          ]
          
          const updatedDailyRoutes = [...currentPlan.dailyRoutes]
          updatedDailyRoutes[fromDayIndex] = {
            ...fromRoute,
            stops: updatedFromStops,
            updatedAt: new Date(),
          }
          updatedDailyRoutes[toDayIndex] = {
            ...toRoute,
            stops: updatedToStops,
            updatedAt: new Date(),
          }
          
          set(
            (state) => ({
              currentPlan: {
                ...state.currentPlan!,
                dailyRoutes: updatedDailyRoutes,
                updatedAt: new Date(),
              },
              isDirty: true,
            }),
            false,
            'moveEscapeRoomBetweenDays'
          )
          
          get().generateSuggestions()
        },
        
        reorderEscapeRoomsInDay: (dayIndex: number, fromIndex: number, toIndex: number) => {
          const { currentPlan } = get()
          if (!currentPlan || dayIndex < 0 || dayIndex >= currentPlan.dailyRoutes.length) {
            return
          }
          
          const dailyRoute = currentPlan.dailyRoutes[dayIndex]
          if (fromIndex < 0 || fromIndex >= dailyRoute.stops.length ||
              toIndex < 0 || toIndex >= dailyRoute.stops.length ||
              fromIndex === toIndex) {
            return
          }
          
          const updatedStops = [...dailyRoute.stops]
          const [movedStop] = updatedStops.splice(fromIndex, 1)
          updatedStops.splice(toIndex, 0, movedStop)
          
          // Update order numbers
          const reorderedStops = updatedStops.map((stop, index) => ({
            ...stop,
            order: index + 1,
          }))
          
          const updatedDailyRoutes = [...currentPlan.dailyRoutes]
          updatedDailyRoutes[dayIndex] = {
            ...dailyRoute,
            stops: reorderedStops,
            updatedAt: new Date(),
          }
          
          set(
            (state) => ({
              currentPlan: {
                ...state.currentPlan!,
                dailyRoutes: updatedDailyRoutes,
                updatedAt: new Date(),
              },
              isDirty: true,
            }),
            false,
            'reorderEscapeRoomsInDay'
          )
        },
        
        // Time management actions
        setTimeLimit: (minutes: number) => {
          set(
            () => ({ timeLimit: minutes }),
            false,
            'setTimeLimit'
          )
          
          get().generateSuggestions()
        },
        
        validateDayTime: (dayIndex: number) => {
          const { currentPlan, timeLimit } = get()
          if (!currentPlan || dayIndex < 0 || dayIndex >= currentPlan.dailyRoutes.length) {
            return true
          }
          
          const totalTime = get().getTotalTimeForDay(dayIndex)
          return totalTime <= timeLimit
        },
        
        getTotalTimeForDay: (dayIndex: number) => {
          const { currentPlan } = get()
          if (!currentPlan || dayIndex < 0 || dayIndex >= currentPlan.dailyRoutes.length) {
            return 0
          }
          
          const dailyRoute = currentPlan.dailyRoutes[dayIndex]
          const escapeRooms = dailyRoute.stops.map(stop => stop.escapeRoom).filter(Boolean) as EscapeRoom[]
          
          return calculateRouteTime(dailyRoute.stops, escapeRooms)
        },
        
        getExceededTimeForDay: (dayIndex: number) => {
          const { timeLimit } = get()
          const totalTime = get().getTotalTimeForDay(dayIndex)
          return Math.max(0, totalTime - timeLimit)
        },
        
        // Suggestion actions
        generateSuggestions: () => {
          const { currentPlan, timeLimit } = get()
          if (!currentPlan) return
          
          const suggestions: PlanSuggestion[] = []
          
          currentPlan.dailyRoutes.forEach((dailyRoute, dayIndex) => {
            const totalTime = get().getTotalTimeForDay(dayIndex)
            const exceededTime = totalTime - timeLimit
            
            if (exceededTime > 0) {
              // Suggest moving escape rooms to other days
              const sortedStops = [...dailyRoute.stops].sort((a, b) => {
                const durationA = a.escapeRoom?.duration || 0
                const durationB = b.escapeRoom?.duration || 0
                return durationB - durationA // Longest first
              })
              
              for (const stop of sortedStops) {
                if (!stop.escapeRoom) continue
                
                // Find a day with available time
                const targetDayIndex = currentPlan.dailyRoutes.findIndex((_, index) => {
                  if (index === dayIndex) return false
                  const dayTime = get().getTotalTimeForDay(index)
                  return dayTime + stop.escapeRoom!.duration <= timeLimit
                })
                
                if (targetDayIndex !== -1) {
                  const targetDate = new Date(currentPlan.dailyRoutes[targetDayIndex].date)
                    .toLocaleDateString('es-ES', { weekday: 'long', month: 'short', day: 'numeric' })
                  
                  suggestions.push({
                    id: `move-${stop.id}`,
                    type: 'moveEscapeRoom',
                    dayIndex,
                    escapeRoomId: stop.escapeRoomId,
                    targetDayIndex,
                    message: `Mover "${stop.escapeRoom.name}" al ${targetDate} para reducir el tiempo del día`,
                    severity: 'warning',
                  })
                  break // Only suggest one move per overloaded day
                }
              }
              
              // If no move is possible, suggest removing
              if (suggestions.length === 0 && dailyRoute.stops.length > 0) {
                const longestStop = sortedStops[0]
                if (longestStop.escapeRoom) {
                  suggestions.push({
                    id: `remove-${longestStop.id}`,
                    type: 'removeEscapeRoom',
                    dayIndex,
                    escapeRoomId: longestStop.escapeRoomId,
                    message: `Considerar quitar "${longestStop.escapeRoom.name}" (${longestStop.escapeRoom.duration} min) para ajustar el tiempo`,
                    severity: 'error',
                  })
                }
              }
            }
          })
          
          set(
            () => ({ suggestions }),
            false,
            'generateSuggestions'
          )
        },
        
        applySuggestion: (suggestionId: string) => {
          const { suggestions } = get()
          const suggestion = suggestions.find(s => s.id === suggestionId)
          if (!suggestion) return
          
          switch (suggestion.type) {
            case 'moveEscapeRoom':
              if (suggestion.escapeRoomId && suggestion.targetDayIndex !== undefined) {
                get().moveEscapeRoomBetweenDays(
                  suggestion.escapeRoomId,
                  suggestion.dayIndex,
                  suggestion.targetDayIndex
                )
              }
              break
            case 'removeEscapeRoom':
              if (suggestion.escapeRoomId) {
                get().removeEscapeRoomFromDay(suggestion.dayIndex, suggestion.escapeRoomId)
              }
              break
          }
          
          get().dismissSuggestion(suggestionId)
        },
        
        dismissSuggestion: (suggestionId: string) => {
          set(
            (state) => ({
              suggestions: state.suggestions.filter(s => s.id !== suggestionId),
            }),
            false,
            'dismissSuggestion'
          )
        },
        
        // Utility actions
        markDirty: () => {
          set(
            () => ({ isDirty: true }),
            false,
            'markDirty'
          )
        },
        
        markClean: () => {
          set(
            () => ({ isDirty: false }),
            false,
            'markClean'
          )
        },
        
        resetStore: () => {
          set(
            () => ({ ...initialState }),
            false,
            'resetStore'
          )
        },
      }),
      {
        name: 'multi-day-planner-store',
        partialize: (state) => ({
          currentPlan: state.currentPlan,
          selectedDayIndex: state.selectedDayIndex,
          timeLimit: state.timeLimit,
        }),
      }
    ),
    {
      name: 'multi-day-planner-store',
    }
  )
)

// Selector hooks for better performance
export const useCurrentPlan = () => useMultiDayPlannerStore(state => state.currentPlan)
export const useSelectedDayIndex = () => useMultiDayPlannerStore(state => state.selectedDayIndex)
export const useSelectedDay = () => useMultiDayPlannerStore(state => state.getSelectedDay())
export const useTimeLimit = () => useMultiDayPlannerStore(state => state.timeLimit)
export const useValidationErrors = () => useMultiDayPlannerStore(state => state.validationErrors)
export const usePlanSuggestions = () => useMultiDayPlannerStore(state => state.suggestions)
export const useIsDirty = () => useMultiDayPlannerStore(state => state.isDirty)
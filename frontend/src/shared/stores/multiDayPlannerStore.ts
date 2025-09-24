import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { EscapeRoom, Plan, DailyRoute, RouteStop } from '../types'

// Store state interface
interface PlannerState {
  // Current multi-day plan state
  currentPlan: Plan | null;
  selectedDayIndex: number;
  timeLimit: number; // minutes per day
  
  // UI state
  isOptimizingRoute: boolean;
  isDirty: boolean;
  validationErrors: Record<string, string[]>;
  suggestions: PlanSuggestion[];
  
  // Loading states
  isLoading: boolean;
  isCreating: boolean;
  isSaving: boolean;
  isEditing: boolean;
  error: string | null;

  // Backup state for rollback
  lastValidState: Omit<PlannerState, 'lastValidState'> | null;
}

// Store actions interface
interface PlannerActions {
  // Plan management
  createNewPlan: (name: string, description: string, startDate: string, endDate: string) => Promise<void>;
  loadPlan: (plan: Plan) => Promise<void>;
  updatePlanInfo: (name: string, description: string) => Promise<void>;
  updateDateRange: (startDate: string, endDate: string) => Promise<void>;
  clearCurrentPlan: () => void;

  // Day management
  selectDay: (dayIndex: number) => void;
  getSelectedDay: () => DailyRoute | null;
  addEscapeRoomToDay: (dayIndex: number, escapeRoom: EscapeRoom) => Promise<void>;
  removeEscapeRoomFromDay: (dayIndex: number, escapeRoomId: string) => Promise<void>;
  moveEscapeRoomBetweenDays: (escapeRoomId: string, fromDayIndex: number, toDayIndex: number) => Promise<void>;
  reorderEscapeRoomsInDay: (dayIndex: number, fromIndex: number, toIndex: number) => Promise<void>;

  // Time management
  setTimeLimit: (minutes: number) => void;
  validateDayTime: (dayIndex: number) => boolean;
  getTotalTimeForDay: (dayIndex: number) => number;
  getExceededTimeForDay: (dayIndex: number) => number;

  // Suggestions management
  generateSuggestions: () => void;
  applySuggestion: (suggestionId: string) => Promise<void>;
  dismissSuggestion: (suggestionId: string) => void;

  // State management
  validateState: () => boolean;
  saveState: () => void;
  rollback: () => void;
  lockEditing: () => void;
  unlockEditing: () => void;
  markDirty: () => void;
  markClean: () => void;
  resetStore: () => void;
}

// Combined store type
type MultiDayPlannerStore = PlannerState & PlannerActions;
  
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
  try {
    if (!Array.isArray(stops) || !Array.isArray(escapeRooms)) return 0;
    if (!stops.length || !escapeRooms.length) return 0;
    
    let totalTime = 0;
    
    for (const stop of stops) {
      if (!stop || typeof stop !== 'object') continue;
      
      const escapeRoom = escapeRooms.find(er => 
        er && 
        typeof er === 'object' && 
        'id' in er && 
        er.id === stop.escapeRoomId
      );
      
      if (escapeRoom && typeof escapeRoom === 'object' && 'duration' in escapeRoom) {
        totalTime += Number(escapeRoom.duration) || 0; // Time at escape room
        totalTime += Number(stop.estimatedTravelTime) || 0; // Travel time to next stop
      }
    }
    
    return totalTime;
  } catch (error) {
    console.error('Error in calculateRouteTime:', error);
    return 0;
  }
}

// Initial state
const initialState: PlannerState = {
  currentPlan: null,
  selectedDayIndex: 0,
  timeLimit: 480, // 8 hours in minutes
  isOptimizingRoute: false,
  isDirty: false,
  validationErrors: {},
  suggestions: [],
  isLoading: false,
  isCreating: false,
  isSaving: false,
  isEditing: false,
  error: null,
  lastValidState: null
}

// Create the store
export const useMultiDayPlannerStore = create<MultiDayPlannerStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        // Plan management actions
        createNewPlan: async (name: string, description: string, startDate: string, endDate: string) => {
          try {
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
            
            // Primero limpiamos el estado completamente
            set(() => ({ ...initialState }), false, 'resetBeforeCreate')
            
            // Luego establecemos el nuevo plan
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
          } catch (error) {
            console.error('Error creating new plan:', error)
            // En caso de error, aseguramos un estado limpio
            set(() => ({ ...initialState }), false, 'errorRecovery')
          }
        },
        
        loadPlan: async (plan: Plan) => {
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
        
        updatePlanInfo: async (name: string, description: string) => {
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
        
        updateDateRange: async (startDate: string, endDate: string) => {
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
              ...initialState,
              currentPlan: null,
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
        addEscapeRoomToDay: async (dayIndex: number, escapeRoom: EscapeRoom) => {
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
        
        removeEscapeRoomFromDay: async (dayIndex: number, escapeRoomId: string) => {
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
        
        moveEscapeRoomBetweenDays: async (escapeRoomId: string, fromDayIndex: number, toDayIndex: number) => {
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
        
        reorderEscapeRoomsInDay: async (dayIndex: number, fromIndex: number, toIndex: number) => {
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
          if (!currentPlan?.dailyRoutes?.length || dayIndex < 0 || dayIndex >= currentPlan.dailyRoutes.length) {
            return true
          }
          
          const totalTime = get().getTotalTimeForDay(dayIndex)
          return totalTime <= timeLimit
        },
        
        getTotalTimeForDay: (dayIndex: number) => {
          const { currentPlan } = get()
          if (!currentPlan?.dailyRoutes?.length || dayIndex < 0 || dayIndex >= currentPlan.dailyRoutes.length) {
            return 0
          }
          
          const dailyRoute = currentPlan.dailyRoutes[dayIndex]
          if (!dailyRoute?.stops?.length) {
            return 0
          }

          try {
            const validStops = dailyRoute.stops.filter((stop): stop is RouteStop => 
              stop !== undefined && 
              stop !== null && 
              typeof stop === 'object'
            )
            
            const escapeRooms = validStops
              .map(stop => stop.escapeRoom)
              .filter((er): er is EscapeRoom => 
                er !== undefined && 
                er !== null && 
                typeof er === 'object'
              )
            
            return calculateRouteTime(validStops, escapeRooms)
          } catch (error) {
            console.error('Error calculating total time:', error)
            return 0
          }
        },
        
        getExceededTimeForDay: (dayIndex: number) => {
          const { timeLimit } = get()
          const totalTime = get().getTotalTimeForDay(dayIndex)
          return Math.max(0, totalTime - timeLimit)
        },
        
        // Suggestion actions
        generateSuggestions: () => {
          try {
            const { currentPlan, timeLimit } = get();
            if (!currentPlan?.dailyRoutes?.length) {
              set(() => ({ suggestions: [] }), false, 'generateSuggestions');
              return;
            }
            
            const suggestions: PlanSuggestion[] = [];
            
            for (let dayIndex = 0; dayIndex < currentPlan.dailyRoutes.length; dayIndex++) {
              const dailyRoute = currentPlan.dailyRoutes[dayIndex];
              if (!dailyRoute?.stops?.length) continue;
              
              const totalTime = get().getTotalTimeForDay(dayIndex);
              const exceededTime = totalTime - (timeLimit ?? 0);
              
              if (exceededTime > 0) {
                // Suggest moving escape rooms to other days
                const validStops = dailyRoute.stops.filter((stop): stop is RouteStop => 
                  stop !== undefined && 
                  stop !== null && 
                  typeof stop === 'object' &&
                  'escapeRoom' in stop &&
                  stop.escapeRoom !== null &&
                  typeof stop.escapeRoom === 'object' &&
                  'duration' in stop.escapeRoom
                );
                
                if (!validStops.length) continue;
                
                const sortedStops = [...validStops].sort((a, b) => {
                  const durationA = a.escapeRoom?.duration ?? 0;
                  const durationB = b.escapeRoom?.duration ?? 0;
                  return durationB - durationA; // Longest first
                });
                
                for (const stop of sortedStops) {
                  if (!stop.escapeRoom?.duration) continue;
                  
                  // Find a day with available time
                  let targetDayIndex = -1;
                  for (let i = 0; i < currentPlan.dailyRoutes.length; i++) {
                    if (i === dayIndex) continue;
                    
                    const dayTime = get().getTotalTimeForDay(i);
                    if ((dayTime + stop.escapeRoom.duration) <= (timeLimit ?? 0)) {
                      targetDayIndex = i;
                      break;
                    }
                  }
                  
                  if (targetDayIndex !== -1 && currentPlan.dailyRoutes[targetDayIndex]?.date) {
                    try {
                      const targetDate = new Date(currentPlan.dailyRoutes[targetDayIndex].date)
                        .toLocaleDateString('es-ES', { weekday: 'long', month: 'short', day: 'numeric' });
                      
                      suggestions.push({
                        id: `move-${stop.id}`,
                        type: 'moveEscapeRoom',
                        dayIndex,
                        escapeRoomId: stop.escapeRoomId,
                        targetDayIndex,
                        message: `Mover "${stop.escapeRoom.name ?? 'Escape Room'}" al ${targetDate} para reducir el tiempo del día`,
                        severity: 'warning',
                      });
                      break; // Only suggest one move per overloaded day
                    } catch (error) {
                      console.error('Error formatting date:', error);
                      continue;
                    }
                  }
                }
                
                // If no move is possible, suggest removing
                if (suggestions.length === 0 && sortedStops.length > 0) {
                  const longestStop = sortedStops[0];
                  if (longestStop.escapeRoom?.name && longestStop.escapeRoom?.duration) {
                    suggestions.push({
                      id: `remove-${longestStop.id}`,
                      type: 'removeEscapeRoom',
                      dayIndex,
                      escapeRoomId: longestStop.escapeRoomId,
                      message: `Considerar quitar "${longestStop.escapeRoom.name}" (${longestStop.escapeRoom.duration} min) para ajustar el tiempo`,
                      severity: 'error',
                    });
                  }
                }
              }
            }
            
            set(() => ({ suggestions }), false, 'generateSuggestions');
          } catch (error) {
            console.error('Error generating suggestions:', error);
            set(() => ({ suggestions: [] }), false, 'generateSuggestions');
          }
        },
        
        applySuggestion: async (suggestionId: string) => {
          const { suggestions } = get()
          const suggestion = suggestions.find(s => s.id === suggestionId)
          if (!suggestion) return
          
          switch (suggestion.type) {
            case 'moveEscapeRoom':
              if (suggestion.escapeRoomId && suggestion.targetDayIndex !== undefined) {
                await get().moveEscapeRoomBetweenDays(
                  suggestion.escapeRoomId,
                  suggestion.dayIndex,
                  suggestion.targetDayIndex
                )
              }
              break
            case 'removeEscapeRoom':
              if (suggestion.escapeRoomId) {
                await get().removeEscapeRoomFromDay(suggestion.dayIndex, suggestion.escapeRoomId)
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

        // State management methods
        validateState: () => {
          const { currentPlan } = get()
          if (!currentPlan) return false

          // Save current state as last valid state if validation passes
          set((state) => ({ lastValidState: { ...state } }), false, 'saveLastValidState')
          return true
        },

        saveState: () => {
          const currentState = get()
          set(() => ({ lastValidState: { ...currentState } }), false, 'saveState')
        },

        rollback: () => {
          const { lastValidState } = get()
          if (lastValidState) {
            set(() => ({ ...lastValidState, lastValidState: null }), false, 'rollback')
          }
        },

        lockEditing: () => {
          set(() => ({ isEditing: true }), false, 'lockEditing')
        },

        unlockEditing: () => {
          set(() => ({ isEditing: false }), false, 'unlockEditing')
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
export const useIsEditing = () => useMultiDayPlannerStore(state => state.isEditing)
export const useHasLastValidState = () => useMultiDayPlannerStore(state => state.lastValidState !== null)
export const useLoadingStates = () => useMultiDayPlannerStore(state => ({
  isLoading: state.isLoading,
  isCreating: state.isCreating,
  isSaving: state.isSaving
}))
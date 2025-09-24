import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { EscapeRoom, Route, Plan } from '../types'
import { OptimizedRoute } from '../../features/route-planning/services/routeService'

// Store state interface
interface PlannerState {
  // Current planning session state
  selectedEscapeRooms: EscapeRoom[]
  currentRoute: Route | null
  currentPlan: Plan | null
  optimizedRoute: OptimizedRoute | null
  
  // UI state
  isOptimizingRoute: boolean
  isDirty: boolean // Has unsaved changes
  
  // Actions for escape rooms
  addEscapeRoom: (room: EscapeRoom) => void
  removeEscapeRoom: (roomId: string) => void
  clearSelectedEscapeRooms: () => void
  reorderEscapeRooms: (fromIndex: number, toIndex: number) => void
  
  // Actions for routes
  setCurrentRoute: (route: Route | null) => void
  updateRoute: (updates: Partial<Route>) => void
  clearCurrentRoute: () => void
  
  // Actions for plans
  setCurrentPlan: (plan: Plan | null) => void
  updatePlan: (updates: Partial<Plan>) => void
  clearCurrentPlan: () => void
  
  // Actions for optimized routes
  setOptimizedRoute: (route: OptimizedRoute | null) => void
  clearOptimizedRoute: () => void
  
  // Utility actions
  setOptimizingRoute: (isOptimizing: boolean) => void
  markDirty: () => void
  markClean: () => void
  resetStore: () => void
}

// Initial state
const initialState = {
  selectedEscapeRooms: [],
  currentRoute: null,
  currentPlan: null,
  optimizedRoute: null,
  isOptimizingRoute: false,
  isDirty: false,
}

// Create the store
export const usePlannerStore = create<PlannerState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        // Escape room actions
        addEscapeRoom: (room: EscapeRoom) => {
          const { selectedEscapeRooms } = get()
          
          // Prevent duplicates
          if (selectedEscapeRooms.some(r => r.id === room.id)) {
            return
          }
          
          set(
            (state) => ({
              selectedEscapeRooms: [...state.selectedEscapeRooms, room],
              isDirty: true,
            }),
            false,
            'addEscapeRoom'
          )
        },
        
        removeEscapeRoom: (roomId: string) => {
          set(
            (state) => ({
              selectedEscapeRooms: state.selectedEscapeRooms.filter(room => room.id !== roomId),
              isDirty: true,
            }),
            false,
            'removeEscapeRoom'
          )
        },
        
        clearSelectedEscapeRooms: () => {
          set(
            (state) => ({
              selectedEscapeRooms: [],
              isDirty: state.selectedEscapeRooms.length > 0,
            }),
            false,
            'clearSelectedEscapeRooms'
          )
        },
        
        reorderEscapeRooms: (fromIndex: number, toIndex: number) => {
          const { selectedEscapeRooms } = get()
          
          if (fromIndex < 0 || fromIndex >= selectedEscapeRooms.length ||
              toIndex < 0 || toIndex >= selectedEscapeRooms.length) {
            return
          }
          
          const newOrder = [...selectedEscapeRooms]
          const [movedRoom] = newOrder.splice(fromIndex, 1)
          newOrder.splice(toIndex, 0, movedRoom)
          
          set(
            () => ({
              selectedEscapeRooms: newOrder,
              isDirty: true,
            }),
            false,
            'reorderEscapeRooms'
          )
        },
        
        // Route actions
        setCurrentRoute: (route: Route | null) => {
          set(
            () => ({
              currentRoute: route,
              isDirty: true,
            }),
            false,
            'setCurrentRoute'
          )
        },
        
        updateRoute: (updates: Partial<Route>) => {
          const { currentRoute } = get()
          
          if (!currentRoute) {
            return
          }
          
          set(
            (state) => ({
              currentRoute: {
                ...state.currentRoute!,
                ...updates,
                updatedAt: new Date(),
              },
              isDirty: true,
            }),
            false,
            'updateRoute'
          )
        },
        
        clearCurrentRoute: () => {
          set(
            (state) => ({
              currentRoute: null,
              isDirty: state.currentRoute !== null,
            }),
            false,
            'clearCurrentRoute'
          )
        },
        
        // Plan actions
        setCurrentPlan: (plan: Plan | null) => {
          set(
            () => ({
              currentPlan: plan,
              isDirty: true,
            }),
            false,
            'setCurrentPlan'
          )
        },
        
        updatePlan: (updates: Partial<Plan>) => {
          const { currentPlan } = get()
          
          if (!currentPlan) {
            return
          }
          
          set(
            (state) => ({
              currentPlan: {
                ...state.currentPlan!,
                ...updates,
                updatedAt: new Date(),
              },
              isDirty: true,
            }),
            false,
            'updatePlan'
          )
        },
        
        clearCurrentPlan: () => {
          set(
            (state) => ({
              currentPlan: null,
              isDirty: state.currentPlan !== null,
            }),
            false,
            'clearCurrentPlan'
          )
        },
        
        // Optimized route actions
        setOptimizedRoute: (route: OptimizedRoute | null) => {
          set(
            () => ({
              optimizedRoute: route,
              isDirty: true,
            }),
            false,
            'setOptimizedRoute'
          )
        },
        
        clearOptimizedRoute: () => {
          set(
            (state) => ({
              optimizedRoute: null,
              isDirty: state.optimizedRoute !== null,
            }),
            false,
            'clearOptimizedRoute'
          )
        },
        
        // Utility actions
        setOptimizingRoute: (isOptimizing: boolean) => {
          set(
            () => ({ isOptimizingRoute: isOptimizing }),
            false,
            'setOptimizingRoute'
          )
        },
        
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
        name: 'escape-room-planner-store',
        partialize: (state) => ({
          // Only persist essential data, not UI state
          selectedEscapeRooms: state.selectedEscapeRooms,
          currentRoute: state.currentRoute,
          currentPlan: state.currentPlan,
          optimizedRoute: state.optimizedRoute,
        }),
      }
    ),
    {
      name: 'planner-store',
    }
  )
)

// Selector hooks for better performance
export const useSelectedEscapeRooms = () => usePlannerStore(state => state.selectedEscapeRooms)
export const useCurrentRoute = () => usePlannerStore(state => state.currentRoute)
export const useCurrentPlan = () => usePlannerStore(state => state.currentPlan)
export const useOptimizedRoute = () => usePlannerStore(state => state.optimizedRoute)
export const useIsOptimizingRoute = () => usePlannerStore(state => state.isOptimizingRoute)
export const useIsDirty = () => usePlannerStore(state => state.isDirty)

// Individual action hooks to prevent infinite re-renders
export const useAddEscapeRoom = () => usePlannerStore(state => state.addEscapeRoom)
export const useRemoveEscapeRoom = () => usePlannerStore(state => state.removeEscapeRoom)
export const useClearSelectedEscapeRooms = () => usePlannerStore(state => state.clearSelectedEscapeRooms)
export const useReorderEscapeRooms = () => usePlannerStore(state => state.reorderEscapeRooms)
export const useSetCurrentRoute = () => usePlannerStore(state => state.setCurrentRoute)
export const useUpdateRoute = () => usePlannerStore(state => state.updateRoute)
export const useClearCurrentRoute = () => usePlannerStore(state => state.clearCurrentRoute)
export const useSetCurrentPlan = () => usePlannerStore(state => state.setCurrentPlan)
export const useUpdatePlan = () => usePlannerStore(state => state.updatePlan)
export const useClearCurrentPlan = () => usePlannerStore(state => state.clearCurrentPlan)
export const useSetOptimizedRoute = () => usePlannerStore(state => state.setOptimizedRoute)
export const useClearOptimizedRoute = () => usePlannerStore(state => state.clearOptimizedRoute)
export const useSetOptimizingRoute = () => usePlannerStore(state => state.setOptimizingRoute)
export const useMarkDirty = () => usePlannerStore(state => state.markDirty)
export const useMarkClean = () => usePlannerStore(state => state.markClean)
export const useResetStore = () => usePlannerStore(state => state.resetStore)
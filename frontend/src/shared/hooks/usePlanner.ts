import { useCallback } from 'react'
import {
    usePlannerStore,
    useSelectedEscapeRooms,
    useCurrentRoute,
    useCurrentPlan,
    useAddEscapeRoom,
    useRemoveEscapeRoom,
    useClearSelectedEscapeRooms,
    useReorderEscapeRooms,
    useSetCurrentRoute,
    useUpdateRoute,
    useClearCurrentRoute,
    useSetCurrentPlan,
    useUpdatePlan,
    useClearCurrentPlan,
    useMarkDirty,
    useMarkClean,
    useResetStore
} from '../stores/plannerStore'
import {
    useRoutePreview,
    useIsCalculatingRoute,
    useSetTransportMode,
    useSetOptimizeFor,
    useSetMaxTravelTime,
    useSetRoutePreview,
    useCalculateRoutePreview,
    useResetRoutePlanning
} from '../stores/routePlanningStore'
import { EscapeRoom, Route, Plan } from '../types'

/**
 * Combined hook that provides all planner functionality
 * This is the main hook components should use for planner state management
 */
export const usePlanner = () => {
    // Get state from both stores
    const selectedEscapeRooms = useSelectedEscapeRooms()
    const currentRoute = useCurrentRoute()
    const currentPlan = useCurrentPlan()
    const routePreview = useRoutePreview()
    const isCalculatingRoute = useIsCalculatingRoute()
    const isDirty = usePlannerStore(state => state.isDirty)

    // Get individual actions from both stores
    const addEscapeRoomAction = useAddEscapeRoom()
    const removeEscapeRoomAction = useRemoveEscapeRoom()
    const clearSelectedEscapeRooms = useClearSelectedEscapeRooms()
    const reorderEscapeRoomsAction = useReorderEscapeRooms()
    const setCurrentRoute = useSetCurrentRoute()
    const updateRoute = useUpdateRoute()
    const clearCurrentRoute = useClearCurrentRoute()
    const setCurrentPlan = useSetCurrentPlan()
    const updatePlan = useUpdatePlan()
    const clearCurrentPlan = useClearCurrentPlan()
    const markDirty = useMarkDirty()
    const markClean = useMarkClean()
    const resetStore = useResetStore()

    const setTransportMode = useSetTransportMode()
    const setOptimizeFor = useSetOptimizeFor()
    const setMaxTravelTime = useSetMaxTravelTime()
    const setRoutePreview = useSetRoutePreview()
    const calculateRoutePreview = useCalculateRoutePreview()
    const resetRoutePlanning = useResetRoutePlanning()

    // Simple actions without automatic preview calculation to avoid infinite loops
    const addEscapeRoom = useCallback((room: EscapeRoom) => {
        addEscapeRoomAction(room)
    }, [addEscapeRoomAction])

    const removeEscapeRoom = useCallback((roomId: string) => {
        removeEscapeRoomAction(roomId)
    }, [removeEscapeRoomAction])

    const reorderEscapeRooms = useCallback((fromIndex: number, toIndex: number) => {
        reorderEscapeRoomsAction(fromIndex, toIndex)
    }, [reorderEscapeRoomsAction])

    // Manual route preview calculation
    const updateRoutePreview = useCallback(() => {
        if (selectedEscapeRooms.length >= 2) {
            calculateRoutePreview(selectedEscapeRooms)
        } else {
            setRoutePreview(null)
        }
    }, [selectedEscapeRooms, calculateRoutePreview, setRoutePreview])

    // Create route from current selection
    const createRouteFromSelection = useCallback((): Route | null => {
        if (selectedEscapeRooms.length === 0) return null

        const now = new Date()
        const route: Route = {
            id: crypto.randomUUID(),
            name: `Route ${now.toLocaleDateString()}`,
            description: `Route with ${selectedEscapeRooms.length} escape rooms`,
            escapeRooms: [...selectedEscapeRooms],
            totalDuration: routePreview?.totalTime || selectedEscapeRooms.reduce((sum, room) => sum + room.duration, 0),
            totalDistance: routePreview?.totalDistance || 0,
            estimatedCost: routePreview?.estimatedCost || 0,
            createdAt: now,
            updatedAt: now,
        }

        return route
    }, [selectedEscapeRooms, routePreview])

    // Save current selection as route
    const saveCurrentSelectionAsRoute = useCallback(() => {
        const route = createRouteFromSelection()
        if (route) {
            setCurrentRoute(route)
            markClean()
        }
        return route
    }, [createRouteFromSelection, setCurrentRoute, markClean])

    // Create plan from current route
    const createPlanFromRoute = useCallback((route: Route, planName: string, startDate: Date, endDate: Date): Plan => {
        const now = new Date()
        const plan: Plan = {
            id: crypto.randomUUID(),
            name: planName,
            description: `Plan containing ${route.escapeRooms.length} escape rooms`,
            dailyRoutes: [], // Will be populated based on the route
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            createdBy: 'current-user',
            status: 'draft',
            createdAt: now,
            updatedAt: now,
        }

        return plan
    }, [])

    // Reset everything
    const resetAll = useCallback(() => {
        resetStore()
        resetRoutePlanning()
    }, [resetStore, resetRoutePlanning])

    return {
        // State
        selectedEscapeRooms,
        currentRoute,
        currentPlan,
        routePreview,
        isCalculatingRoute,
        isDirty,
        hasSelection: selectedEscapeRooms.length > 0,
        canCreateRoute: selectedEscapeRooms.length >= 2,

        // Basic actions (simple, no automatic preview)
        addEscapeRoom,
        removeEscapeRoom,
        clearSelectedEscapeRooms,
        reorderEscapeRooms,

        // Manual route preview update
        updateRoutePreview,

        // Route actions
        setCurrentRoute,
        updateRoute,
        clearCurrentRoute,
        createRouteFromSelection,
        saveCurrentSelectionAsRoute,

        // Plan actions
        setCurrentPlan,
        updatePlan,
        clearCurrentPlan,
        createPlanFromRoute,

        // Route planning actions
        setTransportMode,
        setOptimizeFor,
        setMaxTravelTime,
        calculateRoutePreview,

        // Utility actions
        markDirty,
        markClean,
        resetAll,
    }
}

/**
 * Hook for components that only need to read planner state
 */
export const usePlannerState = () => {
    const selectedEscapeRooms = useSelectedEscapeRooms()
    const currentRoute = useCurrentRoute()
    const currentPlan = useCurrentPlan()
    const routePreview = useRoutePreview()
    const isCalculatingRoute = useIsCalculatingRoute()
    const isDirty = usePlannerStore(state => state.isDirty)

    return {
        selectedEscapeRooms,
        currentRoute,
        currentPlan,
        routePreview,
        isCalculatingRoute,
        isDirty,
        hasSelection: selectedEscapeRooms.length > 0,
        canCreateRoute: selectedEscapeRooms.length >= 2,
    }
}
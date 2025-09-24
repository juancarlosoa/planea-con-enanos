import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { planService, CreatePlanRequest, UpdatePlanRequest, UpdatePlanDateRangeRequest } from '../services/planService'
import { Plan } from '@/shared/types'

// Query keys
export const planKeys = {
  all: ['plans'] as const,
  lists: () => [...planKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...planKeys.lists(), { filters }] as const,
  details: () => [...planKeys.all, 'detail'] as const,
  detail: (id: string) => [...planKeys.details(), id] as const,
  dailyRoute: (planId: string, date: string) => [...planKeys.detail(planId), 'daily-route', date] as const,
}

// Queries
export const usePlans = () => {
  return useQuery({
    queryKey: planKeys.lists(),
    queryFn: () => planService.getPlans(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const usePlan = (planId: string) => {
  return useQuery({
    queryKey: planKeys.detail(planId),
    queryFn: () => planService.getPlan(planId),
    enabled: !!planId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export const useDailyRoute = (planId: string, date: string) => {
  return useQuery({
    queryKey: planKeys.dailyRoute(planId, date),
    queryFn: () => planService.getDailyRoute(planId, date),
    enabled: !!planId && !!date,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

// Mutations
export const useCreatePlan = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: CreatePlanRequest) => planService.createPlan(request),
    onSuccess: (newPlan) => {
      // Update the plans list
      queryClient.setQueryData(planKeys.lists(), (old: Plan[] | undefined) => {
        return old ? [...old, newPlan] : [newPlan]
      })
      
      // Set the new plan in cache
      queryClient.setQueryData(planKeys.detail(newPlan.id), newPlan)
    },
  })
}

export const useUpdatePlan = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ planId, request }: { planId: string; request: UpdatePlanRequest }) =>
      planService.updatePlan(planId, request),
    onSuccess: (updatedPlan) => {
      // Update the plan in cache
      queryClient.setQueryData(planKeys.detail(updatedPlan.id), updatedPlan)
      
      // Update the plans list
      queryClient.setQueryData(planKeys.lists(), (old: Plan[] | undefined) => {
        return old?.map(plan => plan.id === updatedPlan.id ? updatedPlan : plan)
      })
    },
  })
}

export const useUpdatePlanDateRange = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ planId, request }: { planId: string; request: UpdatePlanDateRangeRequest }) =>
      planService.updatePlanDateRange(planId, request),
    onSuccess: (updatedPlan) => {
      // Update the plan in cache
      queryClient.setQueryData(planKeys.detail(updatedPlan.id), updatedPlan)
      
      // Invalidate daily route queries since dates may have changed
      queryClient.invalidateQueries({ queryKey: [...planKeys.detail(updatedPlan.id), 'daily-route'] })
    },
  })
}

export const useDeletePlan = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (planId: string) => planService.deletePlan(planId),
    onSuccess: (_, planId) => {
      // Remove from plans list
      queryClient.setQueryData(planKeys.lists(), (old: Plan[] | undefined) => {
        return old?.filter(plan => plan.id !== planId)
      })
      
      // Remove from cache
      queryClient.removeQueries({ queryKey: planKeys.detail(planId) })
    },
  })
}

export const useActivatePlan = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (planId: string) => planService.activatePlan(planId),
    onSuccess: (updatedPlan) => {
      queryClient.setQueryData(planKeys.detail(updatedPlan.id), updatedPlan)
      queryClient.setQueryData(planKeys.lists(), (old: Plan[] | undefined) => {
        return old?.map(plan => plan.id === updatedPlan.id ? updatedPlan : plan)
      })
    },
  })
}

export const useCompletePlan = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (planId: string) => planService.completePlan(planId),
    onSuccess: (updatedPlan) => {
      queryClient.setQueryData(planKeys.detail(updatedPlan.id), updatedPlan)
      queryClient.setQueryData(planKeys.lists(), (old: Plan[] | undefined) => {
        return old?.map(plan => plan.id === updatedPlan.id ? updatedPlan : plan)
      })
    },
  })
}

export const useCancelPlan = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (planId: string) => planService.cancelPlan(planId),
    onSuccess: (updatedPlan) => {
      queryClient.setQueryData(planKeys.detail(updatedPlan.id), updatedPlan)
      queryClient.setQueryData(planKeys.lists(), (old: Plan[] | undefined) => {
        return old?.map(plan => plan.id === updatedPlan.id ? updatedPlan : plan)
      })
    },
  })
}

// Daily route mutations
export const useAddStopToDay = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ planId, date, escapeRoomId }: { planId: string; date: string; escapeRoomId: string }) =>
      planService.addStopToDay(planId, date, { escapeRoomId }),
    onSuccess: (updatedRoute, { planId, date }) => {
      // Update daily route cache
      queryClient.setQueryData(planKeys.dailyRoute(planId, date), updatedRoute)
      
      // Invalidate plan to refresh the full plan data
      queryClient.invalidateQueries({ queryKey: planKeys.detail(planId) })
    },
  })
}

export const useRemoveStopFromDay = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ planId, date, escapeRoomId }: { planId: string; date: string; escapeRoomId: string }) =>
      planService.removeStopFromDay(planId, date, escapeRoomId),
    onSuccess: (updatedRoute, { planId, date }) => {
      queryClient.setQueryData(planKeys.dailyRoute(planId, date), updatedRoute)
      queryClient.invalidateQueries({ queryKey: planKeys.detail(planId) })
    },
  })
}

export const useMoveStopBetweenDays = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ planId, fromDate, escapeRoomId, targetDate }: { 
      planId: string; 
      fromDate: string; 
      escapeRoomId: string; 
      targetDate: string 
    }) =>
      planService.moveStopBetweenDays(planId, fromDate, escapeRoomId, { targetDate }),
    onSuccess: ({ fromRoute, toRoute }, { planId, fromDate, targetDate }) => {
      // Update both daily routes
      queryClient.setQueryData(planKeys.dailyRoute(planId, fromDate), fromRoute)
      queryClient.setQueryData(planKeys.dailyRoute(planId, targetDate), toRoute)
      
      // Invalidate plan
      queryClient.invalidateQueries({ queryKey: planKeys.detail(planId) })
    },
  })
}

export const useReorderStopsInDay = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ planId, date, escapeRoomIds }: { planId: string; date: string; escapeRoomIds: string[] }) =>
      planService.reorderStopsInDay(planId, date, { escapeRoomIds }),
    onSuccess: (updatedRoute, { planId, date }) => {
      queryClient.setQueryData(planKeys.dailyRoute(planId, date), updatedRoute)
      queryClient.invalidateQueries({ queryKey: planKeys.detail(planId) })
    },
  })
}

export const useOptimizeDailyRoute = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ planId, date }: { planId: string; date: string }) =>
      planService.optimizeDailyRoute(planId, date),
    onSuccess: (optimizedRoute, { planId, date }) => {
      queryClient.setQueryData(planKeys.dailyRoute(planId, date), optimizedRoute)
      queryClient.invalidateQueries({ queryKey: planKeys.detail(planId) })
    },
  })
}

export const useOptimizeAllRoutes = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (planId: string) => planService.optimizeAllRoutes(planId),
    onSuccess: (optimizedPlan) => {
      queryClient.setQueryData(planKeys.detail(optimizedPlan.id), optimizedPlan)
      
      // Invalidate all daily route queries for this plan
      queryClient.invalidateQueries({ 
        queryKey: [...planKeys.detail(optimizedPlan.id), 'daily-route'] 
      })
    },
  })
}

// Sharing and export
export const useGeneratePublicLink = () => {
  return useMutation({
    mutationFn: (planId: string) => planService.generatePublicLink(planId),
  })
}

export const useExportToPdf = () => {
  return useMutation({
    mutationFn: (planId: string) => planService.exportToPdf(planId),
  })
}

export const useExportToJson = () => {
  return useMutation({
    mutationFn: (planId: string) => planService.exportToJson(planId),
  })
}

// Public plan access
export const usePublicPlan = (shareToken: string) => {
  return useQuery({
    queryKey: ['public-plan', shareToken],
    queryFn: () => planService.getPublicPlan(shareToken),
    enabled: !!shareToken,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}
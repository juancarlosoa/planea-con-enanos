import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { escapeRoomService, EscapeRoomFilters } from '../services/escapeRoomService'
import { EscapeRoom } from '@/shared/types'

// Query keys
export const escapeRoomKeys = {
  all: ['escapeRooms'] as const,
  lists: () => [...escapeRoomKeys.all, 'list'] as const,
  list: (filters: EscapeRoomFilters) => [...escapeRoomKeys.lists(), filters] as const,
  details: () => [...escapeRoomKeys.all, 'detail'] as const,
  detail: (id: string) => [...escapeRoomKeys.details(), id] as const,
}

// Hook to get all escape rooms
export const useEscapeRooms = () => {
  return useQuery({
    queryKey: escapeRoomKeys.lists(),
    queryFn: () => escapeRoomService.getAllEscapeRooms(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Hook to get escape room by ID
export const useEscapeRoom = (id: string) => {
  return useQuery({
    queryKey: escapeRoomKeys.detail(id),
    queryFn: () => escapeRoomService.getEscapeRoomById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

// Hook to search escape rooms with filters
export const useSearchEscapeRooms = (filters: EscapeRoomFilters) => {
  return useQuery({
    queryKey: escapeRoomKeys.list(filters),
    queryFn: () => escapeRoomService.searchEscapeRooms(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
    gcTime: 5 * 60 * 1000,
  })
}

// Hook for escape room mutations (future use)
export const useEscapeRoomMutations = () => {
  const queryClient = useQueryClient()

  const createEscapeRoom = useMutation({
    mutationFn: (_escapeRoom: Omit<EscapeRoom, 'id'>) => {
      // TODO: Implement when backend is ready
      throw new Error('Create escape room not implemented yet')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: escapeRoomKeys.all })
    },
  })

  const updateEscapeRoom = useMutation({
    mutationFn: (_: EscapeRoom) => {
      // TODO: Implement when backend is ready
      throw new Error('Update escape room not implemented yet')
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: escapeRoomKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: escapeRoomKeys.lists() })
    },
  })

  const deleteEscapeRoom = useMutation({
    mutationFn: (_id: string) => {
      // TODO: Implement when backend is ready
      throw new Error('Delete escape room not implemented yet')
    },
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: escapeRoomKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: escapeRoomKeys.lists() })
    },
  })

  return {
    createEscapeRoom,
    updateEscapeRoom,
    deleteEscapeRoom,
  }
}
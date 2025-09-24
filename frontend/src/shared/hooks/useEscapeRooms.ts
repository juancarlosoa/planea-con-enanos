import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { escapeRoomService, EscapeRoomFilters } from '@/features/escape-rooms/services/escapeRoomService'
import { EscapeRoom } from '@/shared/types'

// Query keys for React Query
export const escapeRoomKeys = {
  all: ['escapeRooms'] as const,
  lists: () => [...escapeRoomKeys.all, 'list'] as const,
  list: (filters: EscapeRoomFilters) => [...escapeRoomKeys.lists(), filters] as const,
  details: () => [...escapeRoomKeys.all, 'detail'] as const,
  detail: (id: string) => [...escapeRoomKeys.details(), id] as const,
  search: (filters: EscapeRoomFilters) => [...escapeRoomKeys.all, 'search', filters] as const,
}

// Hook to get all escape rooms
export const useEscapeRooms = () => {
  return useQuery({
    queryKey: escapeRoomKeys.lists(),
    queryFn: () => escapeRoomService.getAllEscapeRooms(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  })
}

// Hook to get a specific escape room by ID
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
export const useSearchEscapeRooms = (filters: EscapeRoomFilters, enabled = true) => {
  return useQuery({
    queryKey: escapeRoomKeys.search(filters),
    queryFn: () => escapeRoomService.searchEscapeRooms(filters),
    enabled: enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
    gcTime: 5 * 60 * 1000,
  })
}

// Hook to create a new escape room (for admin functionality)
export const useCreateEscapeRoom = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (_escapeRoom: Omit<EscapeRoom, 'id'>) => {
      // This would be implemented when backend is ready
      throw new Error('Create escape room not implemented yet')
    },
    onSuccess: () => {
      // Invalidate and refetch escape rooms list
      queryClient.invalidateQueries({ queryKey: escapeRoomKeys.lists() })
    },
    onError: (error) => {
      console.error('Error creating escape room:', error)
    },
  })
}

// Hook to update an escape room (for admin functionality)
export const useUpdateEscapeRoom = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id: _id }: Partial<EscapeRoom> & { id: string }) => {
      // This would be implemented when backend is ready
      throw new Error('Update escape room not implemented yet')
    },
    onSuccess: (data, variables) => {
      // Update the specific escape room in cache
      queryClient.setQueryData(escapeRoomKeys.detail(variables.id), data)
      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: escapeRoomKeys.lists() })
    },
    onError: (error) => {
      console.error('Error updating escape room:', error)
    },
  })
}

// Hook to delete an escape room (for admin functionality)
export const useDeleteEscapeRoom = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (_id: string) => {
      // This would be implemented when backend is ready
      throw new Error('Delete escape room not implemented yet')
    },
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: escapeRoomKeys.detail(id) })
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: escapeRoomKeys.lists() })
    },
    onError: (error) => {
      console.error('Error deleting escape room:', error)
    },
  })
}

// Hook to prefetch escape room details
export const usePrefetchEscapeRoom = () => {
  const queryClient = useQueryClient()

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: escapeRoomKeys.detail(id),
      queryFn: () => escapeRoomService.getEscapeRoomById(id),
      staleTime: 5 * 60 * 1000,
    })
  }
}

// Hook to get cached escape room data without triggering a request
export const useEscapeRoomCache = (id: string) => {
  const queryClient = useQueryClient()
  return queryClient.getQueryData<EscapeRoom | null>(escapeRoomKeys.detail(id))
}
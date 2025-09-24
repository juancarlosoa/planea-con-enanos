import { useState, useMemo, useCallback } from 'react'
import { useDebounce } from './useDebounce'
import { useSearchEscapeRooms } from './useEscapeRooms'
import { EscapeRoomFilters } from '@/features/escape-rooms/services/escapeRoomService'
import { EscapeRoom } from '@/shared/types'

export interface SearchFilters {
  search: string
  difficulty: string[]
  minRating: number
  maxPrice: number | null
  theme: string[]
  minDuration: number
  maxDuration: number
  location: {
    latitude: number
    longitude: number
    radius: number
  } | null
}

export interface UseEscapeRoomSearchOptions {
  debounceDelay?: number
  enabledByDefault?: boolean
  autoSearch?: boolean
}

export interface UseEscapeRoomSearchReturn {
  // Search state
  filters: SearchFilters
  setFilters: (filters: Partial<SearchFilters>) => void
  resetFilters: () => void
  
  // Search actions
  search: (searchTerm: string) => void
  setDifficulty: (difficulty: string[]) => void
  setMinRating: (rating: number) => void
  setMaxPrice: (price: number | null) => void
  setTheme: (theme: string[]) => void
  setDurationRange: (min: number, max: number) => void
  setLocationFilter: (location: SearchFilters['location']) => void
  
  // Results
  results: EscapeRoom[]
  isLoading: boolean
  isError: boolean
  error: Error | null
  
  // Metadata
  hasActiveFilters: boolean
  resultCount: number
  
  // Actions
  clearSearch: () => void
  refetch: () => void
}

const defaultFilters: SearchFilters = {
  search: '',
  difficulty: [],
  minRating: 0,
  maxPrice: null,
  theme: [],
  minDuration: 0,
  maxDuration: 120,
  location: null,
}

export const useEscapeRoomSearch = (
  options: UseEscapeRoomSearchOptions = {}
): UseEscapeRoomSearchReturn => {
  const {
    debounceDelay = 300,
    enabledByDefault = true,
    autoSearch = true,
  } = options

  const [filters, setFiltersState] = useState<SearchFilters>(defaultFilters)
  const [enabled, setEnabled] = useState(enabledByDefault)

  // Debounce the search term to avoid excessive API calls
  const debouncedSearch = useDebounce(filters.search, debounceDelay)

  // Create the API filters object
  const apiFilters = useMemo((): EscapeRoomFilters => {
    const result: EscapeRoomFilters = {}

    if (debouncedSearch.trim()) {
      result.search = debouncedSearch.trim()
    }

    if (filters.difficulty.length > 0) {
      result.difficulty = filters.difficulty
    }

    if (filters.minRating > 0) {
      result.minRating = filters.minRating
    }

    if (filters.maxPrice !== null) {
      result.maxPrice = filters.maxPrice
    }

    if (filters.theme.length > 0) {
      result.theme = filters.theme
    }

    if (filters.location) {
      result.location = filters.location
    }

    return result
  }, [debouncedSearch, filters])

  // Use React Query to fetch search results
  const {
    data: results = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useSearchEscapeRooms(apiFilters, enabled && autoSearch)

  // Filter results by duration on the client side (since it's not in the API yet)
  const filteredResults = useMemo(() => {
    return results.filter(room => {
      if (filters.minDuration > 0 && room.duration < filters.minDuration) {
        return false
      }
      if (filters.maxDuration < 120 && room.duration > filters.maxDuration) {
        return false
      }
      return true
    })
  }, [results, filters.minDuration, filters.maxDuration])

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      filters.search.trim() !== '' ||
      filters.difficulty.length > 0 ||
      filters.minRating > 0 ||
      filters.maxPrice !== null ||
      filters.theme.length > 0 ||
      filters.minDuration > 0 ||
      filters.maxDuration < 120 ||
      filters.location !== null
    )
  }, [filters])

  // Update filters
  const setFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }))
    if (!autoSearch) {
      setEnabled(true)
    }
  }, [autoSearch])

  // Reset all filters
  const resetFilters = useCallback(() => {
    setFiltersState(defaultFilters)
    setEnabled(enabledByDefault)
  }, [enabledByDefault])

  // Individual filter setters
  const search = useCallback((searchTerm: string) => {
    setFilters({ search: searchTerm })
  }, [setFilters])

  const setDifficulty = useCallback((difficulty: string[]) => {
    setFilters({ difficulty })
  }, [setFilters])

  const setMinRating = useCallback((minRating: number) => {
    setFilters({ minRating })
  }, [setFilters])

  const setMaxPrice = useCallback((maxPrice: number | null) => {
    setFilters({ maxPrice })
  }, [setFilters])

  const setTheme = useCallback((theme: string[]) => {
    setFilters({ theme })
  }, [setFilters])

  const setDurationRange = useCallback((minDuration: number, maxDuration: number) => {
    setFilters({ minDuration, maxDuration })
  }, [setFilters])

  const setLocationFilter = useCallback((location: SearchFilters['location']) => {
    setFilters({ location })
  }, [setFilters])

  const clearSearch = useCallback(() => {
    setFilters({ search: '' })
  }, [setFilters])

  return {
    // Search state
    filters,
    setFilters,
    resetFilters,
    
    // Search actions
    search,
    setDifficulty,
    setMinRating,
    setMaxPrice,
    setTheme,
    setDurationRange,
    setLocationFilter,
    
    // Results
    results: filteredResults,
    isLoading,
    isError,
    error: error as Error | null,
    
    // Metadata
    hasActiveFilters,
    resultCount: filteredResults.length,
    
    // Actions
    clearSearch,
    refetch,
  }
}
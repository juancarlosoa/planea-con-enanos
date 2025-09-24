import React, { useState, useRef, useEffect } from 'react'
import { Search, X, MapPin, Clock, Star } from 'lucide-react'
import { useEscapeRoomSearch } from '@/shared/hooks/useEscapeRoomSearch'
import { EscapeRoom } from '@/shared/types'

interface SearchBarProps {
  onEscapeRoomSelect?: (escapeRoom: EscapeRoom) => void
  placeholder?: string
  className?: string
  showSuggestions?: boolean
  maxSuggestions?: number
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onEscapeRoomSelect,
  placeholder = 'Buscar escape rooms...',
  className = '',
  showSuggestions = true,
  maxSuggestions = 5,
}) => {
  const [isFocused, setIsFocused] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  const {
    filters,
    search,
    clearSearch,
    results,
    isLoading,
    hasActiveFilters,
  } = useEscapeRoomSearch({
    debounceDelay: 200,
    autoSearch: true,
  })

  // Get suggestions based on search results
  const suggestions = showSuggestions 
    ? results.slice(0, maxSuggestions)
    : []

  const showSuggestionsList = isFocused && filters.search.trim() && suggestions.length > 0

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    search(value)
    setSelectedIndex(-1)
  }

  // Handle clear search
  const handleClear = () => {
    clearSearch()
    setSelectedIndex(-1)
    inputRef.current?.focus()
  }

  // Handle suggestion click
  const handleSuggestionClick = (escapeRoom: EscapeRoom) => {
    search(escapeRoom.name)
    setIsFocused(false)
    setSelectedIndex(-1)
    onEscapeRoomSelect?.(escapeRoom)
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestionsList) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex])
        }
        break
      case 'Escape':
        setIsFocused(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsFocused(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={filters.search}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          className={`
            block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            placeholder-gray-500 text-gray-900
            ${isLoading ? 'bg-gray-50' : 'bg-white'}
            transition-colors duration-200
          `}
        />

        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute inset-y-0 right-10 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Clear button */}
        {hasActiveFilters && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestionsList && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto"
        >
          {suggestions.map((escapeRoom, index) => (
            <button
              key={escapeRoom.id}
              onClick={() => handleSuggestionClick(escapeRoom)}
              className={`
                w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50
                border-b border-gray-100 last:border-b-0
                ${index === selectedIndex ? 'bg-blue-50 border-blue-200' : ''}
                transition-colors duration-150
              `}
            >
              <div className="flex items-start space-x-3">
                {/* Escape Room Image */}
                {escapeRoom.imageUrl && (
                  <img
                    src={escapeRoom.imageUrl}
                    alt={escapeRoom.name}
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                  />
                )}
                
                {/* Escape Room Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {escapeRoom.name}
                  </h4>
                  
                  <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{escapeRoom.address}</span>
                    </div>
                  </div>
                  
                  <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3 fill-current text-yellow-400" />
                      <span>{escapeRoom.rating}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{escapeRoom.duration} min</span>
                    </div>
                    
                    <span className={`
                      px-2 py-0.5 rounded-full text-xs font-medium
                      ${escapeRoom.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                        escapeRoom.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'}
                    `}>
                      {escapeRoom.difficulty}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
          
          {/* Show more results indicator */}
          {results.length > maxSuggestions && (
            <div className="px-4 py-2 text-xs text-gray-500 bg-gray-50 border-t">
              +{results.length - maxSuggestions} más resultados
            </div>
          )}
        </div>
      )}
    </div>
  )
}
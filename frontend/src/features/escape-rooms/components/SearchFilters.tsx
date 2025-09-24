import React, { useState } from 'react'
import { Filter, X, MapPin, Star, Clock, DollarSign, Zap } from 'lucide-react'
import { useEscapeRoomSearch } from '@/shared/hooks/useEscapeRoomSearch'

interface SearchFiltersProps {
  className?: string
  onLocationRequest?: () => void
}

const difficultyOptions = [
  { value: 'easy', label: 'Fácil', color: 'bg-green-100 text-green-800' },
  { value: 'medium', label: 'Medio', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'hard', label: 'Difícil', color: 'bg-red-100 text-red-800' },
]

const themeOptions = [
  'Mystery', 'Horror', 'Adventure', 'Sci-Fi', 'Historical', 'Fantasy',
  'Crime', 'Thriller', 'Comedy', 'Family'
]

const priceRanges = [
  { value: 20, label: 'Hasta 20€' },
  { value: 30, label: 'Hasta 30€' },
  { value: 40, label: 'Hasta 40€' },
  { value: 50, label: 'Hasta 50€' },
]

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  className = '',
  onLocationRequest,
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const {
    filters,
    setDifficulty,
    setMinRating,
    setMaxPrice,
    setTheme,
    setDurationRange,
    setLocationFilter,
    resetFilters,
    hasActiveFilters,
    resultCount,
  } = useEscapeRoomSearch()

  // Handle difficulty filter change
  const handleDifficultyChange = (difficulty: string) => {
    const newDifficulties = filters.difficulty.includes(difficulty)
      ? filters.difficulty.filter(d => d !== difficulty)
      : [...filters.difficulty, difficulty]
    setDifficulty(newDifficulties)
  }

  // Handle theme filter change
  const handleThemeChange = (theme: string) => {
    const newThemes = filters.theme.includes(theme)
      ? filters.theme.filter(t => t !== theme)
      : [...filters.theme, theme]
    setTheme(newThemes)
  }

  // Handle location filter
  const handleLocationFilter = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationFilter({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            radius: 10, // 10km radius
          })
        },
        (error) => {
          console.error('Error getting location:', error)
          onLocationRequest?.()
        }
      )
    } else {
      onLocationRequest?.()
    }
  }

  // Clear location filter
  const clearLocationFilter = () => {
    setLocationFilter(null)
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      {/* Filter Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-medium text-gray-900">Filtros</h3>
          {hasActiveFilters && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
              {resultCount} resultados
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1"
            >
              <X className="h-4 w-4" />
              <span>Limpiar</span>
            </button>
          )}
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            {isExpanded ? 'Menos filtros' : 'Más filtros'}
          </button>
        </div>
      </div>

      {/* Filter Content */}
      <div className="p-4 space-y-6">
        {/* Difficulty Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Zap className="inline h-4 w-4 mr-1" />
            Dificultad
          </label>
          <div className="flex flex-wrap gap-2">
            {difficultyOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleDifficultyChange(option.value)}
                className={`
                  px-3 py-1 rounded-full text-sm font-medium transition-colors
                  ${filters.difficulty.includes(option.value)
                    ? option.color
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Rating Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Star className="inline h-4 w-4 mr-1" />
            Calificación mínima
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="0"
              max="5"
              step="0.5"
              value={filters.minRating}
              onChange={(e) => setMinRating(parseFloat(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex items-center space-x-1 min-w-0">
              <Star className="h-4 w-4 fill-current text-yellow-400" />
              <span className="text-sm font-medium text-gray-700">
                {filters.minRating > 0 ? filters.minRating : 'Cualquiera'}
              </span>
            </div>
          </div>
        </div>

        {/* Location Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="inline h-4 w-4 mr-1" />
            Ubicación
          </label>
          <div className="flex items-center space-x-2">
            {filters.location ? (
              <div className="flex items-center space-x-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg flex-1">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">Cerca de tu ubicación (10km)</span>
                <button
                  onClick={clearLocationFilter}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleLocationFilter}
                className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex-1"
              >
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">Usar mi ubicación</span>
              </button>
            )}
          </div>
        </div>

        {/* Expanded Filters */}
        {isExpanded && (
          <>
            {/* Price Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="inline h-4 w-4 mr-1" />
                Precio máximo
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setMaxPrice(null)}
                  className={`
                    px-3 py-1 rounded-full text-sm font-medium transition-colors
                    ${filters.maxPrice === null
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  Cualquier precio
                </button>
                {priceRanges.map((range) => (
                  <button
                    key={range.value}
                    onClick={() => setMaxPrice(range.value)}
                    className={`
                      px-3 py-1 rounded-full text-sm font-medium transition-colors
                      ${filters.maxPrice === range.value
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }
                    `}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="inline h-4 w-4 mr-1" />
                Duración (minutos)
              </label>
              <div className="space-y-2">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Mínimo</label>
                    <input
                      type="range"
                      min="0"
                      max="120"
                      step="15"
                      value={filters.minDuration}
                      onChange={(e) => setDurationRange(parseInt(e.target.value), filters.maxDuration)}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-xs text-gray-600">{filters.minDuration} min</span>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Máximo</label>
                    <input
                      type="range"
                      min="0"
                      max="120"
                      step="15"
                      value={filters.maxDuration}
                      onChange={(e) => setDurationRange(filters.minDuration, parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-xs text-gray-600">{filters.maxDuration} min</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Theme Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Temática
              </label>
              <div className="flex flex-wrap gap-2">
                {themeOptions.map((theme) => (
                  <button
                    key={theme}
                    onClick={() => handleThemeChange(theme)}
                    className={`
                      px-3 py-1 rounded-full text-sm font-medium transition-colors
                      ${filters.theme.includes(theme)
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }
                    `}
                  >
                    {theme}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
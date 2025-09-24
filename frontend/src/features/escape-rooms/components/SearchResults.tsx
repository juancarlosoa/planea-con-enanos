import React from 'react'
import { MapPin, Star, Clock, Users, Plus, ExternalLink } from 'lucide-react'
import { useEscapeRoomSearch } from '@/shared/hooks/useEscapeRoomSearch'
import { EscapeRoom } from '@/shared/types'

interface SearchResultsProps {
  onEscapeRoomSelect?: (escapeRoom: EscapeRoom) => void
  onAddToRoute?: (escapeRoom: EscapeRoom) => void
  selectedEscapeRooms?: string[]
  className?: string
  showAddButton?: boolean
  layout?: 'grid' | 'list'
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  onEscapeRoomSelect,
  onAddToRoute,
  selectedEscapeRooms = [],
  className = '',
  showAddButton = true,
  layout = 'grid',
}) => {
  const {
    results,
    isLoading,
    isError,
    error,
    hasActiveFilters,
    resultCount,
  } = useEscapeRoomSearch()

  // Loading state
  if (isLoading) {
    return (
      <div className={`${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="animate-pulse">
                <div className="h-48 bg-gray-300"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-300 rounded w-full"></div>
                  <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                  <div className="flex space-x-2">
                    <div className="h-6 bg-gray-300 rounded w-16"></div>
                    <div className="h-6 bg-gray-300 rounded w-20"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (isError) {
    return (
      <div className={`${className}`}>
        <div className="text-center py-12">
          <div className="text-red-500 text-lg font-medium mb-2">
            Error al cargar los escape rooms
          </div>
          <div className="text-gray-600 mb-4">
            {error?.message || 'Ha ocurrido un error inesperado'}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  // Empty state
  if (results.length === 0) {
    return (
      <div className={`${className}`}>
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg font-medium mb-2">
            {hasActiveFilters ? 'No se encontraron resultados' : 'No hay escape rooms disponibles'}
          </div>
          <div className="text-gray-400">
            {hasActiveFilters 
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'Vuelve más tarde para ver nuevas opciones'
            }
          </div>
        </div>
      </div>
    )
  }

  // Results header
  const ResultsHeader = () => (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-semibold text-gray-900">
        {hasActiveFilters ? `${resultCount} resultados encontrados` : 'Todos los escape rooms'}
      </h2>
    </div>
  )

  // Escape room card component
  const EscapeRoomCard: React.FC<{ escapeRoom: EscapeRoom }> = ({ escapeRoom }) => {
    const isSelected = selectedEscapeRooms.includes(escapeRoom.id)
    
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={escapeRoom.imageUrl || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400'}
            alt={escapeRoom.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
          />
          
          {/* Difficulty badge */}
          <div className="absolute top-3 left-3">
            <span className={`
              px-2 py-1 rounded-full text-xs font-medium
              ${escapeRoom.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                escapeRoom.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'}
            `}>
              {escapeRoom.difficulty === 'easy' ? 'Fácil' :
               escapeRoom.difficulty === 'medium' ? 'Medio' : 'Difícil'}
            </span>
          </div>

          {/* Selected indicator */}
          {isSelected && (
            <div className="absolute top-3 right-3">
              <div className="bg-blue-600 text-white rounded-full p-1">
                <Plus className="h-4 w-4 rotate-45" />
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
              {escapeRoom.name}
            </h3>
            <div className="flex items-center space-x-1 ml-2">
              <Star className="h-4 w-4 fill-current text-yellow-400" />
              <span className="text-sm font-medium text-gray-700">
                {escapeRoom.rating}
              </span>
            </div>
          </div>

          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {escapeRoom.description}
          </p>

          {/* Location */}
          <div className="flex items-center space-x-1 text-gray-500 text-sm mb-3">
            <MapPin className="h-4 w-4" />
            <span className="line-clamp-1">{escapeRoom.address}</span>
          </div>

          {/* Details */}
          <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{escapeRoom.duration} min</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>{escapeRoom.minPlayers}-{escapeRoom.maxPlayers}</span>
            </div>
            
            <div className="font-medium text-gray-900">
              {escapeRoom.priceRange}
            </div>
          </div>

          {/* Theme */}
          <div className="mb-4">
            <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
              {escapeRoom.theme}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onEscapeRoomSelect?.(escapeRoom)}
              className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              Ver detalles
            </button>
            
            {showAddButton && (
              <button
                onClick={() => onAddToRoute?.(escapeRoom)}
                disabled={isSelected}
                className={`
                  px-3 py-2 rounded-lg transition-colors text-sm font-medium
                  ${isSelected
                    ? 'bg-green-100 text-green-700 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                  }
                `}
              >
                {isSelected ? (
                  <Plus className="h-4 w-4 rotate-45" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </button>
            )}

            {/* External link */}
            {escapeRoom.website && (
              <a
                href={escapeRoom.website}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    )
  }

  // List layout
  if (layout === 'list') {
    return (
      <div className={className}>
        <ResultsHeader />
        <div className="space-y-4">
          {results.map((escapeRoom) => (
            <div key={escapeRoom.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-4">
                <img
                  src={escapeRoom.imageUrl || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400'}
                  alt={escapeRoom.name}
                  className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {escapeRoom.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                        {escapeRoom.description}
                      </p>
                    </div>
                    <div className="flex items-center space-x-1 ml-4">
                      <Star className="h-4 w-4 fill-current text-yellow-400" />
                      <span className="text-sm font-medium text-gray-700">
                        {escapeRoom.rating}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span className="truncate max-w-xs">{escapeRoom.address}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{escapeRoom.duration} min</span>
                      </div>
                      <span className="font-medium text-gray-900">
                        {escapeRoom.priceRange}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onEscapeRoomSelect?.(escapeRoom)}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                      >
                        Ver detalles
                      </button>
                      {showAddButton && (
                        <button
                          onClick={() => onAddToRoute?.(escapeRoom)}
                          disabled={selectedEscapeRooms.includes(escapeRoom.id)}
                          className={`
                            px-3 py-1 rounded-lg transition-colors text-sm
                            ${selectedEscapeRooms.includes(escapeRoom.id)
                              ? 'bg-green-100 text-green-700 cursor-not-allowed'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                            }
                          `}
                        >
                          {selectedEscapeRooms.includes(escapeRoom.id) ? 'Agregado' : 'Agregar'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Grid layout (default)
  return (
    <div className={className}>
      <ResultsHeader />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((escapeRoom) => (
          <EscapeRoomCard key={escapeRoom.id} escapeRoom={escapeRoom} />
        ))}
      </div>
    </div>
  )
}
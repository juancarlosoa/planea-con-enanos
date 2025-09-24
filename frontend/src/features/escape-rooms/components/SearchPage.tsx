import React, { useState } from 'react'
import { Grid, List, Map } from 'lucide-react'
import { SearchBar } from './SearchBar'
import { SearchFilters } from './SearchFilters'
import { SearchResults } from './SearchResults'
import { EscapeRoom } from '@/shared/types'

interface SearchPageProps {
  onEscapeRoomSelect?: (escapeRoom: EscapeRoom) => void
  onAddToRoute?: (escapeRoom: EscapeRoom) => void
  selectedEscapeRooms?: string[]
  showAddButton?: boolean
  showMapView?: boolean
}

export const SearchPage: React.FC<SearchPageProps> = ({
  onEscapeRoomSelect,
  onAddToRoute,
  selectedEscapeRooms = [],
  showAddButton = true,
  showMapView = false,
}) => {
  const [layout, setLayout] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(true)
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')

  const handleEscapeRoomSelect = (escapeRoom: EscapeRoom) => {
    onEscapeRoomSelect?.(escapeRoom)
  }

  const handleAddToRoute = (escapeRoom: EscapeRoom) => {
    onAddToRoute?.(escapeRoom)
  }

  const handleLocationRequest = () => {
    // This could open a modal or redirect to a location selection page
    alert('Por favor, permite el acceso a tu ubicación o selecciona una ubicación manualmente.')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Buscar Escape Rooms
          </h1>
          
          {/* Search Bar */}
          <div className="mb-6">
            <SearchBar
              onEscapeRoomSelect={handleEscapeRoomSelect}
              placeholder="Buscar por nombre, ubicación o temática..."
              className="max-w-2xl"
              showSuggestions={true}
              maxSuggestions={5}
            />
          </div>

          {/* View Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* View Mode Toggle */}
              {showMapView && (
                <div className="flex items-center bg-white border border-gray-300 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`
                      flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
                      ${viewMode === 'list'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:text-gray-900'
                      }
                    `}
                  >
                    <List className="h-4 w-4" />
                    <span>Lista</span>
                  </button>
                  <button
                    onClick={() => setViewMode('map')}
                    className={`
                      flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
                      ${viewMode === 'map'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:text-gray-900'
                      }
                    `}
                  >
                    <Map className="h-4 w-4" />
                    <span>Mapa</span>
                  </button>
                </div>
              )}

              {/* Layout Toggle (only for list view) */}
              {viewMode === 'list' && (
                <div className="flex items-center bg-white border border-gray-300 rounded-lg p-1">
                  <button
                    onClick={() => setLayout('grid')}
                    className={`
                      p-2 rounded-md transition-colors
                      ${layout === 'grid'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:text-gray-900'
                      }
                    `}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setLayout('list')}
                    className={`
                      p-2 rounded-md transition-colors
                      ${layout === 'list'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:text-gray-900'
                      }
                    `}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-white border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="lg:w-80 flex-shrink-0">
              <div className="sticky top-8">
                <SearchFilters
                  onLocationRequest={handleLocationRequest}
                />
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {viewMode === 'list' ? (
              <SearchResults
                onEscapeRoomSelect={handleEscapeRoomSelect}
                onAddToRoute={handleAddToRoute}
                selectedEscapeRooms={selectedEscapeRooms}
                showAddButton={showAddButton}
                layout={layout}
              />
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <Map className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Vista de Mapa
                </h3>
                <p className="text-gray-600">
                  La vista de mapa se implementará en una tarea posterior.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
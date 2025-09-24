import React, { useState } from 'react'
import { X, Search, MapPin, Clock, Star, Users, Plus } from 'lucide-react'
import { Button, Card, Badge } from '@/shared/components'
import { EscapeRoom } from '@/shared/types'
import { useMultiDayPlannerStore } from '@/shared/stores/multiDayPlannerStore'
import { useSearchEscapeRooms } from '@/shared/hooks/useEscapeRooms'
import { useDebounce } from '@/shared/hooks/useDebounce'

interface EscapeRoomSelectorProps {
  dayIndex: number
  excludeEscapeRoomIds: string[]
  onClose: () => void
}

const EscapeRoomSelector: React.FC<EscapeRoomSelectorProps> = ({
  dayIndex,
  excludeEscapeRoomIds,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilters, setSelectedFilters] = useState({
    difficulty: '',
    theme: '',
    minRating: 0,
  })

  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const { addEscapeRoomToDay } = useMultiDayPlannerStore()

  // Fetch escape rooms with filters
  const { data: escapeRooms, isLoading, error } = useSearchEscapeRooms({
    search: debouncedSearchTerm,
    difficulty: selectedFilters.difficulty ? [selectedFilters.difficulty] : undefined,
    theme: selectedFilters.theme ? [selectedFilters.theme] : undefined,
    minRating: selectedFilters.minRating || undefined,
  })

  // Filter out already selected escape rooms
  const availableEscapeRooms = escapeRooms?.filter(
    room => !excludeEscapeRoomIds.includes(room.id)
  ) || []

  const handleAddEscapeRoom = (escapeRoom: EscapeRoom) => {
    addEscapeRoomToDay(dayIndex, escapeRoom)
    onClose()
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins}m`
    if (mins === 0) return `${hours}h`
    return `${hours}h ${mins}m`
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Agregar Escape Room - Día {dayIndex + 1}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Selecciona un escape room para agregar a este día
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b bg-gray-50">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar escape rooms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <select
                value={selectedFilters.difficulty}
                onChange={(e) => setSelectedFilters(prev => ({ ...prev, difficulty: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Todas las dificultades</option>
                <option value="easy">Fácil</option>
                <option value="medium">Medio</option>
                <option value="hard">Difícil</option>
              </select>

              <select
                value={selectedFilters.theme}
                onChange={(e) => setSelectedFilters(prev => ({ ...prev, theme: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Todos los temas</option>
                <option value="horror">Terror</option>
                <option value="mystery">Misterio</option>
                <option value="adventure">Aventura</option>
                <option value="sci-fi">Ciencia Ficción</option>
                <option value="fantasy">Fantasía</option>
              </select>

              <select
                value={selectedFilters.minRating}
                onChange={(e) => setSelectedFilters(prev => ({ ...prev, minRating: Number(e.target.value) }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value={0}>Cualquier calificación</option>
                <option value={3}>3+ estrellas</option>
                <option value={4}>4+ estrellas</option>
                <option value={4.5}>4.5+ estrellas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <span className="ml-3 text-gray-600">Cargando escape rooms...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">Error al cargar escape rooms</p>
              <Button variant="outline" size="sm" className="mt-2">
                Reintentar
              </Button>
            </div>
          ) : availableEscapeRooms.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No se encontraron escape rooms
              </h3>
              <p className="text-gray-600">
                {excludeEscapeRoomIds.length > 0 
                  ? 'Todos los escape rooms disponibles ya están en tu plan'
                  : 'Intenta ajustar los filtros de búsqueda'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableEscapeRooms.map((escapeRoom) => (
                <Card key={escapeRoom.id} hover className="transition-all duration-200">
                  <Card.Content>
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {escapeRoom.name}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {escapeRoom.description}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleAddEscapeRoom(escapeRoom)}
                          className="ml-2 flex-shrink-0"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Agregar
                        </Button>
                      </div>

                      {/* Details */}
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="truncate">{escapeRoom.address}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            <span>{formatTime(escapeRoom.duration)}</span>
                          </div>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 mr-1 text-yellow-500" />
                            <span>{escapeRoom.rating}</span>
                          </div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            <span>{escapeRoom.minPlayers}-{escapeRoom.maxPlayers}</span>
                          </div>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2">
                        <Badge className={getDifficultyColor(escapeRoom.difficulty)}>
                          {escapeRoom.difficulty}
                        </Badge>
                        <Badge variant="outline">
                          {escapeRoom.theme}
                        </Badge>
                        <Badge variant="outline">
                          {escapeRoom.priceRange}
                        </Badge>
                      </div>
                    </div>
                  </Card.Content>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-6 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  )
}

export default EscapeRoomSelector
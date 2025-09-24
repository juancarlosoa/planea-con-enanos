import { MapPin, Plus, Clock, Route, Settings } from 'lucide-react'
import { useState } from 'react'
import { Button, Input, Card, LoadingSpinner } from '@/shared/components'
import { MapComponent } from '@/features/maps'
import { useEscapeRooms } from '@/features/escape-rooms/hooks'
import { usePlanner } from '@/shared/hooks/usePlanner'
import { useOptimizedRoute } from '@/shared/stores/plannerStore'
import { EscapeRoom } from '@/shared/types'
import { SelectedEscapeRooms, RouteSummary } from './index'
import { RouteOptimizer } from './RouteOptimizer'
import { RouteInstructions } from './RouteInstructions'

const PlannerPage = () => {
  const [startLocation, setStartLocation] = useState('')
  const [maxDuration, setMaxDuration] = useState('6')
  const [selectedEscapeRoom, setSelectedEscapeRoom] = useState<EscapeRoom | null>(null)
  const [showOptimizer, setShowOptimizer] = useState(false)

  // Fetch escape rooms data
  const { data: escapeRooms = [], isLoading, error } = useEscapeRooms()

  // Use the planner store
  const {
    selectedEscapeRooms,
    routePreview,
    isCalculatingRoute,
    canCreateRoute,
    addEscapeRoom,
    removeEscapeRoom,
    reorderEscapeRooms,
    updateRoutePreview,
    saveCurrentSelectionAsRoute,
    isDirty,
  } = usePlanner()

  // Get optimized route from store
  const optimizedRoute = useOptimizedRoute()

  const handleGenerateRoute = () => {
    if (canCreateRoute) {
      const route = saveCurrentSelectionAsRoute()
      if (route) {
        console.log('Generated route:', route)
        // TODO: Navigate to route details or show success message
      }
    }
  }

  const handleEscapeRoomSelect = (escapeRoom: EscapeRoom) => {
    setSelectedEscapeRoom(escapeRoom)
  }

  const handleEscapeRoomToggle = (escapeRoom: EscapeRoom) => {
    const isSelected = selectedEscapeRooms.some(room => room.id === escapeRoom.id)

    if (isSelected) {
      removeEscapeRoom(escapeRoom.id)
      if (selectedEscapeRoom?.id === escapeRoom.id) {
        setSelectedEscapeRoom(null)
      }
    } else {
      addEscapeRoom(escapeRoom)
      setSelectedEscapeRoom(escapeRoom)
    }

    // Update route preview after changes
    setTimeout(() => updateRoutePreview(), 100)
  }

  const handleEscapeRoomDeselect = () => {
    setSelectedEscapeRoom(null)
  }

  const handleRemoveEscapeRoom = (escapeRoomId: string) => {
    removeEscapeRoom(escapeRoomId)
    if (selectedEscapeRoom?.id === escapeRoomId) {
      setSelectedEscapeRoom(null)
    }

    // Update route preview after removing
    setTimeout(() => updateRoutePreview(), 100)
  }

  const handleReorderEscapeRooms = (fromIndex: number, toIndex: number) => {
    reorderEscapeRooms(fromIndex, toIndex)

    // Update route preview after reordering
    setTimeout(() => updateRoutePreview(), 100)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Planificador de Rutas
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl">
          Crea rutas optimizadas para visitar múltiples escape rooms y planifica aventuras perfectas
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Panel - Route Builder */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <Card.Header>
              <Card.Title className="flex items-center">
                <Route className="h-5 w-5 mr-2 text-primary-600" />
                Construir Ruta
              </Card.Title>
            </Card.Header>

            <Card.Content className="space-y-6">
              <Input
                label="Punto de Inicio"
                placeholder="Ingresa tu ubicación de inicio"
                value={startLocation}
                onChange={(e) => setStartLocation(e.target.value)}
                leftIcon={<MapPin className="h-4 w-4" />}
              />

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Ruta Planificada
                  </label>
                  {isDirty && (
                    <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                      Cambios sin guardar
                    </span>
                  )}
                </div>
                <SelectedEscapeRooms
                  escapeRooms={selectedEscapeRooms}
                  onRemove={handleRemoveEscapeRoom}
                  onReorder={handleReorderEscapeRooms}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferencias de Ruta
                </label>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>Duración máxima por día:</span>
                    </div>
                    <select
                      className="input"
                      value={maxDuration}
                      onChange={(e) => setMaxDuration(e.target.value)}
                    >
                      <option value="4">4 horas</option>
                      <option value="6">6 horas</option>
                      <option value="8">8 horas</option>
                      <option value="full">Todo el día</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <Settings className="h-4 w-4 mr-2" />
                      <span>Optimizar para:</span>
                    </div>
                    <select className="input">
                      <option value="time">Menor tiempo de viaje</option>
                      <option value="distance">Menor distancia</option>
                      <option value="cost">Menor costo</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => setShowOptimizer(!showOptimizer)}
                  className="w-full"
                  variant={showOptimizer ? "secondary" : "primary"}
                  size="lg"
                  disabled={selectedEscapeRooms.length < 2}
                >
                  <Route className="h-4 w-4 mr-2" />
                  {showOptimizer ? 'Ocultar Optimizador' : 'Optimizar Ruta'}
                </Button>

                <Button
                  onClick={handleGenerateRoute}
                  className="w-full"
                  size="lg"
                  disabled={!canCreateRoute || isCalculatingRoute}
                >
                  {isCalculatingRoute ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Calculando...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Guardar Ruta
                    </>
                  )}
                </Button>
              </div>
            </Card.Content>
          </Card>

          {/* Route Optimizer */}
          {showOptimizer && selectedEscapeRooms.length >= 2 && (
            <RouteOptimizer
              escapeRooms={selectedEscapeRooms}
              onRouteOptimized={(route) => {
                console.log('Route optimized:', route)
              }}
            />
          )}

          {/* Route Instructions */}
          {optimizedRoute && optimizedRoute.segments.length > 0 && (
            <RouteInstructions
              routeSegments={optimizedRoute.segments}
              showDetails={true}
            />
          )}

          {/* Route Summary Card */}
          <RouteSummary
            escapeRooms={selectedEscapeRooms}
            isCalculating={isCalculatingRoute}
            routePreview={routePreview}
          />
        </div>

        {/* Right Panel - Map */}
        <div className="lg:col-span-2">
          <Card padding="none" className="h-96 lg:h-full min-h-[500px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <LoadingSpinner size="lg" />
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
                <div className="text-center text-gray-500">
                  <MapPin className="h-16 w-16 mx-auto mb-4 text-red-400" />
                  <p className="text-xl font-medium mb-2 text-red-600">Error al cargar datos</p>
                  <p className="text-sm text-gray-400 max-w-sm">
                    No se pudieron cargar los escape rooms. Inténtalo de nuevo.
                  </p>
                </div>
              </div>
            ) : (
              <MapComponent
                escapeRooms={escapeRooms}
                selectedEscapeRoom={selectedEscapeRoom}
                selectedEscapeRooms={selectedEscapeRooms}
                onEscapeRoomSelect={handleEscapeRoomSelect}
                onEscapeRoomToggle={handleEscapeRoomToggle}
                onEscapeRoomDeselect={handleEscapeRoomDeselect}
                showRoute={selectedEscapeRooms.length > 1}
                showOptimizedRoute={!!optimizedRoute}
                className="h-full w-full"
              />
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

export default PlannerPage
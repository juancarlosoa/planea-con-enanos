import React, { useState, useEffect } from 'react'
import { Calendar, Clock, MapPin, AlertTriangle, CheckCircle, Plus, Settings, List, Map } from 'lucide-react'
import { Button, Card, Badge } from '@/shared/components'
import { useMultiDayPlannerStore, useCurrentPlan, useSelectedDayIndex, usePlanSuggestions } from '@/shared/stores/multiDayPlannerStore'
import MapComponent from '@/features/maps/components/MapComponent'
import DayNavigator from './DayNavigator'
import DayPlanner from './DayPlanner'
import PlanSummary from './PlanSummary'
import PlanSettings from './PlanSettings'
import SuggestionPanel from './SuggestionPanel'

interface MultiDayPlannerProps {
  initialPlan?: any // Plan from backend
}

const MultiDayPlanner: React.FC<MultiDayPlannerProps> = ({ initialPlan }) => {
  const [showSettings, setShowSettings] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  
  const currentPlan = useCurrentPlan()
  const selectedDayIndex = useSelectedDayIndex()
  const suggestions = usePlanSuggestions()
  
  const {
    createNewPlan,
    loadPlan,
    selectDay,
    generateSuggestions,
  } = useMultiDayPlannerStore()

  // Load initial plan if provided
  useEffect(() => {
    if (initialPlan && !currentPlan) {
      loadPlan(initialPlan)
    }
  }, [initialPlan, currentPlan, loadPlan])

  // Generate suggestions when plan changes
  useEffect(() => {
    if (currentPlan) {
      generateSuggestions()
    }
  }, [currentPlan, generateSuggestions])

  const handleCreateNewPlan = () => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    createNewPlan(
      'Mi Nuevo Plan',
      'Plan de escape rooms multi-día',
      today.toISOString().split('T')[0],
      tomorrow.toISOString().split('T')[0]
    )
  }

  const getTotalDays = () => {
    if (!currentPlan) return 0
    return currentPlan.dailyRoutes.length
  }

  const getTotalEscapeRooms = () => {
    if (!currentPlan) return 0
    return currentPlan.dailyRoutes.reduce((total, route) => total + route.stops.length, 0)
  }

  const getTotalTime = () => {
    if (!currentPlan) return 0
    // This would be calculated by the store
    return currentPlan.dailyRoutes.reduce((total, route) => total + route.estimatedTotalTime, 0)
  }

  const getTotalCost = () => {
    if (!currentPlan) return 0
    return currentPlan.dailyRoutes.reduce((total, route) => total + route.estimatedCost, 0)
  }

  const getValidationStatus = () => {
    if (!currentPlan) return { isValid: true, issues: 0 }
    
    let issues = 0
    currentPlan.dailyRoutes.forEach((_, index) => {
      const store = useMultiDayPlannerStore.getState()
      if (!store.validateDayTime(index)) {
        issues++
      }
    })
    
    return { isValid: issues === 0, issues }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (!currentPlan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
        <div className="text-center">
          <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Crear Plan Multi-día
          </h3>
          <p className="text-gray-600 mb-6 max-w-md">
            Planifica tu aventura de escape rooms a lo largo de varios días. 
            Organiza rutas optimizadas para cada día de tu viaje.
          </p>
        </div>
        <Button onClick={handleCreateNewPlan} size="lg">
          <Plus className="h-4 w-4 mr-2" />
          Crear Nuevo Plan
        </Button>
      </div>
    )
  }

  const validationStatus = getValidationStatus()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            {currentPlan.name}
          </h1>
          {currentPlan.description && (
            <p className="text-gray-600 mb-4">{currentPlan.description}</p>
          )}
          
          {/* Plan Stats */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{getTotalDays()} días</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{getTotalEscapeRooms()} escape rooms</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>{Math.round(getTotalTime() / 60)} horas</span>
            </div>
            <div className="flex items-center">
              <span>€{getTotalCost().toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Validation Status */}
          {validationStatus.isValid ? (
            <Badge variant="success" className="flex items-center">
              <CheckCircle className="h-3 w-3 mr-1" />
              Plan Válido
            </Badge>
          ) : (
            <Badge variant="warning" className="flex items-center">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {validationStatus.issues} Problema{validationStatus.issues !== 1 ? 's' : ''}
            </Badge>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Configurar
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSummary(true)}
          >
            Ver Resumen
          </Button>
        </div>
      </div>

      {/* Suggestions Panel */}
      {suggestions.length > 0 && (
        <SuggestionPanel suggestions={suggestions} />
      )}

      {/* Main Content */}
      <div className="space-y-6">
        {/* Day Navigator */}
        <Card>
          <Card.Header>
            <Card.Title>Navegación por Días</Card.Title>
          </Card.Header>
          <Card.Content>
            <DayNavigator
              dailyRoutes={currentPlan.dailyRoutes}
              selectedDayIndex={selectedDayIndex}
              onSelectDay={selectDay}
            />
          </Card.Content>
        </Card>

        {/* View Toggle and Content */}
        <Card>
          <Card.Header>
            <div className="flex items-center justify-between">
              <Card.Title>Día {selectedDayIndex + 1} - {formatDate(currentPlan.dailyRoutes[selectedDayIndex]?.date)}</Card.Title>
              
              {/* View Toggle Buttons */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`
                    flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200
                    ${viewMode === 'list' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                    }
                  `}
                >
                  <List className="h-4 w-4 mr-2" />
                  Lista
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`
                    flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200
                    ${viewMode === 'map' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                    }
                  `}
                >
                  <Map className="h-4 w-4 mr-2" />
                  Mapa
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {viewMode === 'list' 
                ? 'Gestiona los escape rooms de este día' 
                : 'Visualización de la ruta en el mapa'
              }
            </p>
          </Card.Header>
          
          <Card.Content className={viewMode === 'map' ? 'p-0' : ''}>
            {viewMode === 'list' ? (
              <div className="space-y-4">
                {/* Day Stats */}
                <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{currentPlan.dailyRoutes[selectedDayIndex]?.stops.length || 0} paradas</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{Math.round(getTotalTime() / 60)} horas estimadas</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span>€{currentPlan.dailyRoutes[selectedDayIndex]?.estimatedCost.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
                
                <DayPlanner
                  dayIndex={selectedDayIndex}
                  dailyRoute={currentPlan.dailyRoutes[selectedDayIndex]}
                  showHeader={false}
                />
              </div>
            ) : (
              <div className="h-[600px]">
                <MapComponent
                  escapeRooms={currentPlan.dailyRoutes[selectedDayIndex]?.stops?.map(stop => stop.escapeRoom).filter(Boolean) || []}
                  selectedRoute={null}
                  onEscapeRoomSelect={() => {}}
                />
              </div>
            )}
          </Card.Content>
        </Card>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <PlanSettings
          plan={currentPlan}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Summary Modal */}
      {showSummary && (
        <PlanSummary
          plan={currentPlan}
          onClose={() => setShowSummary(false)}
        />
      )}
    </div>
  )
}

export default MultiDayPlanner
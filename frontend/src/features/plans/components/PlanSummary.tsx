import React from 'react'
import { X, Calendar, Clock, MapPin, Euro, Star, Download, Share2 } from 'lucide-react'
import { Button, Card, Badge } from '@/shared/components'
import { Plan } from '@/shared/types'
import { useMultiDayPlannerStore } from '@/shared/stores/multiDayPlannerStore'

interface PlanSummaryProps {
  plan: Plan
  onClose: () => void
}

const PlanSummary: React.FC<PlanSummaryProps> = ({ plan, onClose }) => {
  const { getTotalTimeForDay, validateDayTime } = useMultiDayPlannerStore()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
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

  const getTotalStats = () => {
    const totalEscapeRooms = plan.dailyRoutes.reduce((total, route) => total + route.stops.length, 0)
    const totalTime = plan.dailyRoutes.reduce((total, _, index) => total + getTotalTimeForDay(index), 0)
    const totalCost = plan.dailyRoutes.reduce((total, route) => total + route.estimatedCost, 0)
    const validDays = plan.dailyRoutes.filter((_, index) => validateDayTime(index)).length
    
    return { totalEscapeRooms, totalTime, totalCost, validDays }
  }

  const stats = getTotalStats()

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Exporting plan:', plan.id)
  }

  const handleShare = () => {
    // TODO: Implement share functionality
    console.log('Sharing plan:', plan.id)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {plan.name}
            </h2>
            {plan.description && (
              <p className="text-gray-600 mt-1">{plan.description}</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Compartir
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="p-6 border-b bg-gray-50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {plan.dailyRoutes.length}
              </div>
              <div className="text-sm text-gray-600">Días</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {stats.totalEscapeRooms}
              </div>
              <div className="text-sm text-gray-600">Escape Rooms</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {Math.round(stats.totalTime / 60)}h
              </div>
              <div className="text-sm text-gray-600">Tiempo Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                €{stats.totalCost.toFixed(0)}
              </div>
              <div className="text-sm text-gray-600">Costo Estimado</div>
            </div>
          </div>

          {/* Validation Status */}
          <div className="mt-4 flex justify-center">
            {stats.validDays === plan.dailyRoutes.length ? (
              <Badge variant="success" className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                Plan Válido - Todos los días dentro del límite de tiempo
              </Badge>
            ) : (
              <Badge variant="warning" className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {plan.dailyRoutes.length - stats.validDays} día{plan.dailyRoutes.length - stats.validDays !== 1 ? 's' : ''} excede{plan.dailyRoutes.length - stats.validDays === 1 ? '' : 'n'} el límite de tiempo
              </Badge>
            )}
          </div>
        </div>

        {/* Daily Breakdown */}
        <div className="flex-1 overflow-y-auto p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Itinerario Detallado
          </h3>

          <div className="space-y-6">
            {plan.dailyRoutes.map((dailyRoute, dayIndex) => {
              const dayTime = getTotalTimeForDay(dayIndex)
              const isValid = validateDayTime(dayIndex)
              
              return (
                <Card key={dailyRoute.id} className={`${!isValid ? 'border-red-200' : ''}`}>
                  <Card.Header>
                    <div className="flex items-center justify-between">
                      <div>
                        <Card.Title className="text-lg">
                          Día {dayIndex + 1} - {formatDate(dailyRoute.date)}
                        </Card.Title>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span>{dailyRoute.stops.length} paradas</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{formatTime(dayTime)}</span>
                          </div>
                          <div className="flex items-center">
                            <Euro className="h-4 w-4 mr-1" />
                            <span>{dailyRoute.estimatedCost.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                      
                      {!isValid && (
                        <Badge variant="error">
                          Excede límite de tiempo
                        </Badge>
                      )}
                    </div>
                  </Card.Header>

                  <Card.Content>
                    {dailyRoute.stops.length === 0 ? (
                      <div className="text-center text-gray-500 py-4">
                        No hay escape rooms planificados para este día
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {dailyRoute.stops.map((stop, index) => {
                          const escapeRoom = stop.escapeRoom
                          if (!escapeRoom) return null

                          return (
                            <div key={stop.id} className="flex items-start space-x-4 p-3 bg-gray-50 rounded-lg">
                              <div className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-semibold">
                                {index + 1}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h4 className="font-medium text-gray-900">
                                      {escapeRoom.name}
                                    </h4>
                                    <p className="text-sm text-gray-600 truncate">
                                      {escapeRoom.address}
                                    </p>
                                  </div>
                                  
                                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <div className="flex items-center">
                                      <Clock className="h-3 w-3 mr-1" />
                                      <span>{formatTime(escapeRoom.duration)}</span>
                                    </div>
                                    <div className="flex items-center">
                                      <Star className="h-3 w-3 mr-1 text-yellow-500" />
                                      <span>{escapeRoom.rating}</span>
                                    </div>
                                  </div>
                                </div>
                                
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
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </Card.Content>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-6 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  )
}

export default PlanSummary
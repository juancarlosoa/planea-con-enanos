import React, { useState } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { 
  Clock, 
  MapPin, 
  Star, 
  Users, 
  Euro, 
  GripVertical, 
  X, 
  Plus,
  ArrowRight,
  AlertTriangle,

} from 'lucide-react'
import { Button, Card, Badge } from '@/shared/components'
import { DailyRoute } from '@/shared/types'
import { useMultiDayPlannerStore } from '@/shared/stores/multiDayPlannerStore'
import EscapeRoomSelector from './EscapeRoomSelector'

interface DayPlannerProps {
  dayIndex: number
  dailyRoute: DailyRoute
  showHeader?: boolean
}

const DayPlanner: React.FC<DayPlannerProps> = ({ dayIndex, dailyRoute, showHeader = true }) => {
  const [showEscapeRoomSelector, setShowEscapeRoomSelector] = useState(false)
  
  const {
    removeEscapeRoomFromDay,
    reorderEscapeRoomsInDay,
    validateDayTime,
    getTotalTimeForDay,
    getExceededTimeForDay,
    timeLimit,
  } = useMultiDayPlannerStore()

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



  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return
    
    const sourceIndex = result.source.index
    const destinationIndex = result.destination.index
    
    if (sourceIndex === destinationIndex) return
    
    reorderEscapeRoomsInDay(dayIndex, sourceIndex, destinationIndex)
  }

  const handleRemoveEscapeRoom = (escapeRoomId: string) => {
    removeEscapeRoomFromDay(dayIndex, escapeRoomId)
  }

  const isValid = validateDayTime(dayIndex)
  const totalTime = getTotalTimeForDay(dayIndex)
  const exceededTime = getExceededTimeForDay(dayIndex)
  const remainingTime = timeLimit - totalTime

  return (
    <div className="space-y-6">
      {/* Day Header */}
      {showHeader && <Card>
        <Card.Header>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <Card.Title className="text-xl">
                Día {dayIndex + 1} - {formatDate(dailyRoute.date)}
              </Card.Title>
              <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{dailyRoute.stops.length} paradas</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{formatTime(totalTime)}</span>
                </div>
                <div className="flex items-center">
                  <Euro className="h-4 w-4 mr-1" />
                  <span>{dailyRoute.estimatedCost.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Time Status */}
              {!isValid ? (
                <Badge variant="error" className="flex items-center">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Excede {formatTime(exceededTime)}
                </Badge>
              ) : remainingTime < 60 ? (
                <Badge variant="warning" className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  Quedan {formatTime(remainingTime)}
                </Badge>
              ) : (
                <Badge variant="success" className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatTime(remainingTime)} disponibles
                </Badge>
              )}
              
              <Button
                onClick={() => setShowEscapeRoomSelector(true)}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Escape Room
              </Button>
            </div>
          </div>
        </Card.Header>
        
        {/* Time Progress Bar */}
        <Card.Content>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Tiempo utilizado</span>
              <span>{formatTime(totalTime)} / {formatTime(timeLimit)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  !isValid 
                    ? 'bg-red-500' 
                    : remainingTime < 60
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                }`}
                style={{
                  width: `${Math.min(100, (totalTime / timeLimit) * 100)}%`
                }}
              />
            </div>
          </div>
        </Card.Content>
      </Card>}

      {/* Escape Rooms List */}
      {dailyRoute.stops.length === 0 ? (
        <Card className="text-center" padding="lg">
          <MapPin className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No hay escape rooms planificados
          </h3>
          <p className="text-gray-600 mb-6">
            Agrega escape rooms a este día para comenzar a planificar tu ruta
          </p>
          <Button onClick={() => setShowEscapeRoomSelector(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Agregar Primer Escape Room
          </Button>
        </Card>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId={`day-${dayIndex}`}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`space-y-4 ${
                  snapshot.isDraggingOver ? 'bg-blue-50 rounded-lg p-2' : ''
                }`}
              >
                {dailyRoute.stops.map((stop, index) => (
                  <Draggable
                    key={stop.id}
                    draggableId={stop.id}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`${
                          snapshot.isDragging ? 'rotate-2 shadow-lg' : ''
                        }`}
                      >
                        <EscapeRoomCard
                          stop={stop}
                          index={index}
                          isLast={index === dailyRoute.stops.length - 1}
                          onRemove={() => handleRemoveEscapeRoom(stop.escapeRoomId)}
                          dragHandleProps={provided.dragHandleProps}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {/* Escape Room Selector Modal */}
      {showEscapeRoomSelector && (
        <EscapeRoomSelector
          dayIndex={dayIndex}
          excludeEscapeRoomIds={dailyRoute.stops.map(stop => stop.escapeRoomId)}
          onClose={() => setShowEscapeRoomSelector(false)}
        />
      )}
    </div>
  )
}

interface EscapeRoomCardProps {
  stop: any // RouteStop with escapeRoom
  index: number
  isLast: boolean
  onRemove: () => void
  dragHandleProps: any
}

const EscapeRoomCard: React.FC<EscapeRoomCardProps> = ({
  stop,
  index,
  isLast,
  onRemove,
  dragHandleProps,
}) => {
  const escapeRoom = stop.escapeRoom
  
  if (!escapeRoom) {
    return (
      <Card className="border-dashed border-gray-300">
        <Card.Content>
          <div className="text-center text-gray-500 py-4">
            Escape room no encontrado
          </div>
        </Card.Content>
      </Card>
    )
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
    <div className="relative">
      <Card hover className="transition-all duration-200">
        <Card.Content>
          <div className="flex items-start gap-4">
            {/* Drag Handle */}
            <div
              {...dragHandleProps}
              className="flex-shrink-0 mt-2 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
            >
              <GripVertical className="h-5 w-5" />
            </div>

            {/* Order Number */}
            <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-semibold">
              {index + 1}
            </div>

            {/* Escape Room Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {escapeRoom.name}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {escapeRoom.description}
                  </p>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRemove}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Details */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="truncate">{escapeRoom.address}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
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

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-3">
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

              {/* Timing Info */}
              {stop.estimatedArrivalTime > 0 && (
                <div className="text-xs text-gray-500 bg-gray-50 rounded p-2">
                  <div className="flex items-center justify-between">
                    <span>Llegada estimada: {Math.floor(stop.estimatedArrivalTime / 60)}:{(stop.estimatedArrivalTime % 60).toString().padStart(2, '0')}</span>
                    {stop.estimatedTravelTime > 0 && (
                      <span>Viaje al siguiente: {formatTime(stop.estimatedTravelTime)}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* Travel Arrow */}
      {!isLast && (
        <div className="flex justify-center py-2">
          <div className="flex items-center text-gray-400">
            <ArrowRight className="h-4 w-4" />
            {stop.estimatedTravelTime > 0 && (
              <span className="ml-2 text-xs">
                {formatTime(stop.estimatedTravelTime)}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default DayPlanner
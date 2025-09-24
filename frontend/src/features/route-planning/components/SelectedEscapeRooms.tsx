import React, { useState } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { GripVertical, X, Clock, Users, MapPin, Star } from 'lucide-react'
import { EscapeRoom } from '@/shared/types'
import { Button } from '@/shared/components'

interface SelectedEscapeRoomsProps {
  escapeRooms: EscapeRoom[]
  onRemove: (roomId: string) => void
  onReorder: (fromIndex: number, toIndex: number) => void
  className?: string
}

const SelectedEscapeRooms: React.FC<SelectedEscapeRoomsProps> = ({
  escapeRooms,
  onRemove,
  onReorder,
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragEnd = (result: DropResult) => {
    setIsDragging(false)
    
    if (!result.destination) {
      return
    }

    const sourceIndex = result.source.index
    const destinationIndex = result.destination.index

    if (sourceIndex !== destinationIndex) {
      onReorder(sourceIndex, destinationIndex)
    }
  }

  const handleDragStart = () => {
    setIsDragging(true)
  }

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'text-green-600 bg-green-50'
      case 'medium':
        return 'text-yellow-600 bg-yellow-50'
      case 'hard':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const formatPrice = (priceRange: string): string => {
    // Extract first price from range like "25-35€"
    const match = priceRange.match(/(\d+)/)
    return match ? `€${match[1]}` : priceRange
  }

  if (escapeRooms.length === 0) {
    return (
      <div className={`border-2 border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-500 ${className}`}>
        <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm mb-2">No hay escape rooms seleccionados</p>
        <p className="text-xs text-gray-400">
          Haz clic en los marcadores del mapa para agregar escape rooms a tu ruta
        </p>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700">
          Escape Rooms Seleccionados ({escapeRooms.length})
        </h3>
        <div className="text-xs text-gray-500">
          Arrastra para reordenar
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
        <Droppable droppableId="selected-escape-rooms">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={`space-y-2 max-h-80 overflow-y-auto ${
                snapshot.isDraggingOver ? 'bg-blue-50' : ''
              } ${isDragging ? 'select-none' : ''}`}
            >
              {escapeRooms.map((room, index) => (
                <Draggable key={room.id} draggableId={room.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`bg-white border rounded-lg p-3 transition-all duration-200 ${
                        snapshot.isDragging
                          ? 'shadow-lg border-blue-300 bg-blue-50'
                          : 'shadow-sm border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Drag handle */}
                        <div
                          {...provided.dragHandleProps}
                          className="flex-shrink-0 mt-1 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
                        >
                          <GripVertical className="h-4 w-4" />
                        </div>

                        {/* Route order number */}
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>

                        {/* Escape room info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-medium text-gray-900 text-sm truncate">
                              {room.name}
                            </h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onRemove(room.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 h-auto"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>

                          <p className="text-xs text-gray-500 truncate mb-2">
                            {room.address}
                          </p>

                          <div className="flex items-center gap-3 text-xs">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-gray-400" />
                              <span className="text-gray-600">{room.duration}min</span>
                            </div>

                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3 text-gray-400" />
                              <span className="text-gray-600">
                                {room.minPlayers}-{room.maxPlayers}
                              </span>
                            </div>

                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${getDifficultyColor(room.difficulty)}`}>
                              {room.difficulty.charAt(0).toUpperCase() + room.difficulty.slice(1)}
                            </span>

                            <span className="text-gray-600 font-medium">
                              {formatPrice(room.priceRange)}
                            </span>

                            {room.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 text-yellow-400 fill-current" />
                                <span className="text-gray-600">{room.rating}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  )
}

export default SelectedEscapeRooms
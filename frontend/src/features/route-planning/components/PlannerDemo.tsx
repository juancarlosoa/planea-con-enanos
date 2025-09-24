import React from 'react'
import { usePlanner } from '@/shared/hooks/usePlanner'
import { EscapeRoom } from '@/shared/types'

// Mock escape room data for testing
const mockEscapeRooms: EscapeRoom[] = [
  {
    id: '1',
    name: 'Mystery Mansion',
    description: 'A spooky adventure in an old mansion',
    address: 'Carrer de Balmes, 123, Barcelona',
    latitude: 41.3851,
    longitude: 2.1734,
    rating: 4.5,
    priceRange: '€25-35',
    duration: 60,
    difficulty: 'medium',
    theme: 'Horror',
    maxPlayers: 6,
    minPlayers: 2,
    imageUrl: 'https://example.com/mystery-mansion.jpg',
  },
  {
    id: '2',
    name: 'Space Station Alpha',
    description: 'Escape from a failing space station',
    address: 'Carrer de Provença, 456, Barcelona',
    latitude: 41.3917,
    longitude: 2.1649,
    rating: 4.8,
    priceRange: '€30-40',
    duration: 75,
    difficulty: 'hard',
    theme: 'Sci-Fi',
    maxPlayers: 8,
    minPlayers: 3,
    imageUrl: 'https://example.com/space-station.jpg',
  },
  {
    id: '3',
    name: 'Pirate Treasure',
    description: 'Find the hidden treasure on a pirate ship',
    address: 'Carrer de Aragó, 789, Barcelona',
    latitude: 41.3879,
    longitude: 2.1699,
    rating: 4.2,
    priceRange: '€20-30',
    duration: 50,
    difficulty: 'easy',
    theme: 'Adventure',
    maxPlayers: 5,
    minPlayers: 2,
    imageUrl: 'https://example.com/pirate-treasure.jpg',
  },
]

export const PlannerDemo: React.FC = () => {
  const {
    selectedEscapeRooms,
    routePreview,
    isCalculatingRoute,
    hasSelection,
    canCreateRoute,
    addEscapeRoom,
    removeEscapeRoom,
    clearSelectedEscapeRooms,
    reorderEscapeRooms,
    updateRoutePreview,
    saveCurrentSelectionAsRoute,
    currentRoute,
    isDirty,
  } = usePlanner()

  const handleAddRoom = (room: EscapeRoom) => {
    addEscapeRoom(room)
    // Manually update route preview after adding
    setTimeout(() => updateRoutePreview(), 100)
  }

  const handleRemoveRoom = (roomId: string) => {
    removeEscapeRoom(roomId)
    // Manually update route preview after removing
    setTimeout(() => updateRoutePreview(), 100)
  }

  const handleReorder = (fromIndex: number, toIndex: number) => {
    reorderEscapeRooms(fromIndex, toIndex)
    // Manually update route preview after reordering
    setTimeout(() => updateRoutePreview(), 100)
  }

  const handleSaveRoute = () => {
    const route = saveCurrentSelectionAsRoute()
    if (route) {
      alert(`Route "${route.name}" saved successfully!`)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Planner Store Demo</h1>
      
      {/* Available Escape Rooms */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Available Escape Rooms</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mockEscapeRooms.map((room) => (
            <div key={room.id} className="border rounded-lg p-4 bg-white shadow">
              <h3 className="font-semibold text-lg">{room.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{room.description}</p>
              <div className="flex justify-between items-center text-sm">
                <span className="text-blue-600">{room.priceRange}</span>
                <span className="text-gray-500">{room.duration} min</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className={`px-2 py-1 rounded text-xs ${
                  room.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                  room.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {room.difficulty}
                </span>
                <button
                  onClick={() => handleAddRoom(room)}
                  disabled={selectedEscapeRooms.some(r => r.id === room.id)}
                  className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {selectedEscapeRooms.some(r => r.id === room.id) ? 'Added' : 'Add'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Escape Rooms */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">
            Selected Escape Rooms ({selectedEscapeRooms.length})
          </h2>
          {hasSelection && (
            <button
              onClick={clearSelectedEscapeRooms}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Clear All
            </button>
          )}
        </div>
        
        {!hasSelection ? (
          <p className="text-gray-500 italic">No escape rooms selected</p>
        ) : (
          <div className="space-y-2">
            {selectedEscapeRooms.map((room, index) => (
              <div key={room.id} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                <div className="flex items-center space-x-3">
                  <span className="font-semibold text-gray-600">#{index + 1}</span>
                  <div>
                    <h4 className="font-medium">{room.name}</h4>
                    <p className="text-sm text-gray-600">{room.duration} min • {room.priceRange}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleReorder(index, Math.max(0, index - 1))}
                    disabled={index === 0}
                    className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => handleReorder(index, Math.min(selectedEscapeRooms.length - 1, index + 1))}
                    disabled={index === selectedEscapeRooms.length - 1}
                    className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => handleRemoveRoom(room.id)}
                    className="px-2 py-1 bg-red-200 text-red-700 rounded text-sm hover:bg-red-300"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Route Preview */}
      {hasSelection && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Route Preview</h2>
          {isCalculatingRoute ? (
            <div className="bg-blue-50 p-4 rounded">
              <p className="text-blue-700">Calculating route...</p>
            </div>
          ) : routePreview ? (
            <div className="bg-green-50 p-4 rounded">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-600">Total Time</p>
                  <p className="text-lg font-semibold text-green-700">
                    {Math.floor(routePreview.totalTime / 60)}h {routePreview.totalTime % 60}m
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Distance</p>
                  <p className="text-lg font-semibold text-green-700">
                    {routePreview.totalDistance.toFixed(1)} km
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Estimated Cost</p>
                  <p className="text-lg font-semibold text-green-700">
                    €{routePreview.estimatedCost.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Actions */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Actions</h2>
        <div className="flex space-x-4">
          <button
            onClick={handleSaveRoute}
            disabled={!canCreateRoute}
            className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Save as Route
          </button>
          <button
            onClick={updateRoutePreview}
            disabled={!hasSelection}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Update Preview
          </button>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {isDirty ? 'Unsaved changes' : 'All changes saved'}
            </span>
            <div className={`w-2 h-2 rounded-full ${isDirty ? 'bg-yellow-500' : 'bg-green-500'}`} />
          </div>
        </div>
      </div>

      {/* Current Route */}
      {currentRoute && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Current Route</h2>
          <div className="bg-blue-50 p-4 rounded">
            <h3 className="font-semibold text-lg">{currentRoute.name}</h3>
            <p className="text-sm text-gray-600 mb-2">{currentRoute.description}</p>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Escape Rooms:</span> {currentRoute.escapeRooms.length}
              </div>
              <div>
                <span className="font-medium">Duration:</span> {Math.floor(currentRoute.totalDuration / 60)}h {currentRoute.totalDuration % 60}m
              </div>
              <div>
                <span className="font-medium">Cost:</span> €{currentRoute.estimatedCost.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
import { Search, MapPin, Clock, Users, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input, Card } from '@/shared/components'
import { SearchBar } from './SearchBar'
import { SearchResults } from './SearchResults'
import { useEscapeRoomSearch } from '@/shared/hooks/useEscapeRoomSearch'
import { EscapeRoom } from '@/shared/types'

const HomePage = () => {
  const [showResults, setShowResults] = useState(false)
  const navigate = useNavigate()
  
  const { hasActiveFilters } = useEscapeRoomSearch()

  const handleEscapeRoomSelect = (escapeRoom: EscapeRoom) => {
    // TODO: Navigate to escape room details page or open modal
    console.log('Selected escape room:', escapeRoom)
  }

  const handleStartPlanning = () => {
    navigate('/planner')
  }

  const features = [
    {
      icon: <MapPin className="h-12 w-12 text-primary-600" />,
      title: "Mapa Interactivo",
      description: "Explora escape rooms en un mapa interactivo y visualiza tus rutas planificadas."
    },
    {
      icon: <Clock className="h-12 w-12 text-primary-600" />,
      title: "Planificación Inteligente",
      description: "Optimiza tus rutas con cálculos de tiempo de viaje y gestión de horarios."
    },
    {
      icon: <Users className="h-12 w-12 text-primary-600" />,
      title: "Comparte y Colabora",
      description: "Comparte tus planes con amigos y exporta itinerarios para tus aventuras."
    }
  ]

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="text-center section-padding">
        <div className="animate-slide-up">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Planifica tu{' '}
            <span className="text-gradient">Aventura Perfecta</span>
            {' '}de Escape Room
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Descubre escape rooms, crea rutas optimizadas y planifica aventuras de varios días 
            con nuestro planificador inteligente de rutas.
          </p>
        </div>

        {/* Search Section */}
        <Card className="max-w-2xl mx-auto" padding="lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Comenzar</h2>
          <div className="space-y-4">
            <SearchBar
              onEscapeRoomSelect={handleEscapeRoomSelect}
              placeholder="Buscar escape rooms por nombre, ubicación o temática..."
              showSuggestions={true}
              maxSuggestions={3}
            />
            <Button 
              onClick={handleStartPlanning}
              size="lg"
              className="w-full sm:w-auto sm:px-8"
            >
              Comenzar Planificación
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>

      {/* Search Results Section */}
      {hasActiveFilters && (
        <div className="max-w-7xl mx-auto">
          <SearchResults
            onEscapeRoomSelect={handleEscapeRoomSelect}
            showAddButton={false}
            layout="grid"
            className="mb-16"
          />
        </div>
      )}

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <Card 
            key={index}
            hover
            className={`text-center animate-slide-up`}
          >
            <div className="mb-4">
              {feature.icon}
            </div>
            <Card.Title className="mb-3">
              {feature.title}
            </Card.Title>
            <p className="text-gray-600">
              {feature.description}
            </p>
          </Card>
        ))}
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-8 md:p-12 text-center text-white">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          ¿Listo para tu próxima aventura?
        </h2>
        <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
          Únete a miles de aventureros que ya han planificado sus rutas perfectas de escape rooms.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            variant="secondary"
            size="lg"
            onClick={() => navigate('/planner')}
            className="bg-white text-primary-600 hover:bg-gray-50"
          >
            Crear Mi Primera Ruta
          </Button>
          <Button 
            variant="outline"
            size="lg"
            onClick={() => navigate('/plans')}
            className="border-white text-white hover:bg-white hover:text-primary-600"
          >
            Ver Planes Existentes
          </Button>
        </div>
      </div>
    </div>
  )
}

export default HomePage
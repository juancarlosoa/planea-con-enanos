import { Calendar, MapPin, Clock, Users, Share2, Edit, Trash2, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Button, Card, Badge } from '@/shared/components'
import MultiDayPlanner from './MultiDayPlanner'

const PlansPage = () => {
  const navigate = useNavigate()
  const [showPlanner, setShowPlanner] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)

  // Mock data for demonstration
  const mockPlans = [
    {
      id: 1,
      name: "Aventura de Fin de Semana",
      date: "2024-01-15",
      escapeRooms: 4,
      duration: "6 horas",
      participants: 6,
      status: "upcoming"
    },
    {
      id: 2,
      name: "Tour de Escape Rooms Centro",
      date: "2024-01-08",
      escapeRooms: 3,
      duration: "4 horas",
      participants: 4,
      status: "completed"
    }
  ]

  const getStatusBadge = (status: string) => {
    if (status === 'upcoming') {
      return <Badge variant="primary">Próximo</Badge>
    }
    return <Badge variant="success">Completado</Badge>
  }

  const handleCreatePlan = () => {
    setSelectedPlan(null)
    setShowPlanner(true)
  }

  const handleEditPlan = (planId: number) => {
    // TODO: Load plan data and set it
    setSelectedPlan(null) // Would be the loaded plan
    setShowPlanner(true)
  }

  const handleSharePlan = (planId: number) => {
    console.log('Sharing plan:', planId)
    // TODO: Implement share functionality
  }

  const handleDeletePlan = (planId: number) => {
    console.log('Deleting plan:', planId)
    // TODO: Implement delete functionality
  }

  const handleViewDetails = (planId: number) => {
    console.log('Viewing plan details:', planId)
    // TODO: Navigate to plan details
  }

  // Show multi-day planner if requested
  if (showPlanner) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => setShowPlanner(false)}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Volver a Mis Planes
          </Button>
        </div>
        <MultiDayPlanner initialPlan={selectedPlan} />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Mis Planes
          </h1>
          <p className="text-lg text-gray-600">
            Gestiona tus aventuras de escape room planificadas
          </p>
        </div>
        <Button onClick={handleCreatePlan} size="lg">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Plan
        </Button>
      </div>

      {mockPlans.length === 0 ? (
        /* Empty State */
        <Card className="text-center" padding="lg">
          <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No tienes planes aún
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Comienza creando tu primera ruta de escape rooms y planifica aventuras increíbles
          </p>
          <Button onClick={handleCreatePlan} size="lg">
            <Plus className="h-4 w-4 mr-2" />
            Crear Mi Primer Plan
          </Button>
        </Card>
      ) : (
        /* Plans Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockPlans.map((plan) => (
            <Card key={plan.id} hover>
              <Card.Header>
                <div className="flex justify-between items-start mb-4">
                  <Card.Title className="line-clamp-2 pr-2">
                    {plan.name}
                  </Card.Title>
                  {getStatusBadge(plan.status)}
                </div>
              </Card.Header>

              <Card.Content>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>
                      {new Date(plan.date).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{plan.escapeRooms} escape rooms</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{plan.duration}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{plan.participants} participantes</span>
                  </div>
                </div>
              </Card.Content>

              <Card.Footer>
                <div className="flex justify-between items-center">
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditPlan(plan.id)}
                      className="p-2"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSharePlan(plan.id)}
                      className="p-2"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePlan(plan.id)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewDetails(plan.id)}
                    className="text-primary-600 hover:text-primary-700"
                  >
                    Ver Detalles
                  </Button>
                </div>
              </Card.Footer>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default PlansPage
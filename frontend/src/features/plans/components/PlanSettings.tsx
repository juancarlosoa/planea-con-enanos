import React, { useState } from 'react'
import { X, Clock, Calendar, Save } from 'lucide-react'
import { Button, Card } from '@/shared/components'
import { Plan } from '@/shared/types'
import { useMultiDayPlannerStore } from '@/shared/stores/multiDayPlannerStore'

interface PlanSettingsProps {
  plan: Plan
  onClose: () => void
}

const PlanSettings: React.FC<PlanSettingsProps> = ({ plan, onClose }) => {
  const [formData, setFormData] = useState({
    name: plan.name,
    description: plan.description || '',
    startDate: plan.startDate,
    endDate: plan.endDate,
  })
  
  const [timeLimit, setTimeLimit] = useState(480) // 8 hours in minutes
  const [hasChanges, setHasChanges] = useState(false)

  const {
    updatePlanInfo,
    updateDateRange,
    setTimeLimit: updateTimeLimit,
    timeLimit: currentTimeLimit,
  } = useMultiDayPlannerStore()

  React.useEffect(() => {
    setTimeLimit(currentTimeLimit)
  }, [currentTimeLimit])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  const handleTimeLimitChange = (minutes: number) => {
    setTimeLimit(minutes)
    setHasChanges(true)
  }

  const handleSave = () => {
    // Update plan info
    updatePlanInfo(formData.name, formData.description)
    
    // Update date range if changed
    if (formData.startDate !== plan.startDate || formData.endDate !== plan.endDate) {
      updateDateRange(formData.startDate, formData.endDate)
    }
    
    // Update time limit
    updateTimeLimit(timeLimit)
    
    setHasChanges(false)
    onClose()
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins}m`
    if (mins === 0) return `${hours}h`
    return `${hours}h ${mins}m`
  }

  const getDateRange = () => {
    const start = new Date(formData.startDate)
    const end = new Date(formData.endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return diffDays
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Configuración del Plan
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Ajusta la información básica y configuraciones de tu plan
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <Card>
            <Card.Header>
              <Card.Title className="text-lg">Información Básica</Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Plan
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Ej: Aventura de Fin de Semana"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción (Opcional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Describe tu plan de escape rooms..."
                  />
                </div>
              </div>
            </Card.Content>
          </Card>

          {/* Date Range */}
          <Card>
            <Card.Header>
              <Card.Title className="text-lg flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Fechas del Plan
              </Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Inicio
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Fin
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    min={formData.startDate}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Tu plan tendrá <strong>{getDateRange()} día{getDateRange() !== 1 ? 's' : ''}</strong>
                </p>
              </div>
            </Card.Content>
          </Card>

          {/* Time Settings */}
          <Card>
            <Card.Header>
              <Card.Title className="text-lg flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Configuración de Tiempo
              </Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Límite de Tiempo por Día
                  </label>
                  <div className="space-y-3">
                    <input
                      type="range"
                      min="180"
                      max="720"
                      step="30"
                      value={timeLimit}
                      onChange={(e) => handleTimeLimitChange(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>3h</span>
                      <span className="font-medium text-primary-600">
                        {formatTime(timeLimit)}
                      </span>
                      <span>12h</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Este límite se usa para validar si cada día del plan es factible y generar sugerencias automáticas.
                  </p>
                </div>

                {/* Preset Time Limits */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Presets Comunes
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: 'Medio día', minutes: 240 },
                      { label: 'Día completo', minutes: 480 },
                      { label: 'Día intenso', minutes: 600 },
                      { label: 'Maratón', minutes: 720 },
                    ].map((preset) => (
                      <Button
                        key={preset.label}
                        variant={timeLimit === preset.minutes ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleTimeLimitChange(preset.minutes)}
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </Card.Content>
          </Card>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            {hasChanges && (
              <span className="text-yellow-600">
                Tienes cambios sin guardar
              </span>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!hasChanges}
              className="flex items-center"
            >
              <Save className="h-4 w-4 mr-2" />
              Guardar Cambios
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlanSettings
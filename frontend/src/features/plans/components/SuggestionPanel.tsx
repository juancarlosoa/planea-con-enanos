import React from 'react'
import { AlertTriangle, Info, X, ArrowRight } from 'lucide-react'
import { Button, Card, Badge } from '@/shared/components'
import { useMultiDayPlannerStore } from '@/shared/stores/multiDayPlannerStore'

interface PlanSuggestion {
  id: string
  type: 'moveEscapeRoom' | 'removeEscapeRoom' | 'reorderDay' | 'splitDay'
  dayIndex: number
  escapeRoomId?: string
  targetDayIndex?: number
  message: string
  severity: 'warning' | 'error' | 'info'
}

interface SuggestionPanelProps {
  suggestions: PlanSuggestion[]
}

const SuggestionPanel: React.FC<SuggestionPanelProps> = ({ suggestions }) => {
  const { applySuggestion, dismissSuggestion } = useMultiDayPlannerStore()

  if (suggestions.length === 0) {
    return null
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />
      default:
        return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'border-red-200 bg-red-50'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50'
      case 'info':
        return 'border-blue-200 bg-blue-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  const getActionText = (type: string) => {
    switch (type) {
      case 'moveEscapeRoom':
        return 'Mover'
      case 'removeEscapeRoom':
        return 'Quitar'
      case 'reorderDay':
        return 'Reordenar'
      case 'splitDay':
        return 'Dividir'
      default:
        return 'Aplicar'
    }
  }

  return (
    <Card className="border-l-4 border-l-yellow-500">
      <Card.Header>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
            <Card.Title className="text-lg">
              Sugerencias de Optimización
            </Card.Title>
            <Badge variant="warning" className="ml-2">
              {suggestions.length}
            </Badge>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Hemos detectado algunos problemas en tu plan. Aquí tienes algunas sugerencias para optimizarlo:
        </p>
      </Card.Header>

      <Card.Content>
        <div className="space-y-3">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className={`p-4 rounded-lg border ${getSeverityColor(suggestion.severity)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  {getSeverityIcon(suggestion.severity)}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        Día {suggestion.dayIndex + 1}
                      </span>
                      {suggestion.targetDayIndex !== undefined && (
                        <>
                          <ArrowRight className="h-3 w-3 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            Día {suggestion.targetDayIndex + 1}
                          </span>
                        </>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-700">
                      {suggestion.message}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => applySuggestion(suggestion.id)}
                    className="text-xs"
                  >
                    {getActionText(suggestion.type)}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => dismissSuggestion(suggestion.id)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bulk Actions */}
        {suggestions.length > 1 && (
          <div className="flex justify-between items-center mt-4 pt-4 border-t">
            <span className="text-sm text-gray-600">
              {suggestions.length} sugerencias pendientes
            </span>
            
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  suggestions.forEach(suggestion => {
                    if (suggestion.type === 'moveEscapeRoom') {
                      applySuggestion(suggestion.id)
                    }
                  })
                }}
                className="text-xs"
              >
                Aplicar Movimientos
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  suggestions.forEach(suggestion => dismissSuggestion(suggestion.id))
                }}
                className="text-xs text-gray-600"
              >
                Descartar Todas
              </Button>
            </div>
          </div>
        )}
      </Card.Content>
    </Card>
  )
}

export default SuggestionPanel
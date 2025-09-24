import React from 'react'
import { Clock, MapPin, AlertTriangle, CheckCircle } from 'lucide-react'
import { DailyRoute } from '@/shared/types'
import { useMultiDayPlannerStore } from '@/shared/stores/multiDayPlannerStore'

interface DayNavigatorProps {
  dailyRoutes: DailyRoute[]
  selectedDayIndex: number
  onSelectDay: (dayIndex: number) => void
}

const DayNavigator: React.FC<DayNavigatorProps> = ({
  dailyRoutes,
  selectedDayIndex,
  onSelectDay,
}) => {
  const { validateDayTime, getTotalTimeForDay, getExceededTimeForDay, timeLimit } = useMultiDayPlannerStore()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
      dayName: date.toLocaleDateString('es-ES', { weekday: 'short' }),
      dayNumber: date.getDate(),
      month: date.toLocaleDateString('es-ES', { month: 'short' }),
    }
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins}m`
    if (mins === 0) return `${hours}h`
    return `${hours}h ${mins}m`
  }

  const getDayStatus = (dayIndex: number) => {
    const route = dailyRoutes[dayIndex]
    const isValid = validateDayTime(dayIndex)
    const totalTime = getTotalTimeForDay(dayIndex)
    const exceededTime = getExceededTimeForDay(dayIndex)
    
    if (route.stops.length === 0) {
      return {
        type: 'empty' as const,
        message: 'Sin escape rooms',
        color: 'text-gray-400',
        bgColor: 'bg-gray-50',
      }
    }
    
    if (!isValid) {
      return {
        type: 'exceeded' as const,
        message: `Excede ${formatTime(exceededTime)}`,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
      }
    }
    
    const remainingTime = timeLimit - totalTime
    if (remainingTime < 60) { // Less than 1 hour remaining
      return {
        type: 'warning' as const,
        message: `Quedan ${formatTime(remainingTime)}`,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
      }
    }
    
    return {
      type: 'valid' as const,
      message: `${formatTime(totalTime)} planificado`,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      {dailyRoutes.map((route, index) => {
        const dateInfo = formatDate(route.date)
        const status = getDayStatus(index)
        const isSelected = index === selectedDayIndex
        
        return (
          <button
            key={route.id}
            onClick={() => onSelectDay(index)}
            className={`
              p-3 rounded-lg border text-center transition-all duration-200 min-w-[120px]
              ${isSelected 
                ? 'border-primary-500 bg-primary-50 shadow-sm' 
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }
            `}
          >
            <div className="flex flex-col items-center space-y-1">
              <div className="text-center">
                <div className="text-xs text-gray-500 uppercase">
                  {dateInfo.dayName}
                </div>
                <div className="text-lg font-semibold text-gray-900">
                  {dateInfo.dayNumber}
                </div>
                <div className="text-xs text-gray-500 capitalize">
                  {dateInfo.month}
                </div>
              </div>
              
              <div className="text-xs font-medium text-gray-900">
                Día {index + 1}
              </div>
              
              <div className="flex items-center text-xs text-gray-600">
                <MapPin className="h-3 w-3 mr-1" />
                <span>{route.stops.length}</span>
              </div>
              
              {/* Status indicator */}
              <div className="flex justify-center">
                {status.type === 'exceeded' && (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                )}
                {status.type === 'warning' && (
                  <Clock className="h-4 w-4 text-yellow-500" />
                )}
                {status.type === 'valid' && route.stops.length > 0 && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
              </div>
            </div>
            
            {/* Progress bar for time usage */}
            {route.stops.length > 0 && (
              <div className="mt-2 w-full">
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      status.type === 'exceeded' 
                        ? 'bg-red-500' 
                        : status.type === 'warning'
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{
                      width: `${Math.min(100, (getTotalTimeForDay(index) / timeLimit) * 100)}%`
                    }}
                  />
                </div>
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}

export default DayNavigator
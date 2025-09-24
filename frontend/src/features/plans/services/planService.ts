import { api } from '@/shared/services/api'
import { Plan, DailyRoute } from '@/shared/types'

export interface CreatePlanRequest {
  name: string
  description?: string
  startDate: string
  endDate: string
  createdBy: string
}

export interface UpdatePlanRequest {
  name?: string
  description?: string
}

export interface UpdatePlanDateRangeRequest {
  startDate: string
  endDate: string
}

export interface AddStopToDayRequest {
  escapeRoomId: string
}

export interface MoveStopBetweenDaysRequest {
  targetDate: string
}

export interface ReorderStopsRequest {
  escapeRoomIds: string[]
}

class PlanService {
  private baseUrl = '/api/plans'

  // Plan CRUD operations
  async getPlans(): Promise<Plan[]> {
    return await api.get<Plan[]>(this.baseUrl)
  }

  async getPlan(planId: string): Promise<Plan> {
    return await api.get<Plan>(`${this.baseUrl}/${planId}`)
  }

  async createPlan(request: CreatePlanRequest): Promise<Plan> {
    return await api.post<Plan>(this.baseUrl, request)
  }

  async updatePlan(planId: string, request: UpdatePlanRequest): Promise<Plan> {
    return await api.put<Plan>(`${this.baseUrl}/${planId}`, request)
  }

  async updatePlanDateRange(planId: string, request: UpdatePlanDateRangeRequest): Promise<Plan> {
    return await api.put<Plan>(`${this.baseUrl}/${planId}/date-range`, request)
  }

  async deletePlan(planId: string): Promise<void> {
    await api.delete(`${this.baseUrl}/${planId}`)
  }

  async activatePlan(planId: string): Promise<Plan> {
    return await api.post<Plan>(`${this.baseUrl}/${planId}/activate`)
  }

  async completePlan(planId: string): Promise<Plan> {
    return await api.post<Plan>(`${this.baseUrl}/${planId}/complete`)
  }

  async cancelPlan(planId: string): Promise<Plan> {
    return await api.post<Plan>(`${this.baseUrl}/${planId}/cancel`)
  }

  // Daily route operations
  async getDailyRoute(planId: string, date: string): Promise<DailyRoute> {
    return await api.get<DailyRoute>(`${this.baseUrl}/${planId}/daily-routes/${date}`)
  }

  async addStopToDay(planId: string, date: string, request: AddStopToDayRequest): Promise<DailyRoute> {
    return await api.post<DailyRoute>(`${this.baseUrl}/${planId}/daily-routes/${date}/stops`, request)
  }

  async removeStopFromDay(planId: string, date: string, escapeRoomId: string): Promise<DailyRoute> {
    return await api.delete<DailyRoute>(`${this.baseUrl}/${planId}/daily-routes/${date}/stops/${escapeRoomId}`)
  }

  async moveStopBetweenDays(planId: string, fromDate: string, escapeRoomId: string, request: MoveStopBetweenDaysRequest): Promise<{ fromRoute: DailyRoute; toRoute: DailyRoute }> {
    return await api.post<{ fromRoute: DailyRoute; toRoute: DailyRoute }>(
      `${this.baseUrl}/${planId}/daily-routes/${fromDate}/stops/${escapeRoomId}/move`,
      { targetDate: request.targetDate }
    )
  }

  async reorderStopsInDay(planId: string, date: string, request: ReorderStopsRequest): Promise<DailyRoute> {
    return await api.put<DailyRoute>(`${this.baseUrl}/${planId}/daily-routes/${date}/stops/reorder`, request)
  }

  async updateDailyRouteTransport(planId: string, date: string, transportMode: string, multiModalStrategy: string): Promise<DailyRoute> {
    return await api.put<DailyRoute>(`${this.baseUrl}/${planId}/daily-routes/${date}/transport`, {
      preferredTransportMode: transportMode,
      multiModalStrategy,
    })
  }

  // Route optimization
  async optimizeDailyRoute(planId: string, date: string): Promise<DailyRoute> {
    return await api.post<DailyRoute>(`${this.baseUrl}/${planId}/daily-routes/${date}/optimize`)
  }

  async optimizeAllRoutes(planId: string): Promise<Plan> {
    return await api.post<Plan>(`${this.baseUrl}/${planId}/optimize-all`)
  }

  // Export and sharing
  async generatePublicLink(planId: string): Promise<{ publicUrl: string; expiresAt: string }> {
    return await api.post<{ publicUrl: string; expiresAt: string }>(`${this.baseUrl}/${planId}/share`)
  }

  async exportToPdf(planId: string): Promise<Blob> {
    const response = await api.get(`${this.baseUrl}/${planId}/export/pdf`)
    return response as Blob
  }

  async exportToJson(planId: string): Promise<Plan> {
    return await api.get<Plan>(`${this.baseUrl}/${planId}/export/json`)
  }

  // Public access (for shared plans)
  async getPublicPlan(shareToken: string): Promise<Plan> {
    return await api.get<Plan>(`/api/public/plans/${shareToken}`)
  }
}

export const planService = new PlanService()
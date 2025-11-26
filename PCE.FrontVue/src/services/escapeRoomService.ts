import apiClient from './api';
import type {
  EscapeRoomDto,
  CreateEscapeRoomRequest,
  UpdateEscapeRoomRequest,
} from '../types/models';

export const escapeRoomService = {
  /**
   * Obtiene todas las salas de escape
   */
  async getAllRooms(): Promise<EscapeRoomDto[]> {
    try {
      const response = await apiClient.get<EscapeRoomDto[]>('/rooms');
      return response.data;
    } catch (error) {
      console.error('Error fetching escape rooms:', error);
      throw error;
    }
  },

  /**
   * Obtiene una sala específica por slug
   */
  async getRoomBySlug(slug: string): Promise<EscapeRoomDto> {
    try {
      const response = await apiClient.get<EscapeRoomDto>(`/rooms/${slug}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching room ${slug}:`, error);
      throw error;
    }
  },

  /**
   * Crea una nueva sala de escape
   */
  async createRoom(request: CreateEscapeRoomRequest): Promise<string> {
    try {
      const response = await apiClient.post<string>('/rooms', request);
      return response.data;
    } catch (error) {
      console.error('Error creating escape room:', error);
      throw error;
    }
  },

  /**
   * Actualiza una sala de escape existente
   */
  async updateRoom(request: UpdateEscapeRoomRequest): Promise<string> {
    try {
      const response = await apiClient.put<string>(`/rooms/${request.slug}`, request);
      return response.data;
    } catch (error) {
      console.error(`Error updating room ${request.slug}:`, error);
      throw error;
    }
  },

  /**
   * Elimina una sala de escape
   */
  async deleteRoom(slug: string): Promise<void> {
    try {
      await apiClient.delete(`/rooms/${slug}`);
    } catch (error) {
      console.error(`Error deleting room ${slug}:`, error);
      throw error;
    }
  },
};

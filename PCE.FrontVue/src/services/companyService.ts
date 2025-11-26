import apiClient from './api';
import type {
  CompanyDto,
  CreateCompanyRequest,
  UpdateCompanyRequest,
  EscapeRoomDto,
} from '../types/models';

export const companyService = {
  /**
   * Obtiene todas las empresas
   */
  async getAllCompanies(): Promise<CompanyDto[]> {
    try {
      const response = await apiClient.get<CompanyDto[]>('/companies');
      return response.data;
    } catch (error) {
      console.error('Error fetching companies:', error);
      throw error;
    }
  },

  /**
   * Obtiene una empresa específica por slug
   */
  async getCompanyBySlug(slug: string): Promise<CompanyDto> {
    try {
      const response = await apiClient.get<CompanyDto>(`/companies/${slug}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching company ${slug}:`, error);
      throw error;
    }
  },

  /**
   * Crea una nueva empresa
   */
  async createCompany(request: CreateCompanyRequest): Promise<string> {
    try {
      const response = await apiClient.post<string>('/companies', request);
      return response.data;
    } catch (error) {
      console.error('Error creating company:', error);
      throw error;
    }
  },

  /**
   * Actualiza una empresa existente
   */
  async updateCompany(request: UpdateCompanyRequest): Promise<string> {
    try {
      const response = await apiClient.put<string>(`/companies/${request.slug}`, request);
      return response.data;
    } catch (error) {
      console.error(`Error updating company ${request.slug}:`, error);
      throw error;
    }
  },

  /**
   * Elimina una empresa
   */
  async deleteCompany(slug: string): Promise<void> {
    try {
      await apiClient.delete(`/companies/${slug}`);
    } catch (error) {
      console.error(`Error deleting company ${slug}:`, error);
      throw error;
    }
  },

  /**
   * Obtiene todas las salas de escape de una empresa
   */
  async getCompanyEscapeRooms(companySlug: string): Promise<EscapeRoomDto[]> {
    try {
      const response = await apiClient.get<EscapeRoomDto[]>(
        `/companies/${companySlug}/rooms`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching escape rooms for company ${companySlug}:`,
        error
      );
      throw error;
    }
  },
};

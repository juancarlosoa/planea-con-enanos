/**
 * Ejemplos de uso de los servicios
 * 
 * Este archivo demuestra cómo usar los servicios Vue
 * para interactuar con el backend
 */

import  { companyService } from "../services/companyService";
import { escapeRoomService } from "../services/escapeRoomService";
import type { CreateEscapeRoomRequest, CreateCompanyRequest } from "../types/models";



/**
 * ESCAPE ROOMS
 */

// Obtener todas las salas
export async function exampleGetAllRooms() {
  try {
    const rooms = await escapeRoomService.getAllRooms();
    console.log('Salas:', rooms);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Obtener una sala por slug
export async function exampleGetRoomBySlug() {
  try {
    const room = await escapeRoomService.getRoomBySlug('la-cripta-misteriosa');
    console.log('Sala:', room);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Crear una nueva sala
export async function exampleCreateRoom() {
  try {
    const request: CreateEscapeRoomRequest = {
      name: 'El Templo Perdido',
      description: 'Una aventura épica en las ruinas de un templo antiguo',
      maxPlayers: 6,
      minPlayers: 2,
      durationMinutes: 60,
      difficultyLevel: 'Difícil',
      pricePerPerson: 25.99,
      companySlug: 'adventure-inc',
    };
    const slug = await escapeRoomService.createRoom(request);
    console.log('Sala creada:', slug);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Actualizar una sala
export async function exampleUpdateRoom() {
  try {
    const request = {
      slug: 'el-templo-perdido',
      name: 'El Templo Perdido - Edición Premium',
      description: 'Una aventura épica mejorada',
      maxPlayers: 8,
      minPlayers: 2,
      durationMinutes: 90,
      difficultyLevel: 'Muy Difícil',
      pricePerPerson: 29.99,
    };
    const result = await escapeRoomService.updateRoom(request);
    console.log('Sala actualizada:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Eliminar una sala
export async function exampleDeleteRoom() {
  try {
    await escapeRoomService.deleteRoom('el-templo-perdido');
    console.log('Sala eliminada');
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * COMPANIES
 */

// Obtener todas las empresas
export async function exampleGetAllCompanies() {
  try {
    const companies = await companyService.getAllCompanies();
    console.log('Empresas:', companies);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Obtener una empresa por slug
export async function exampleGetCompanyBySlug() {
  try {
    const company = await companyService.getCompanyBySlug('adventure-inc');
    console.log('Empresa:', company);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Crear una nueva empresa
export async function exampleCreateCompany() {
  try {
    const request: CreateCompanyRequest = {
      name: 'Adventure Inc',
      email: 'info@adventureinc.com',
      phone: '+34 91 123 4567',
      address: 'Calle Principal, 123, Madrid',
      website: 'https://www.adventureinc.com',
    };
    const slug = await companyService.createCompany(request);
    console.log('Empresa creada:', slug);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Actualizar una empresa
export async function exampleUpdateCompany() {
  try {
    const request = {
      slug: 'adventure-inc',
      name: 'Adventure Inc - Madrid',
      email: 'madrid@adventureinc.com',
      phone: '+34 91 234 5678',
      address: 'Avenida Principal, 456, Madrid',
      website: 'https://madrid.adventureinc.com',
    };
    const result = await companyService.updateCompany(request);
    console.log('Empresa actualizada:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Eliminar una empresa
export async function exampleDeleteCompany() {
  try {
    await companyService.deleteCompany('adventure-inc');
    console.log('Empresa eliminada');
  } catch (error) {
    console.error('Error:', error);
  }
}

// Obtener salas de una empresa
export async function exampleGetCompanyRooms() {
  try {
    const rooms = await companyService.getCompanyEscapeRooms('adventure-inc');
    console.log('Salas de la empresa:', rooms);
  } catch (error) {
    console.error('Error:', error);
  }
}

import { EscapeRoom } from '@/shared/types'
// import { env } from '@/shared/config/env' // Will be used when backend is ready

// Mock data for development
const mockEscapeRooms: EscapeRoom[] = [
  {
    id: '1',
    name: 'The Mystery Chamber',
    description: 'Un misterioso escape room lleno de enigmas y secretos por descubrir.',
    address: 'Carrer de Balmes, 123, Barcelona',
    latitude: 41.3879,
    longitude: 2.1699,
    rating: 4.5,
    priceRange: '25-35€',
    duration: 60,
    difficulty: 'medium',
    theme: 'Mystery',
    maxPlayers: 6,
    minPlayers: 2,
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    website: 'https://example.com',
    phone: '+34 123 456 789'
  },
  {
    id: '2',
    name: 'Zombie Apocalypse',
    description: 'Sobrevive al apocalipsis zombie en este intenso escape room de terror.',
    address: 'Carrer del Consell de Cent, 456, Barcelona',
    latitude: 41.3851,
    longitude: 2.1734,
    rating: 4.8,
    priceRange: '30-40€',
    duration: 75,
    difficulty: 'hard',
    theme: 'Horror',
    maxPlayers: 8,
    minPlayers: 3,
    imageUrl: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=400',
    website: 'https://example.com',
    phone: '+34 987 654 321'
  },
  {
    id: '3',
    name: 'Pirate Treasure Hunt',
    description: 'Busca el tesoro perdido del capitán Barbanegra en esta aventura pirata.',
    address: 'Carrer de Pau Claris, 789, Barcelona',
    latitude: 41.3917,
    longitude: 2.1649,
    rating: 4.2,
    priceRange: '20-30€',
    duration: 50,
    difficulty: 'easy',
    theme: 'Adventure',
    maxPlayers: 5,
    minPlayers: 2,
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    website: 'https://example.com',
    phone: '+34 555 123 456'
  },
  {
    id: '4',
    name: 'Space Station Omega',
    description: 'Repara la estación espacial antes de que sea demasiado tarde.',
    address: 'Carrer de Muntaner, 321, Barcelona',
    latitude: 41.3825,
    longitude: 2.1532,
    rating: 4.6,
    priceRange: '35-45€',
    duration: 90,
    difficulty: 'hard',
    theme: 'Sci-Fi',
    maxPlayers: 6,
    minPlayers: 3,
    imageUrl: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=400',
    website: 'https://example.com',
    phone: '+34 777 888 999'
  },
  {
    id: '5',
    name: 'Medieval Castle',
    description: 'Escapa del castillo medieval resolviendo antiguos acertijos.',
    address: 'Carrer de Girona, 654, Barcelona',
    latitude: 41.3956,
    longitude: 2.1621,
    rating: 4.0,
    priceRange: '25-35€',
    duration: 65,
    difficulty: 'medium',
    theme: 'Historical',
    maxPlayers: 7,
    minPlayers: 2,
    imageUrl: 'https://images.unsplash.com/photo-1520637836862-4d197d17c93a?w=400',
    website: 'https://example.com',
    phone: '+34 111 222 333'
  }
]

export interface EscapeRoomFilters {
  search?: string
  difficulty?: string[]
  minRating?: number
  maxPrice?: number
  theme?: string[]
  location?: {
    latitude: number
    longitude: number
    radius: number // in km
  }
}

class EscapeRoomService {
  // private baseUrl = `${env.API_BASE_URL}/api/escape-rooms` // Will be used when backend is ready

  async getAllEscapeRooms(): Promise<EscapeRoom[]> {
    try {
      // For now, return mock data
      // TODO: Replace with actual API call when backend is ready
      return new Promise((resolve) => {
        setTimeout(() => resolve(mockEscapeRooms), 500)
      })

      // Future API implementation:
      // const response = await fetch(this.baseUrl)
      // if (!response.ok) throw new Error('Failed to fetch escape rooms')
      // const data: ApiResponse<EscapeRoom[]> = await response.json()
      // return data.data
    } catch (error) {
      console.error('Error fetching escape rooms:', error)
      throw error
    }
  }

  async getEscapeRoomById(id: string): Promise<EscapeRoom | null> {
    try {
      // For now, return mock data
      const escapeRoom = mockEscapeRooms.find(room => room.id === id)
      return new Promise((resolve) => {
        setTimeout(() => resolve(escapeRoom || null), 300)
      })

      // Future API implementation:
      // const response = await fetch(`${this.baseUrl}/${id}`)
      // if (!response.ok) throw new Error('Failed to fetch escape room')
      // const data: ApiResponse<EscapeRoom> = await response.json()
      // return data.data
    } catch (error) {
      console.error('Error fetching escape room:', error)
      throw error
    }
  }

  async searchEscapeRooms(filters: EscapeRoomFilters): Promise<EscapeRoom[]> {
    try {
      // For now, filter mock data
      let filteredRooms = [...mockEscapeRooms]

      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        filteredRooms = filteredRooms.filter(room =>
          room.name.toLowerCase().includes(searchLower) ||
          room.description.toLowerCase().includes(searchLower) ||
          room.theme.toLowerCase().includes(searchLower)
        )
      }

      if (filters.difficulty && filters.difficulty.length > 0) {
        filteredRooms = filteredRooms.filter(room =>
          filters.difficulty!.includes(room.difficulty)
        )
      }

      if (filters.minRating) {
        filteredRooms = filteredRooms.filter(room =>
          room.rating >= filters.minRating!
        )
      }

      if (filters.theme && filters.theme.length > 0) {
        filteredRooms = filteredRooms.filter(room =>
          filters.theme!.includes(room.theme)
        )
      }

      if (filters.location) {
        // Simple distance calculation (not accurate for production)
        filteredRooms = filteredRooms.filter(room => {
          const distance = this.calculateDistance(
            filters.location!.latitude,
            filters.location!.longitude,
            room.latitude,
            room.longitude
          )
          return distance <= filters.location!.radius
        })
      }

      return new Promise((resolve) => {
        setTimeout(() => resolve(filteredRooms), 500)
      })

      // Future API implementation:
      // const params = new URLSearchParams()
      // if (filters.search) params.append('search', filters.search)
      // if (filters.difficulty) params.append('difficulty', filters.difficulty.join(','))
      // if (filters.minRating) params.append('minRating', filters.minRating.toString())
      // if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString())
      // if (filters.theme) params.append('theme', filters.theme.join(','))
      // if (filters.location) {
      //   params.append('lat', filters.location.latitude.toString())
      //   params.append('lng', filters.location.longitude.toString())
      //   params.append('radius', filters.location.radius.toString())
      // }
      
      // const response = await fetch(`${this.baseUrl}/search?${params}`)
      // if (!response.ok) throw new Error('Failed to search escape rooms')
      // const data: ApiResponse<EscapeRoom[]> = await response.json()
      // return data.data
    } catch (error) {
      console.error('Error searching escape rooms:', error)
      throw error
    }
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371 // Radius of the Earth in km
    const dLat = this.deg2rad(lat2 - lat1)
    const dLon = this.deg2rad(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const d = R * c // Distance in km
    return d
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180)
  }
}

export const escapeRoomService = new EscapeRoomService()
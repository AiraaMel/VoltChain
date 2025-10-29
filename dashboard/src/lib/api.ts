const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface EnergyData {
  totalEnergy: number;
  averagePrice: number;
  totalEarnings: number;
  activeDevices: number;
  monthlyData: Array<{
    month: string;
    value: number;
  }>;
  availableToClaim: number;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { data, success: true };
    } catch (error) {
      console.error('API Error:', error);
      return {
        data: {} as T,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string }>> {
    return this.request('/health');
  }

  // Get dashboard data
  async getDashboardData(): Promise<ApiResponse<EnergyData>> {
    return this.request('/v1/dashboard');
  }

  // Get devices (mock data for now since there's no GET /devices endpoint)
  async getDevices(): Promise<ApiResponse<any[]>> {
    // Mock data since backend only has POST /v1/devices
    const mockDevices = [
      {
        id: 1,
        name: "Solar Panel Array A",
        location: "Rooftop – North",
        active: true,
        energy_generated: 2500
      },
      {
        id: 2,
        name: "Solar Panel Array B", 
        location: "Rooftop – South",
        active: true,
        energy_generated: 2300
      },
      {
        id: 3,
        name: "Wind Turbine Unit 1",
        location: "Ground Level",
        active: true,
        energy_generated: 1500
      }
    ];
    
    return { data: mockDevices, success: true };
  }

  // Get readings (mock data for now)
  async getReadings(): Promise<ApiResponse<any[]>> {
    // Mock data since backend only has GET /v1/devices/:id/readings
    const mockReadings = [
      {
        id: 1,
        device_id: 1,
        energy_generated_kwh: 25.5,
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        device_id: 2,
        energy_generated_kwh: 23.2,
        created_at: new Date().toISOString()
      }
    ];
    
    return { data: mockReadings, success: true };
  }
}

export const apiService = new ApiService();

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
    // For now, return mock data since backend might not have this endpoint yet
    const mockData: EnergyData = {
      totalEnergy: 5234,
      averagePrice: 0.38,
      totalEarnings: 1989.20,
      activeDevices: 3,
      monthlyData: [
        { month: "Jan", value: 400 },
        { month: "Feb", value: 300 },
        { month: "Mar", value: 500 },
        { month: "Apr", value: 450 },
        { month: "May", value: 600 },
        { month: "Jun", value: 550 },
        { month: "Jul", value: 700 },
        { month: "Aug", value: 650 },
        { month: "Sep", value: 800 },
        { month: "Oct", value: 750 },
        { month: "Nov", value: 900 },
        { month: "Dec", value: 850 },
      ],
      availableToClaim: 1247.85,
    };

    return { data: mockData, success: true };
  }

  // Get devices
  async getDevices(): Promise<ApiResponse<any[]>> {
    return this.request('/devices');
  }

  // Get readings
  async getReadings(): Promise<ApiResponse<any[]>> {
    return this.request('/readings');
  }
}

export const apiService = new ApiService();

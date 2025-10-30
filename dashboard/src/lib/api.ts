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
        // Evita respostas 304 com corpo vazio em dev (Next/Turbopack cache)
        cache: 'no-store',
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const raw = await response.json();
      // O backend responde no formato { success, data }. Descompactamos aqui
      const payload = (raw && typeof raw === 'object' && 'data' in raw) ? (raw as any).data : raw;
      return { data: payload as T, success: true };
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

  // Get devices (calls backend; no more mock)
  async getDevices(): Promise<ApiResponse<any[]>> {
    try {
      const adminToken = process.env.NEXT_PUBLIC_ADMIN_TOKEN;
      const res = await fetch(`${API_BASE_URL}/v1/devices`, {
        headers: {
          'Content-Type': 'application/json',
          ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {})
        }
      });
      if (res.ok) {
        const json = await res.json();
        return { data: json.devices || [], success: true };
      }
      throw new Error(`HTTP ${res.status}`);
    } catch (e) {
      return { data: [], success: false, error: e instanceof Error ? e.message : 'Unknown error' };
    }
  }

  // Get readings for a device (calls backend; no more mock)
  async getReadings(deviceId: string, limit = 100): Promise<ApiResponse<any[]>> {
    try {
      const adminToken = process.env.NEXT_PUBLIC_ADMIN_TOKEN;
      const res = await fetch(`${API_BASE_URL}/v1/devices/${deviceId}/readings?limit=${limit}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {})
        }
      });
      if (res.ok) {
        const json = await res.json();
        return { data: json.readings || [], success: true };
      }
      throw new Error(`HTTP ${res.status}`);
    } catch (e) {
      return { data: [], success: false, error: e instanceof Error ? e.message : 'Unknown error' };
    }
  }
}

export const apiService = new ApiService();

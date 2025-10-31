// Separate API base URLs for different services
const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const NEXT_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

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
  // Request to old backend (port 8080)
  private async requestBackend<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${BACKEND_API_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        cache: 'no-store',
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const raw = await response.json();
      const payload = (raw && typeof raw === 'object' && 'data' in raw) ? (raw as any).data : raw;
      return { data: payload as T, success: true };
    } catch (error) {
      console.error('API Request failed:', endpoint, error);
      throw new Error(`API Error at ${endpoint}`);
    }
  }

  // Request to Next.js API routes
  private async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${NEXT_API_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        cache: 'no-store',
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const raw = await response.json();
      const payload = (raw && typeof raw === 'object' && 'data' in raw) ? (raw as any).data : raw;
      return { data: payload as T, success: true };
    } catch (error) {
      console.error('API Request failed:', endpoint, error);
      throw new Error(`API Error at ${endpoint}`);
    }
  }

  // Health check (backend)
  async healthCheck(): Promise<ApiResponse<{ status: string }>> {
    return this.requestBackend('/healthz');
  }

  // Get dashboard data (backend)
  async getDashboardData(): Promise<ApiResponse<EnergyData>> {
    return this.requestBackend('/v1/dashboard');
  }

  // Get devices (backend)
  async getDevices(): Promise<ApiResponse<any[]>> {
    const endpoint = '/v1/devices';
    try {
      const adminToken = process.env.NEXT_PUBLIC_ADMIN_TOKEN;
      const res = await fetch(`${BACKEND_API_URL}${endpoint}`, {
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
      console.error('API Request failed:', endpoint, e);
      throw new Error(`API Error at ${endpoint}`);
    }
  }

  // Get readings for a device (backend)
  async getReadings(deviceId: string, limit = 100): Promise<ApiResponse<any[]>> {
    const endpoint = `/v1/devices/${deviceId}/readings`;
    try {
      const adminToken = process.env.NEXT_PUBLIC_ADMIN_TOKEN;
      const res = await fetch(`${BACKEND_API_URL}${endpoint}?limit=${limit}`, {
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
      console.error('API Request failed:', endpoint, e);
      throw new Error(`API Error at ${endpoint}`);
    }
  }
}

export const apiService = new ApiService();

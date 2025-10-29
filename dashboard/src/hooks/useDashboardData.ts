"use client"

import { useState, useEffect } from 'react';
import { apiService, EnergyData } from '@/lib/api';

export function useDashboardData() {
  const [data, setData] = useState<EnergyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [backendConnected, setBackendConnected] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Check backend connection
        const healthResponse = await apiService.healthCheck();
        setBackendConnected(healthResponse.success);
        
        // Fetch dashboard data
        const response = await apiService.getDashboardData();
        
        if (response.success) {
          setData(response.data);
          setError(null);
        } else {
          setError(response.error || 'Failed to fetch data');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setBackendConnected(false);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const refetch = async () => {
    setLoading(true);
    const response = await apiService.getDashboardData();
    if (response.success) {
      setData(response.data);
      setError(null);
    } else {
      setError(response.error || 'Failed to fetch data');
    }
    setLoading(false);
  };

  return {
    data,
    loading,
    error,
    backendConnected,
    refetch,
  };
}

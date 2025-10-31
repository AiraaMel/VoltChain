import { Router, Request, Response } from 'express';
import { supabase } from '../services/supabase';

const router = Router();

/**
 * Get dashboard data
 * GET /v1/dashboard
 */
router.get('/v1/dashboard', async (req: Request, res: Response) => {
  try {
    console.log('📊 Dashboard endpoint called');
    
    // Tentar buscar dados reais do Supabase
    let devices = [];
    let readings = [];
    let transactions = [];
    
    try {
      const { data: devicesData } = await supabase
        .from('devices')
        .select('*')
        .eq('active', true);
      devices = devicesData || [];
      
      const { data: readingsData } = await supabase
        .from('readings')
        .select('energy_generated_kwh, created_at')
        .order('created_at', { ascending: false })
        .limit(100);
      readings = readingsData || [];

      const { data: txData } = await supabase
        .from('transactions')
        .select('id, user_id, device_id, type, amount, token, metadata, created_at, updated_at')
        .order('created_at', { ascending: false })
        .limit(20);
      transactions = txData || [];
    } catch (dbError) {
      console.log('⚠️ Database error, using mock data:', dbError);
    }

    // Calcular métricas
    const totalEnergy = readings.reduce((sum: number, r: any) => sum + (r.energy_generated_kwh || 0), 0) || 5234;
    const averagePrice = 0.38;
    const totalEarnings = totalEnergy * averagePrice;
    const activeDevices = devices.length || 3;

    // Dados mensais (mock por enquanto)
    const monthlyData = [
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
    ];

    const dashboardData = {
      totalEnergy: Math.round(totalEnergy),
      averagePrice,
      totalEarnings: Math.round(totalEarnings * 100) / 100,
      activeDevices,
      monthlyData,
      availableToClaim: 1247.85,
      transactions,
    };

    console.log('📊 Dashboard data:', dashboardData);

    res.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('❌ Dashboard error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;

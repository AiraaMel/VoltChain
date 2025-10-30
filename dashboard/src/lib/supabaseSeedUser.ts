import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const userEmail = 'user@voltchain.com';

export async function seedUserData() {
  // 1. Garante o usuário
  let { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('email', userEmail)
    .single();
  if (!user) {
    const { data: u } = await supabase.from('users').insert([{ email: userEmail, name: 'VoltChain User' }]).select().single();
    user = u;
  }
  if (!user?.id) throw new Error('User creation failed');
  // 2. Cria devices para user
  const { data: devices } = await supabase.from('devices').insert([
    { name: 'Painel Solar Casa', device_secret: 'secret-x', user_id: user.id, active: true, location: { place: 'Telhado' } },
    { name: 'Turbina Quintal', device_secret: 'secret-y', user_id: user.id, active: true, location: { place: 'Quintal' } }
  ]).select();
  // 3. Readings para cada device
  for (const device of devices ?? []) {
    await supabase.from('readings').insert([
      {
        device_id: device.id,
        ts_device: new Date().toISOString(),
        energy_generated_kwh: Math.random() * 2 + 1,
        raw_payload: { note: 'simulated' },
        signature: 'sim',
        onchain_status: 'pending',
      }
    ]);
  }
  // 4. Transactions creditando esse user
  await supabase.from('transactions').insert([
    {
      user_id: user.id,
      device_id: devices?.[0]?.id,
      type: 'sale',
      amount: 22.5,
      token: 'USDC',
      metadata: { ref: 'sim_tx1' }
    },
    {
      user_id: user.id,
      device_id: devices?.[1]?.id,
      type: 'reward',
      amount: 10.0,
      token: 'USDC',
      metadata: { ref: 'sim_rwd1' }
    }
  ]);
  return true;
}


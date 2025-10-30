/* eslint-disable no-console */
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: __dirname + '/../.env' });

async function main() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in backend/.env');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  console.log('Seeding fake data into Supabase...');

  // 1) Users
  const users = [
    { email: 'alice@example.com', name: 'Alice' },
    { email: 'bob@example.com', name: 'Bob' }
  ];
  const { data: usersInserted, error: usersErr } = await supabase
    .from('users')
    .insert(users)
    .select();
  if (usersErr) throw usersErr;
  console.log('Users inserted:', usersInserted.map(u => u.email));

  // 2) Devices
  const devices = [
    { name: 'Solar Panel Array A', device_secret: 'secret-a', active: true, user_id: usersInserted[0]?.id, location: { site: 'Rooftop – North' } },
    { name: 'Solar Panel Array B', device_secret: 'secret-b', active: true, user_id: usersInserted[0]?.id, location: { site: 'Rooftop – South' } },
    { name: 'Wind Turbine Unit 1', device_secret: 'secret-c', active: true, user_id: usersInserted[1]?.id, location: { site: 'Ground Level' } }
  ];
  const { data: devicesInserted, error: devicesErr } = await supabase
    .from('devices')
    .insert(devices)
    .select();
  if (devicesErr) throw devicesErr;
  console.log('Devices inserted:', devicesInserted.map(d => d.name));

  // 3) Readings (simple recent samples per device)
  const now = new Date();
  const toIso = (d) => d.toISOString();
  const readings = devicesInserted.flatMap((d, i) => {
    const base = new Date(now.getTime() - (i + 1) * 3600_000);
    return [
      { device_id: d.id, ts_device: toIso(new Date(base.getTime() - 300_000)), energy_generated_kwh: 1.25, raw_payload: {}, signature: 'seed', onchain_status: 'pending' },
      { device_id: d.id, ts_device: toIso(new Date(base.getTime() - 200_000)), energy_generated_kwh: 1.10, raw_payload: {}, signature: 'seed', onchain_status: 'pending' },
      { device_id: d.id, ts_device: toIso(new Date(base.getTime() - 100_000)), energy_generated_kwh: 1.40, raw_payload: {}, signature: 'seed', onchain_status: 'pending' }
    ];
  });
  const { count: _rCount, error: readingsErr } = await supabase
    .from('readings')
    .insert(readings);
  if (readingsErr) throw readingsErr;
  console.log('Readings inserted:', readings.length);

  // 4) Transactions (sales/rewards)
  const txs = [
    { user_id: usersInserted[0]?.id, device_id: devicesInserted[0]?.id, type: 'sale', amount: 24.50, token: 'USDC', metadata: { ref: 'TX-001' } },
    { user_id: usersInserted[0]?.id, device_id: devicesInserted[1]?.id, type: 'reward', amount: 5.00, token: 'USDC', metadata: { ref: 'RW-001' } },
    { user_id: usersInserted[1]?.id, device_id: devicesInserted[2]?.id, type: 'sale', amount: 18.75, token: 'USDC', metadata: { ref: 'TX-002' } }
  ];
  const { data: txInserted, error: txErr } = await supabase
    .from('transactions')
    .insert(txs)
    .select();
  if (txErr) throw txErr;
  console.log('Transactions inserted:', txInserted.length);

  console.log('✅ Seed completed.');
}

main().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});






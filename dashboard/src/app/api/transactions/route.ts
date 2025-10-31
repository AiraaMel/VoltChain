import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { createSupabaseServerClient } from '@/lib/supabase-client';

const SOLANA_RPC = process.env.NEXT_PUBLIC_SOLANA_RPC || 'https://api.devnet.solana.com';
const PRICE_PER_KWH = parseFloat(process.env.PRICE_PER_KWH_USD || '0.38');

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { wallet, kwh, txSignature } = body;

    if (!wallet || !kwh || !txSignature) {
      return NextResponse.json(
        { error: 'Missing required fields: wallet, kwh, txSignature' },
        { status: 400 }
      );
    }

    const kwhValue = parseFloat(kwh);
    const totalUsd = kwhValue * PRICE_PER_KWH;

    // Verify transaction on-chain
    const connection = new Connection(SOLANA_RPC);
    let txStatus = 'pending';
    
    try {
      const tx = await connection.getTransaction(txSignature, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0
      });
      
      if (tx && tx.meta && tx.meta.err === null) {
        txStatus = 'confirmed';
      } else {
        txStatus = 'failed';
      }
    } catch (error) {
      console.error('Error verifying transaction:', error);
      txStatus = 'failed';
    }

    const supabase = createSupabaseServerClient();

    // Insert energy transaction
    const { data: transaction, error: txError } = await supabase
      .from('energy_transactions')
      .insert({
        wallet_address: wallet,
        kwh: kwhValue,
        price_per_kwh: PRICE_PER_KWH,
        total_usd: totalUsd,
        tx_signature: txSignature,
        tx_status: txStatus,
        onchain_payload: { kwh: kwhValue, price: PRICE_PER_KWH },
        confirmed_at: txStatus === 'confirmed' ? new Date().toISOString() : null
      })
      .select()
      .single();

    if (txError) {
      console.error('Error inserting transaction:', txError);
      return NextResponse.json(
        { error: 'Failed to insert transaction' },
        { status: 500 }
      );
    }

    // Update or insert wallet earnings
    if (txStatus === 'confirmed') {
      const { data: existingEarnings } = await supabase
        .from('wallet_earnings')
        .select('*')
        .eq('wallet_address', wallet)
        .single();

      if (existingEarnings) {
        await supabase
          .from('wallet_earnings')
          .update({
            available_to_claim: (parseFloat(existingEarnings.available_to_claim) || 0) + totalUsd,
            total_earned: (parseFloat(existingEarnings.total_earned) || 0) + totalUsd,
            updated_at: new Date().toISOString()
          })
          .eq('wallet_address', wallet);
      } else {
        await supabase
          .from('wallet_earnings')
          .insert({
            wallet_address: wallet,
            available_to_claim: totalUsd,
            total_earned: totalUsd
          });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        transaction,
        updatedBalance: txStatus === 'confirmed' ? totalUsd : 0
      }
    });

  } catch (error) {
    console.error('Error in transactions API:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const wallet = searchParams.get('wallet');

    if (!wallet) {
      return NextResponse.json(
        { error: 'Missing wallet parameter' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServerClient();

    const { data: transactions, error } = await supabase
      .from('energy_transactions')
      .select('*')
      .eq('wallet_address', wallet)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching transactions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch transactions' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: transactions || []
    });

  } catch (error) {
    console.error('Error in GET transactions API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}




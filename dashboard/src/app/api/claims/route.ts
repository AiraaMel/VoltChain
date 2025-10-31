import { NextRequest, NextResponse } from 'next/server';
import { Connection } from '@solana/web3.js';
import { createSupabaseServerClient } from '@/lib/supabase-client';

const SOLANA_RPC = process.env.NEXT_PUBLIC_SOLANA_RPC || 'https://api.devnet.solana.com';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { wallet, amount, signature } = body;

    if (!wallet || !amount || !signature) {
      return NextResponse.json(
        { error: 'Missing required fields: wallet, amount, signature' },
        { status: 400 }
      );
    }

    const amountValue = parseFloat(amount);

    if (amountValue <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Verify transaction on-chain
    const connection = new Connection(SOLANA_RPC);
    let txStatus = 'pending';
    
    try {
      const tx = await connection.getTransaction(signature, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0
      });
      
      if (tx && tx.meta && tx.meta.err === null) {
        txStatus = 'confirmed';
      } else {
        txStatus = 'failed';
      }
    } catch (error) {
      console.error('Error verifying claim transaction:', error);
      txStatus = 'failed';
    }

    const supabase = createSupabaseServerClient();

    // Check available balance
    const { data: earnings } = await supabase
      .from('wallet_earnings')
      .select('available_to_claim')
      .eq('wallet_address', wallet)
      .single();

    const availableBalance = parseFloat(earnings?.available_to_claim || '0');

    if (amountValue > availableBalance) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Insert claim
    const { data: claim, error: claimError } = await supabase
      .from('claims')
      .insert({
        wallet_address: wallet,
        amount: amountValue,
        claim_tx_signature: signature,
        status: txStatus,
        completed_at: txStatus === 'confirmed' ? new Date().toISOString() : null
      })
      .select()
      .single();

    if (claimError) {
      console.error('Error inserting claim:', claimError);
      return NextResponse.json(
        { error: 'Failed to insert claim' },
        { status: 500 }
      );
    }

    // Update wallet earnings (deduct from available)
    if (txStatus === 'confirmed') {
      await supabase
        .from('wallet_earnings')
        .update({
          available_to_claim: availableBalance - amountValue,
          updated_at: new Date().toISOString()
        })
        .eq('wallet_address', wallet);
    }

    return NextResponse.json({
      success: true,
      data: {
        claim,
        remainingBalance: txStatus === 'confirmed' ? availableBalance - amountValue : availableBalance
      }
    });

  } catch (error) {
    console.error('Error in claims API:', error);
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

    const { data: claims, error } = await supabase
      .from('claims')
      .select('*')
      .eq('wallet_address', wallet)
      .order('requested_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching claims:', error);
      return NextResponse.json(
        { error: 'Failed to fetch claims' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: claims || []
    });

  } catch (error) {
    console.error('Error in GET claims API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}




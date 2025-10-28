import { Connection, PublicKey, Keypair, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

// Initialize Solana connection
const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
const connection = new Connection(rpcUrl, 'confirmed');

// Program ID (optional)
const programId = process.env.SOLANA_PROGRAM_ID ? new PublicKey(process.env.SOLANA_PROGRAM_ID) : null;

// Wallet keypair (optional)
let wallet: Keypair | null = null;

// Initialize wallet if secret is provided
if (process.env.SOLANA_WALLET_SECRET) {
  try {
    const secret = JSON.parse(process.env.SOLANA_WALLET_SECRET);
    wallet = Keypair.fromSecretKey(new Uint8Array(secret));
  } catch (error) {
    console.warn('Failed to parse SOLANA_WALLET_SECRET:', error);
  }
}

/**
 * Check if Solana is properly configured
 */
export function isSolanaConfigured(): boolean {
  return !!(programId && wallet);
}

/**
 * Send energy record to Solana blockchain
 * @param devicePubkey Device public key (using device_id for now)
 * @param kwh Energy generated in kWh
 * @param ts Timestamp in milliseconds
 * @returns Transaction result
 */
export async function sendRecordEnergy(
  devicePubkey: string | null, 
  kwh: number, 
  ts: number
): Promise<{ success: boolean; txid?: string; error?: string }> {
  try {
    // If not configured, simulate success
    if (!isSolanaConfigured()) {
      console.log('Solana not configured, simulating transaction...');
      return {
        success: true,
        txid: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
    }

    if (!wallet || !programId) {
      throw new Error('Wallet or program not configured');
    }

    // Create a simple transaction (placeholder)
    // In a real implementation, this would call your Solana program
    const transaction = new Transaction();
    
    // Add instruction to your program
    // For now, just a simple transfer as placeholder
    const recipient = new PublicKey(devicePubkey || '11111111111111111111111111111112');
    
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: recipient,
        lamports: 1000 // 0.000001 SOL
      })
    );

    // Set recent blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = wallet.publicKey;

    // Sign and send transaction
    transaction.sign(wallet);
    
    const signature = await connection.sendTransaction(transaction, [wallet]);
    
    // Wait for confirmation
    await connection.confirmTransaction(signature, 'confirmed');

    console.log(`Energy record sent to Solana: ${signature}`);
    console.log(`Device: ${devicePubkey}, Energy: ${kwh} kWh, Timestamp: ${ts}`);

    return {
      success: true,
      txid: signature
    };

  } catch (error) {
    console.error('Failed to send energy record to Solana:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get wallet balance (for debugging)
 */
export async function getWalletBalance(): Promise<number> {
  if (!wallet) {
    return 0;
  }

  try {
    const balance = await connection.getBalance(wallet.publicKey);
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error('Failed to get wallet balance:', error);
    return 0;
  }
}

/**
 * Get connection info
 */
export function getConnectionInfo() {
  return {
    rpcUrl,
    programId: programId?.toString(),
    walletPublicKey: wallet?.publicKey.toString(),
    isConfigured: isSolanaConfigured()
  };
}

/**
 * Anchor Client for VoltChain
 * Integration with Phantom Wallet and Anchor to interact with the Solana program
 */

import { AnchorProvider, Program, Wallet } from "@coral-xyz/anchor";
import { Connection, PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";
import idl from "@/lib/idl.json";

// VoltChain Program ID
const PROGRAM_ID = new PublicKey(idl.address);

// Connection to devnet
const DEVNET_ENDPOINT = "https://api.devnet.solana.com";

/**
 * Phantom wallet type
 */
interface PhantomWallet {
  publicKey: PublicKey | null;
  isPhantom?: boolean;
  connect(): Promise<{ publicKey: PublicKey }>;
  disconnect(): Promise<void>;
  signTransaction(transaction: Transaction | VersionedTransaction): Promise<Transaction | VersionedTransaction>;
  signAllTransactions(transactions: (Transaction | VersionedTransaction)[]): Promise<(Transaction | VersionedTransaction)[]>;
}

/**
 * Checks if Phantom is available and returns the wallet
 */
function getPhantomWallet(): PhantomWallet | null {
  if (typeof window === "undefined") return null;
  
  // @ts-ignore
  const wallet = window.solana as PhantomWallet;
  
  if (wallet && wallet.isPhantom) {
    return wallet;
  }
  
  return null;
}

/**
 * Creates an Anchor Provider with Phantom wallet
 */
async function createProvider(): Promise<AnchorProvider> {
  const wallet = getPhantomWallet();
  
  if (!wallet) {
    throw new Error("Phantom wallet is not available. Please install the Phantom Wallet extension.");
  }

  console.log("Connecting to Phantom wallet...");
  
  // Connect if not already connected
  if (!wallet.publicKey) {
    await wallet.connect();
  }
  
  if (!wallet.publicKey) {
    throw new Error("Failed to connect to Phantom wallet");
  }
  
  console.log("Phantom wallet connected:", wallet.publicKey.toBase58());

  const connection = new Connection(DEVNET_ENDPOINT, "confirmed");
  
  const provider = new AnchorProvider(
    connection,
    wallet as any,
    {
      commitment: "confirmed",
      preflightCommitment: "confirmed",
    }
  );

  return provider;
}

/**
 * Creates an instance of the Anchor program
 */
async function createProgram(): Promise<Program> {
  const provider = await createProvider();
  
  const program = new Program(
    idl as any,
    PROGRAM_ID,
    provider as any
  );

  console.log("VoltChain program loaded:", PROGRAM_ID.toBase58());
  
  return program;
}

/**
 * Simulates a transaction without sending to the blockchain
 * Shows program execution logs in the console
 */
export async function simulateWithPhantom(
  instructionName: string,
  args: any[],
  accounts: Record<string, PublicKey>
): Promise<void> {
  try {
    console.log("Starting transaction simulation...");
    
    const provider = await createProvider();
    const program = await createProgram();
    const connection = new Connection(DEVNET_ENDPOINT, "confirmed");

    console.log("Instruction:", instructionName);
    console.log("Arguments:", args);
    console.log("Accounts:", accounts);

    // Build the transaction
    const tx = await (program.methods as any)[instructionName](...args)
      .accounts(accounts)
      .transaction();

    // Get the latest blockhash
    const latestBlockhash = await connection.getLatestBlockhash("finalized");
    tx.recentBlockhash = latestBlockhash.blockhash;
    tx.feePayer = provider.wallet.publicKey;

    // Sign the transaction
    const signedTx = await provider.wallet.signTransaction(tx);

    // Simulate
    const simulation = await connection.simulateTransaction(signedTx, {
      commitment: "confirmed",
      replaceRecentBlockhash: true,
    });

    console.log("----------------------------------------");
    console.log("SIMULATION RESULT:");
    console.log("----------------------------------------");
    console.log("Error:", simulation.value.err ? JSON.stringify(simulation.value.err, null, 2) : "None");
    console.log("Compute Units (CU):", simulation.value.unitsConsumed || "N/A");
    console.log("Estimated fee:", simulation.value.fee || "N/A");
    console.log("Program logs:");
    
    if (simulation.value.logs && simulation.value.logs.length > 0) {
      simulation.value.logs.forEach((log: string, index: number) => {
        console.log(`  ${index + 1}. ${log}`);
      });
    } else {
      console.log("  No logs available");
    }
    
    console.log("----------------------------------------");
    
    if (simulation.value.err) {
      console.error("Simulation failed!");
      throw new Error(`Simulation failed: ${JSON.stringify(simulation.value.err)}`);
    }

    console.log("Simulation successful!");
    
  } catch (error) {
    console.error("Error simulating transaction:", error);
    throw error;
  }
}

/**
 * Sends a real transaction to the blockchain
 * Opens Phantom modal for user to sign
 */
export async function sendWithPhantom(
  instructionName: string,
  args: any[],
  accounts: Record<string, PublicKey>
): Promise<string> {
  try {
    console.log("Starting transaction send...");
    
    const provider = await createProvider();
    const program = await createProgram();

    console.log("Instruction:", instructionName);
    console.log("Arguments:", args);
    console.log("Accounts:", accounts);

    // Send transaction using Anchor RPC
    const txSig = await (program.methods as any)[instructionName](...args)
      .accounts(accounts)
      .rpc({
        commitment: "confirmed",
        skipPreflight: false,
      });

    console.log("----------------------------------------");
    console.log("TRANSACTION SENT SUCCESSFULLY!");
    console.log("----------------------------------------");
    console.log("Signature:", txSig);
    console.log("Explorer:", `https://solscan.io/tx/${txSig}?cluster=devnet`);
    console.log("----------------------------------------");

    return txSig;
    
  } catch (error) {
    console.error("Error sending transaction:", error);
    throw error;
  }
}

/**
 * Helper functions to get common PDAs
 */

/**
 * Gets the Pool account address (PDA with seed "pool")
 */
export async function getPoolAddress(): Promise<PublicKey> {
  const [poolAddress] = await PublicKey.findProgramAddress(
    [Buffer.from("pool")],
    PROGRAM_ID
  );
  return poolAddress;
}

/**
 * Gets the UserPosition address (PDA with seed "user_position" + owner)
 */
export async function getUserPositionAddress(owner: PublicKey): Promise<PublicKey> {
  const [userPositionAddress] = await PublicKey.findProgramAddress(
    [Buffer.from("user_position"), owner.toBuffer()],
    PROGRAM_ID
  );
  return userPositionAddress;
}

/**
 * Gets the UserClaim address (PDA with seed "user_claim" + owner + saleId)
 */
export async function getUserClaimAddress(owner: PublicKey, saleId: number): Promise<PublicKey> {
  const saleIdBuffer = Buffer.allocUnsafe(8);
  saleIdBuffer.writeBigUInt64LE(BigInt(saleId), 0);
  
  const [userClaimAddress] = await PublicKey.findProgramAddress(
    [Buffer.from("user_claim"), owner.toBuffer(), saleIdBuffer],
    PROGRAM_ID
  );
  return userClaimAddress;
}

/**
 * Gets the Sale address (PDA with seed "sale" + pool.period)
 */
export async function getSaleAddress(poolPeriod: number): Promise<PublicKey> {
  const periodBuffer = Buffer.allocUnsafe(8);
  periodBuffer.writeBigUInt64LE(BigInt(poolPeriod), 0);
  
  const [saleAddress] = await PublicKey.findProgramAddress(
    [Buffer.from("sale"), periodBuffer],
    PROGRAM_ID
  );
  return saleAddress;
}

/**
 * Usage example:
 * 
 * // Simulate user registration
 * await simulateWithPhantom(
 *   "register_user",
 *   [],
 *   {
 *     userPosition: await getUserPositionAddress(provider.wallet.publicKey),
 *     owner: provider.wallet.publicKey,
 *     systemProgram: new PublicKey("11111111111111111111111111111111"),
 *   }
 * );
 * 
 * // Send energy report
 * await sendWithPhantom(
 *   "energy_report",
 *   [1000000], // 1 kWh in micro kWh (1_000_000)
 *   {
 *     pool: await getPoolAddress(),
 *     userPosition: await getUserPositionAddress(provider.wallet.publicKey),
 *     owner: provider.wallet.publicKey,
 *   }
 * );
 */


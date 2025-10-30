/**
 * Anchor Client for VoltChain
 * Integração com Phantom Wallet e Anchor para interagir com o programa Solana
 */

import { AnchorProvider, Program, Wallet } from "@coral-xyz/anchor";
import { Connection, PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";
import idl from "@/lib/idl.json";

// Program ID do VoltChain
const PROGRAM_ID = new PublicKey(idl.address);

// Connection para devnet
const DEVNET_ENDPOINT = "https://api.devnet.solana.com";

/**
 * Tipo para a wallet Phantom
 */
interface PhantomWallet extends Wallet {
  isPhantom?: boolean;
  connect(): Promise<{ publicKey: PublicKey }>;
  disconnect(): Promise<void>;
  signTransaction(transaction: Transaction | VersionedTransaction): Promise<Transaction | VersionedTransaction>;
  signAllTransactions(transactions: (Transaction | VersionedTransaction)[]): Promise<(Transaction | VersionedTransaction)[]>;
}

/**
 * Verifica se Phantom está disponível e retorna a wallet
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
 * Cria um Anchor Provider com a wallet Phantom
 */
async function createProvider(): Promise<AnchorProvider> {
  const wallet = getPhantomWallet();
  
  if (!wallet) {
    throw new Error("Phantom não está disponível. Por favor, instale a extensão Phantom Wallet.");
  }

  console.log("🔗 Conectando à wallet Phantom...");
  
  // Conectar se não estiver conectado
  if (!wallet.publicKey) {
    await wallet.connect();
  }
  
  console.log("✅ Wallet Phantom conectada:", wallet.publicKey.toBase58());

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
 * Cria uma instância do programa Anchor
 */
async function createProgram(): Promise<Program> {
  const provider = await createProvider();
  
  const program = new Program(
    idl as any,
    PROGRAM_ID,
    provider
  );

  console.log("📋 Programa VoltChain carregado:", PROGRAM_ID.toBase58());
  
  return program;
}

/**
 * Simula uma transação sem enviar para a blockchain
 * Mostra os logs da execução do programa no console
 */
export async function simulateWithPhantom(
  instructionName: string,
  args: any[],
  accounts: Record<string, PublicKey>
): Promise<void> {
  try {
    console.log("🎲 Iniciando simulação de transação...");
    
    const provider = await createProvider();
    const program = await createProgram();
    const connection = new Connection(DEVNET_ENDPOINT, "confirmed");

    console.log("📝 Instrução:", instructionName);
    console.log("📦 Argumentos:", args);
    console.log("🏦 Contas:", accounts);

    // Montar a transação
    const tx = await (program.methods as any)[instructionName](...args)
      .accounts(accounts)
      .transaction();

    // Obter o blockhash mais recente
    const latestBlockhash = await connection.getLatestBlockhash("finalized");
    tx.recentBlockhash = latestBlockhash.blockhash;
    tx.feePayer = provider.wallet.publicKey;

    // Assinar a transação
    const signedTx = await provider.wallet.signTransaction(tx);

    // Simular
    const simulation = await connection.simulateTransaction(signedTx, {
      commitment: "confirmed",
      replaceRecentBlockhash: true,
    });

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📊 RESULTADO DA SIMULAÇÃO:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ Erro:", simulation.value.err ? JSON.stringify(simulation.value.err, null, 2) : "Nenhum");
    console.log("📈 Unidades de Computação (CU):", simulation.value.unitsConsumed || "N/A");
    console.log("💰 Taxa estimada:", simulation.value.fee || "N/A");
    console.log("📋 Logs do programa:");
    
    if (simulation.value.logs && simulation.value.logs.length > 0) {
      simulation.value.logs.forEach((log: string, index: number) => {
        console.log(`  ${index + 1}. ${log}`);
      });
    } else {
      console.log("  Nenhum log disponível");
    }
    
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    if (simulation.value.err) {
      console.error("❌ Simulação falhou!");
      throw new Error(`Simulation failed: ${JSON.stringify(simulation.value.err)}`);
    }

    console.log("✅ Simulação bem-sucedida!");
    
  } catch (error) {
    console.error("❌ Erro ao simular transação:", error);
    throw error;
  }
}

/**
 * Envia uma transação real para a blockchain
 * Abre o modal da Phantom para o usuário assinar
 */
export async function sendWithPhantom(
  instructionName: string,
  args: any[],
  accounts: Record<string, PublicKey>
): Promise<string> {
  try {
    console.log("📤 Iniciando envio de transação...");
    
    const provider = await createProvider();
    const program = await createProgram();

    console.log("📝 Instrução:", instructionName);
    console.log("📦 Argumentos:", args);
    console.log("🏦 Contas:", accounts);

    // Enviar transação usando RPC do Anchor
    const txSig = await (program.methods as any)[instructionName](...args)
      .accounts(accounts)
      .rpc({
        commitment: "confirmed",
        skipPreflight: false,
      });

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ TRANSAÇÃO ENVIADA COM SUCESSO!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🔗 Signature:", txSig);
    console.log("🌐 Explorer:", `https://solscan.io/tx/${txSig}?cluster=devnet`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    return txSig;
    
  } catch (error) {
    console.error("❌ Erro ao enviar transação:", error);
    throw error;
  }
}

/**
 * Funções auxiliares para obter PDAs comuns
 */

/**
 * Obtém o endereço da conta Pool (PDA com seed "pool")
 */
export async function getPoolAddress(): Promise<PublicKey> {
  const [poolAddress] = await PublicKey.findProgramAddress(
    [Buffer.from("pool")],
    PROGRAM_ID
  );
  return poolAddress;
}

/**
 * Obtém o endereço da UserPosition (PDA com seed "user_position" + owner)
 */
export async function getUserPositionAddress(owner: PublicKey): Promise<PublicKey> {
  const [userPositionAddress] = await PublicKey.findProgramAddress(
    [Buffer.from("user_position"), owner.toBuffer()],
    PROGRAM_ID
  );
  return userPositionAddress;
}

/**
 * Obtém o endereço da UserClaim (PDA com seed "user_claim" + owner + saleId)
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
 * Obtém o endereço da Sale (PDA com seed "sale" + pool.period)
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
 * Exemplo de uso:
 * 
 * // Simular registro de usuário
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
 * // Enviar relatório de energia
 * await sendWithPhantom(
 *   "energy_report",
 *   [1000000], // 1 kWh em micro kWh (1_000_000)
 *   {
 *     pool: await getPoolAddress(),
 *     userPosition: await getUserPositionAddress(provider.wallet.publicKey),
 *     owner: provider.wallet.publicKey,
 *   }
 * );
 */


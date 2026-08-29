import { BrowserProvider, Contract, JsonRpcProvider, type Signer } from "ethers";
import collectionAbiJson from "../../abi/NFTCollection.json";
import type { PublicEnv } from "./env";

/** ABI de la colección (Foundry artifact → campo `abi`). */
export const collectionAbi = collectionAbiJson.abi;

/**
 * Provider de solo lectura hacia el RPC configurado.
 * @param {string} rpcUrl
 * @returns {JsonRpcProvider}
 */
export function createReadProvider(rpcUrl: string): JsonRpcProvider {
  return new JsonRpcProvider(rpcUrl);
}

/**
 * Contrato de lectura (sin signer).
 * @param {PublicEnv} env
 * @param {JsonRpcProvider} [provider]
 */
export function createReadContracts(env: PublicEnv, provider?: JsonRpcProvider) {
  const p = provider ?? createReadProvider(env.NEXT_PUBLIC_RPC_URL);
  return {
    provider: p,
    collection: new Contract(env.NEXT_PUBLIC_COLLECTION_ADDRESS, collectionAbi, p),
  };
}

/**
 * Contrato conectado a un signer (wallet).
 * @param {PublicEnv} env
 * @param {Signer} signer
 */
export function createWriteContracts(env: PublicEnv, signer: Signer) {
  return {
    collection: new Contract(env.NEXT_PUBLIC_COLLECTION_ADDRESS, collectionAbi, signer),
  };
}

/**
 * Obtiene BrowserProvider desde `window.ethereum` (MetaMask / inyectado).
 * @throws {Error} Si no hay wallet inyectada.
 * @returns {BrowserProvider}
 */
export function getBrowserProvider(): BrowserProvider {
  const eth = typeof window !== "undefined" ? window.ethereum : undefined;
  if (!eth) {
    throw new Error("No hay wallet inyectada (instala MetaMask u otra).");
  }
  return new BrowserProvider(eth);
}

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on?: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
    };
  }
}

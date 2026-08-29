"use client";

import { useCallback, useEffect, useState } from "react";
import type { Signer } from "ethers";
import { createReadContracts, createWriteContracts } from "@/lib/contracts";
import type { PublicEnv } from "@/lib/env";
import { humanizeError } from "@/lib/errors";
import { parseAddress, parseEthInput, parseQuantity } from "@/lib/format";

export type CollectionSnapshot = {
  name: string;
  symbol: string;
  maxSupply: bigint;
  totalSupply: bigint;
  baseURI: string;
  owner: string;
  balance: bigint;
  royaltyReceiver: string;
  royaltyAmount: bigint;
};

const emptySnap = (): CollectionSnapshot => ({
  name: "—",
  symbol: "—",
  maxSupply: 0n,
  totalSupply: 0n,
  baseURI: "",
  owner: "",
  balance: 0n,
  royaltyReceiver: "",
  royaltyAmount: 0n,
});

/**
 * Lectura + acciones de la colección NFT (mint, transfer, URI, royalty).
 * @param {PublicEnv | null} env
 * @param {string | null} address
 * @param {Signer | null} signer
 */
export function useNftCollection(
  env: PublicEnv | null,
  address: string | null,
  signer: Signer | null,
) {
  const [snap, setSnap] = useState<CollectionSnapshot>(emptySnap);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [tokenUri, setTokenUri] = useState<string | null>(null);
  const [lookedUpOwner, setLookedUpOwner] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!env) return;
    try {
      const { collection } = createReadContracts(env);
      const salePrice = 10n ** 18n;
      const [
        name,
        symbol,
        maxSupply,
        totalSupply,
        baseURI,
        owner,
        royalty,
      ] = await Promise.all([
        collection.name() as Promise<string>,
        collection.symbol() as Promise<string>,
        collection.maxSupply() as Promise<bigint>,
        collection.totalSupply() as Promise<bigint>,
        collection.baseURI() as Promise<string>,
        collection.owner() as Promise<string>,
        collection.royaltyInfo(0, salePrice) as Promise<[string, bigint]>,
      ]);

      let balance = 0n;
      if (address) {
        balance = (await collection.balanceOf(address)) as bigint;
      }

      setSnap({
        name,
        symbol,
        maxSupply,
        totalSupply,
        baseURI,
        owner,
        balance,
        royaltyReceiver: royalty[0],
        royaltyAmount: royalty[1],
      });
      setError(null);
    } catch (err) {
      setError(humanizeError(err));
    }
  }, [env, address]);

  useEffect(() => {
    void refresh();
    const id = setInterval(() => void refresh(), 12_000);
    return () => clearInterval(id);
  }, [refresh]);

  const run = useCallback(
    async (label: string, fn: () => Promise<{ hash: string }>) => {
      setBusy(label);
      setError(null);
      setTxHash(null);
      try {
        const tx = await fn();
        setTxHash(tx.hash);
        await refresh();
      } catch (err) {
        setError(humanizeError(err));
      } finally {
        setBusy(null);
      }
    },
    [refresh],
  );

  const isOwner =
    !!address &&
    !!snap.owner &&
    address.toLowerCase() === snap.owner.toLowerCase();

  const mint = useCallback(
    async (toInput: string) => {
      if (!env || !signer) return;
      const to = parseAddress(toInput);
      const { collection } = createWriteContracts(env, signer);
      await run("mint", async () => {
        const tx = await collection.mint(to);
        await tx.wait();
        return tx;
      });
    },
    [env, signer, run],
  );

  const safeMint = useCallback(
    async (toInput: string) => {
      if (!env || !signer) return;
      const to = parseAddress(toInput);
      const { collection } = createWriteContracts(env, signer);
      await run("safeMint", async () => {
        const tx = await collection.safeMint(to);
        await tx.wait();
        return tx;
      });
    },
    [env, signer, run],
  );

  const mintBatch = useCallback(
    async (toInput: string, quantityInput: string) => {
      if (!env || !signer) return;
      const to = parseAddress(toInput);
      const quantity = parseQuantity(quantityInput);
      const { collection } = createWriteContracts(env, signer);
      await run("mintBatch", async () => {
        const tx = await collection.mintBatch(to, quantity);
        await tx.wait();
        return tx;
      });
    },
    [env, signer, run],
  );

  const transfer = useCallback(
    async (toInput: string, tokenIdInput: string) => {
      if (!env || !signer || !address) return;
      const to = parseAddress(toInput);
      const tokenId = parseQuantity(tokenIdInput);
      const { collection } = createWriteContracts(env, signer);
      await run("transfer", async () => {
        const tx = await collection.safeTransferFrom(address, to, tokenId);
        await tx.wait();
        return tx;
      });
    },
    [env, signer, address, run],
  );

  const setBaseURI = useCallback(
    async (uri: string) => {
      if (!env || !signer) return;
      const { collection } = createWriteContracts(env, signer);
      await run("setBaseURI", async () => {
        const tx = await collection.setBaseURI(uri);
        await tx.wait();
        return tx;
      });
    },
    [env, signer, run],
  );

  const lookupToken = useCallback(
    async (tokenIdInput: string, salePriceInput: string) => {
      if (!env) return;
      setError(null);
      try {
        const tokenId = parseQuantity(tokenIdInput);
        const salePrice = parseEthInput(salePriceInput || "1");
        const { collection } = createReadContracts(env);
        const [uri, ownerOf, royalty] = await Promise.all([
          collection.tokenURI(tokenId) as Promise<string>,
          collection.ownerOf(tokenId) as Promise<string>,
          collection.royaltyInfo(tokenId, salePrice) as Promise<[string, bigint]>,
        ]);
        setTokenUri(uri);
        setLookedUpOwner(ownerOf);
        setSnap((s) => ({
          ...s,
          royaltyReceiver: royalty[0],
          royaltyAmount: royalty[1],
        }));
      } catch (err) {
        setTokenUri(null);
        setLookedUpOwner(null);
        setError(humanizeError(err));
      }
    },
    [env],
  );

  return {
    snap,
    busy,
    error,
    txHash,
    tokenUri,
    lookedUpOwner,
    isOwner,
    refresh,
    mint,
    safeMint,
    mintBatch,
    transfer,
    setBaseURI,
    lookupToken,
  };
}

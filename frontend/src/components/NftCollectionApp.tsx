"use client";

import { useMemo, useState } from "react";
import { safeParsePublicEnv, type PublicEnv } from "@/lib/env";
import { useWallet } from "@/hooks/useWallet";
import { useNftCollection } from "@/hooks/useNftCollection";
import { formatEth, shortAddress } from "@/lib/format";
import { ThemeToggle } from "@/components/ThemeToggle";

/**
 * Demo UI: conectar wallet, mint (owner), transfer, consultar tokenURI y royalty.
 * @returns {JSX.Element}
 */
export function NftCollectionApp() {
  const envResult = useMemo(() => safeParsePublicEnv(), []);
  const env: PublicEnv | null = envResult.success ? envResult.data : null;

  const wallet = useWallet(env);
  const nft = useNftCollection(env, wallet.address, wallet.signer);

  const [mintTo, setMintTo] = useState("");
  const [batchQty, setBatchQty] = useState("3");
  const [transferTo, setTransferTo] = useState("");
  const [transferId, setTransferId] = useState("0");
  const [lookupId, setLookupId] = useState("0");
  const [salePrice, setSalePrice] = useState("1");
  const [newBaseUri, setNewBaseUri] = useState("");

  if (!envResult.success || !env) {
    return (
      <div className="app-grid">
        <div className="hero-top">
          <ThemeToggle />
        </div>
        <section className="panel" role="alert">
          <h2 className="panel-title">Falta configuración</h2>
          <p className="muted">
            Copia <code>.env.example</code> → <code>.env.local</code> con la
            address del deploy Anvil (ver <code>doc/DEPLOY.md</code>).
          </p>
          <pre className="error-box">
            {envResult.success ? "Env incompleto" : envResult.error.message}
          </pre>
        </section>
      </div>
    );
  }

  const { snap } = nft;
  const mintTarget = mintTo || wallet.address || "";

  return (
    <div className="app-grid">
      <header className="hero">
        <div className="hero-top">
          <ThemeToggle />
        </div>
        <p className="brand">NFTCollection</p>
        <h1 className="headline">ERC-721 · ERC-2981</h1>
        <p className="lede">
          Mint curado, metadata dinámica y royalties on-chain.
        </p>
        <div className="cta-row">
          {!wallet.address ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => void wallet.connect()}
              disabled={wallet.connecting}
            >
              {wallet.connecting ? "Conectando…" : "Conectar wallet"}
            </button>
          ) : (
            <>
              <span className="pill" data-testid="wallet-address">
                {shortAddress(wallet.address)}
              </span>
              {nft.isOwner && (
                <span className="pill accent" data-testid="owner-badge">
                  Owner
                </span>
              )}
              <button type="button" className="btn btn-ghost" onClick={wallet.disconnect}>
                Desconectar
              </button>
            </>
          )}
        </div>
        {(wallet.error || wallet.wrongChain) && (
          <p className="warn" role="status">
            {wallet.wrongChain
              ? `Red incorrecta (esperada ${env.NEXT_PUBLIC_CHAIN_ID})`
              : wallet.error}
          </p>
        )}
      </header>

      <section className="panel" aria-label="Colección">
        <h2 className="panel-title">Colección</h2>
        <dl className="stats">
          <div>
            <dt>Nombre</dt>
            <dd data-testid="collection-name">{snap.name}</dd>
          </div>
          <div>
            <dt>Símbolo</dt>
            <dd data-testid="collection-symbol">{snap.symbol}</dd>
          </div>
          <div>
            <dt>Supply</dt>
            <dd data-testid="total-supply">
              {snap.totalSupply.toString()} / {snap.maxSupply.toString()}
            </dd>
          </div>
          <div>
            <dt>Tu balance</dt>
            <dd data-testid="wallet-balance">{snap.balance.toString()}</dd>
          </div>
        </dl>
        <p className="muted tiny">
          Base URI: <code data-testid="base-uri">{snap.baseURI || "—"}</code>
        </p>
        <p className="muted tiny">
          Royalty default (sale 1 ETH): {shortAddress(snap.royaltyReceiver || "0x0")} ·{" "}
          <span data-testid="royalty-amount">{formatEth(snap.royaltyAmount)} ETH</span>
        </p>
      </section>

      <section className="panel" aria-label="Mint">
        <h2 className="panel-title">Mint (owner)</h2>
        <label className="field">
          <span>Destinatario</span>
          <input
            data-testid="mint-to-input"
            value={mintTo}
            onChange={(e) => setMintTo(e.target.value)}
            placeholder={wallet.address ?? "0x…"}
            disabled={!wallet.address || !!nft.busy}
          />
        </label>
        <label className="field">
          <span>Cantidad batch</span>
          <input
            data-testid="batch-qty-input"
            value={batchQty}
            onChange={(e) => setBatchQty(e.target.value)}
            inputMode="numeric"
            placeholder="3"
            disabled={!wallet.address || !!nft.busy}
          />
        </label>
        <div className="actions">
          <button
            type="button"
            className="btn btn-primary"
            disabled={!wallet.address || !nft.isOwner || !!nft.busy}
            onClick={() => void nft.mint(mintTarget)}
          >
            {nft.busy === "mint" ? "…" : "Mint"}
          </button>
          <button
            type="button"
            className="btn"
            disabled={!wallet.address || !nft.isOwner || !!nft.busy}
            onClick={() => void nft.safeMint(mintTarget)}
          >
            {nft.busy === "safeMint" ? "…" : "Safe mint"}
          </button>
          <button
            type="button"
            className="btn"
            disabled={!wallet.address || !nft.isOwner || !!nft.busy}
            onClick={() => void nft.mintBatch(mintTarget, batchQty)}
          >
            {nft.busy === "mintBatch" ? "…" : "Mint batch"}
          </button>
        </div>
        {!nft.isOwner && wallet.address && (
          <p className="warn" data-testid="not-owner-hint">
            Solo el owner puede mintear o cambiar la base URI.
          </p>
        )}
      </section>

      <section className="panel" aria-label="Transfer">
        <h2 className="panel-title">Transfer</h2>
        <label className="field">
          <span>Token ID</span>
          <input
            data-testid="transfer-id-input"
            value={transferId}
            onChange={(e) => setTransferId(e.target.value)}
            inputMode="numeric"
            disabled={!wallet.address || !!nft.busy}
          />
        </label>
        <label className="field">
          <span>Destino</span>
          <input
            data-testid="transfer-to-input"
            value={transferTo}
            onChange={(e) => setTransferTo(e.target.value)}
            placeholder="0x…"
            disabled={!wallet.address || !!nft.busy}
          />
        </label>
        <div className="actions">
          <button
            type="button"
            className="btn btn-primary"
            disabled={!wallet.address || !!nft.busy || !transferTo}
            onClick={() => void nft.transfer(transferTo, transferId)}
          >
            {nft.busy === "transfer" ? "…" : "Safe transfer"}
          </button>
        </div>
      </section>

      <section className="panel" aria-label="Lookup">
        <h2 className="panel-title">TokenURI · Royalty</h2>
        <label className="field">
          <span>Token ID</span>
          <input
            data-testid="lookup-id-input"
            value={lookupId}
            onChange={(e) => setLookupId(e.target.value)}
            inputMode="numeric"
            disabled={!!nft.busy}
          />
        </label>
        <label className="field">
          <span>Sale price (ETH)</span>
          <input
            data-testid="sale-price-input"
            value={salePrice}
            onChange={(e) => setSalePrice(e.target.value)}
            inputMode="decimal"
            disabled={!!nft.busy}
          />
        </label>
        <div className="actions">
          <button
            type="button"
            className="btn"
            disabled={!!nft.busy}
            onClick={() => void nft.lookupToken(lookupId, salePrice)}
          >
            Consultar
          </button>
        </div>
        {nft.tokenUri && (
          <p className="muted tiny" data-testid="token-uri">
            URI: <code>{nft.tokenUri}</code>
          </p>
        )}
        {nft.lookedUpOwner && (
          <p className="muted tiny" data-testid="token-owner">
            Owner: {shortAddress(nft.lookedUpOwner)}
          </p>
        )}
      </section>

      <section className="panel" aria-label="Admin URI">
        <h2 className="panel-title">Base URI (owner)</h2>
        <label className="field">
          <span>Nueva base URI</span>
          <input
            data-testid="base-uri-input"
            value={newBaseUri}
            onChange={(e) => setNewBaseUri(e.target.value)}
            placeholder="https://cdn.example/meta/"
            disabled={!wallet.address || !nft.isOwner || !!nft.busy}
          />
        </label>
        <div className="actions">
          <button
            type="button"
            className="btn"
            disabled={!wallet.address || !nft.isOwner || !!nft.busy || !newBaseUri}
            onClick={() => void nft.setBaseURI(newBaseUri)}
          >
            {nft.busy === "setBaseURI" ? "…" : "Actualizar URI"}
          </button>
        </div>
      </section>

      {nft.error && (
        <p className="error-box" role="alert">
          {nft.error}
        </p>
      )}
      {nft.txHash && (
        <p className="muted tiny">
          Tx: <code>{shortAddress(nft.txHash, 6)}</code>
        </p>
      )}
      <button
        type="button"
        className="btn btn-ghost tiny-btn"
        onClick={() => void nft.refresh()}
      >
        Refrescar
      </button>
    </div>
  );
}

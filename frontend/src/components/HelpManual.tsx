"use client";

import { AppToolbar } from "@/components/AppToolbar";

/**
 * Manual de ayuda in-app de la demo NFTCollection.
 * @returns {JSX.Element}
 */
export function HelpManual() {
  return (
    <article className="app-grid help-manual">
      <header className="hero">
        <AppToolbar showHome />
        <p className="brand">Ayuda</p>
        <h1 className="headline">Manual de la demo</h1>
        <p className="lede">
          Guía rápida para conectar la wallet, mintear, transferir y consultar
          royalties.
        </p>
      </header>

      <section className="panel" aria-labelledby="help-req">
        <h2 className="panel-title" id="help-req">
          Requisitos
        </h2>
        <ul className="help-list">
          <li>
            <strong>Anvil</strong> corriendo en <code>http://127.0.0.1:8545</code>{" "}
            (chainId <code>31337</code>).
          </li>
          <li>
            Contrato desplegado con{" "}
            <code>forge script script/Deploy.s.sol:Deploy … --broadcast</code>.
          </li>
          <li>
            <code>frontend/.env.local</code> con{" "}
            <code>NEXT_PUBLIC_COLLECTION_ADDRESS</code> del deploy.
          </li>
          <li>
            MetaMask (u otra wallet) con la red Localhost y, para mintear, la
            cuenta Anvil #0 (owner).
          </li>
        </ul>
      </section>

      <section className="panel" aria-labelledby="help-wallet">
        <h2 className="panel-title" id="help-wallet">
          Conectar wallet
        </h2>
        <ol className="help-list">
          <li>
            Pulsa <strong>Conectar wallet</strong> en la home.
          </li>
          <li>
            Acepta la conexión en MetaMask. Si la red no es 31337, la app
            intentará cambiarla.
          </li>
          <li>
            Si eres el owner del contrato, verás el badge <strong>Owner</strong>.
          </li>
        </ol>
        <p className="muted tiny">
          Key Anvil #0 (solo demo):{" "}
          <code>0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80</code>
        </p>
      </section>

      <section className="panel" aria-labelledby="help-mint">
        <h2 className="panel-title" id="help-mint">
          Mint (solo owner)
        </h2>
        <ul className="help-list">
          <li>
            <strong>Destinatario</strong>: address que recibirá el NFT. Vacío =
            tu wallet conectada.
          </li>
          <li>
            <strong>Mint</strong>: un token sin chequeo de receiver (EOA).
          </li>
          <li>
            <strong>Safe mint</strong>: igual, pero exige{" "}
            <code>onERC721Received</code> si el destino es un contrato.
          </li>
          <li>
            <strong>Mint batch</strong>: varios tokens consecutivos (usa
            &quot;Cantidad batch&quot;).
          </li>
        </ul>
        <p className="muted tiny">
          Si no eres owner, los botones de mint quedan deshabilitados.
        </p>
      </section>

      <section className="panel" aria-labelledby="help-transfer">
        <h2 className="panel-title" id="help-transfer">
          Transfer
        </h2>
        <ol className="help-list">
          <li>
            Indica el <strong>Token ID</strong> que posees.
          </li>
          <li>
            Pega la address de <strong>Destino</strong>.
          </li>
          <li>
            Pulsa <strong>Safe transfer</strong> y confirma en la wallet.
          </li>
        </ol>
      </section>

      <section className="panel" aria-labelledby="help-lookup">
        <h2 className="panel-title" id="help-lookup">
          TokenURI · Royalty
        </h2>
        <ul className="help-list">
          <li>
            Introduce un <strong>Token ID</strong> existente y un{" "}
            <strong>Sale price (ETH)</strong>.
          </li>
          <li>
            <strong>Consultar</strong> muestra <code>tokenURI</code>, owner del
            token y royalty ERC-2981 para ese precio.
          </li>
          <li>
            La royalty global (1 ETH de ejemplo) también aparece en el panel
            Colección.
          </li>
        </ul>
      </section>

      <section className="panel" aria-labelledby="help-uri">
        <h2 className="panel-title" id="help-uri">
          Base URI (owner)
        </h2>
        <p className="muted">
          Cambia la raíz de metadata on-chain. Convención: termina en{" "}
          <code>/</code>. El <code>tokenURI</code> queda{" "}
          <code>baseURI + tokenId</code>.
        </p>
      </section>

      <section className="panel" aria-labelledby="help-theme">
        <h2 className="panel-title" id="help-theme">
          Tema claro / oscuro
        </h2>
        <p className="muted">
          Usa el botón <strong>Claro / Oscuro</strong> arriba a la derecha. La
          preferencia se guarda en el navegador (<code>localStorage</code>).
        </p>
      </section>

      <section className="panel" aria-labelledby="help-errors">
        <h2 className="panel-title" id="help-errors">
          Errores frecuentes
        </h2>
        <dl className="help-dl">
          <div>
            <dt>Falta configuración</dt>
            <dd>
              Completa <code>.env.local</code> con RPC, chainId y address de la
              colección.
            </dd>
          </div>
          <div>
            <dt>Red incorrecta</dt>
            <dd>Cambia MetaMask a Localhost 8545 / chainId 31337.</dd>
          </div>
          <div>
            <dt>MaxSupplyExceeded</dt>
            <dd>Se agotó el supply de la colección.</dd>
          </div>
          <div>
            <dt>Solo el owner…</dt>
            <dd>
              Conecta la cuenta que desplegó el contrato (Anvil #0 en demo).
            </dd>
          </div>
          <div>
            <dt>ERC721InvalidReceiver</dt>
            <dd>
              Safe mint/transfer a un contrato sin{" "}
              <code>onERC721Received</code>.
            </dd>
          </div>
        </dl>
      </section>

      <section className="panel" aria-labelledby="help-more">
        <h2 className="panel-title" id="help-more">
          Más documentación
        </h2>
        <ul className="help-list">
          <li>
            Repo: <code>doc/FRONTEND.md</code>, <code>doc/DEPLOY.md</code>,{" "}
            <code>doc/MANUAL-FRONTEND.md</code>
          </li>
          <li>
            Contratos: <code>doc/00-plan-implementacion.md</code>
          </li>
        </ul>
      </section>
    </article>
  );
}

# Handoff — módulo 04 ERC-721

> 🌐 [English](./HANDOFF-EN.md) · **Español**

Guía para un tercero que hereda el módulo: qué hay, cómo verificarlo y dónde mirar.

**Estado:** Fases **0–7** cerradas (2026-08-29).

---

## 1. Qué entrega este módulo

| Pieza | Ubicación |
|-------|-----------|
| Colección ERC-721 + ERC-2981 + Ownable2Step | `src/NFTCollection.sol` |
| Superficie pública | `src/interfaces/INFTCollection.sol` |
| Mocks de receiver / ataque | `src/mocks/` |
| Tests unit / fuzz / invariant / attack | `test/` |
| Deploy Anvil + export ABI | `script/Deploy.s.sol`, `script/export-abi.sh` |
| Demo UI (Next.js 15 + ethers v6) | `frontend/` |
| Página portafolio ES/EN | `portfolio/` |
| Docs | `doc/` |

**Decisiones v1 (congeladas):** mint **onlyOwner**; `tokenId` desde **0**; `tokenURI = baseURI + id`; sin Pausable / Enumerable / allowlist / reveal.

---

## 2. Verificación rápida

```bash
export PATH="$HOME/.foundry/bin:$PATH"
cd 04-erc721

forge build
forge test          # ~58 tests

cd frontend
# Node ≥ 20 (recomendado: nvm use 22)
npm test            # 9 tests
npm run build
```

Deploy + UI local: [`DEPLOY-ES.md`](./DEPLOY-ES.md) · [`FRONTEND-ES.md`](./FRONTEND-ES.md) · [`MANUAL-FRONTEND-ES.md`](./MANUAL-FRONTEND-ES.md).  
Ayuda in-app: `http://localhost:3000/ayuda` (botón **? Ayuda**).

---

## 3. Mapa de documentación

| Doc | Uso |
|-----|-----|
| [`00-plan-implementacion-ES.md`](./00-plan-implementacion-ES.md) | Plan por fases + DoD |
| [`01-diagrama-clases-ES.md`](./01-diagrama-clases-ES.md) | Clases / herencia (as-built) |
| [`02-diagrama-flujo-ES.md`](./02-diagrama-flujo-ES.md) | Secuencias |
| [`03-flujograma-ES.md`](./03-flujograma-ES.md) | Decisiones |
| [`SWC-AUDIT-ES.md`](./SWC-AUDIT-ES.md) | SWC-100–136 |
| [`ATAQUES-ES.md`](./ATAQUES-ES.md) | Campañas + tests |
| [`GAS-ES.md`](./GAS-ES.md) | Baseline gas |
| [`DEPLOY-ES.md`](./DEPLOY-ES.md) | Anvil / testnet / ABI |
| [`FRONTEND-ES.md`](./FRONTEND-ES.md) | Setup UI |
| [`MANUAL-FRONTEND-ES.md`](./MANUAL-FRONTEND-ES.md) | Manual de usuario UI |
| [`LIMITACIONES-ES.md`](./LIMITACIONES-ES.md) | Fuera de alcance / known limits |
| [`DECISIONES-TECNICAS-ES.md`](./DECISIONES-TECNICAS-ES.md) | Decisiones, lógica del contrato, gas |
| [`MEJORAS-ES.md`](./MEJORAS-ES.md) | Backlog opcional |

---

## 4. Contratos — puntos clave

- **Compiler:** `pragma solidity 0.8.24;` (fijo).
- **Supply:** `MAX_SUPPLY` immutable; `_totalMinted` + `_nextTokenId`; guards en `_reserveMint`.
- **Mint:** `mint` / `safeMint` / `mintBatch` / `safeMintBatch` — solo owner.
- **Safe paths:** OZ `onERC721Received` si destino es contrato.
- **Admin:** `setBaseURI`, royalties default/token/delete/reset — `onlyOwner` + Ownable2Step.
- **Interfaces:** ERC-165 / 721 / 721 Metadata / 2981 vía `supportsInterface`.
- **Errores:** custom en `INFTCollection` (+ errores OZ en transfers/Ownable).

---

## 5. Frontend — puntos clave

| Tema | Detalle |
|------|---------|
| Node | **≥ 20** (`engines`); recomendado **22** (`nvm use 22`) |
| Env | `NEXT_PUBLIC_RPC_URL`, `NEXT_PUBLIC_CHAIN_ID`, `NEXT_PUBLIC_COLLECTION_ADDRESS` (acceso estático en `env.ts`) |
| Tema | Claro/oscuro: `data-theme` + `localStorage` (`nft-theme`); toggle en toolbar |
| Ayuda | Ruta `/ayuda` + botón **? Ayuda** |
| ABIs | `frontend/abi/` (regenerar con `./script/export-abi.sh`) |

---

## 6. Credenciales demo (solo Anvil local)

| Rol | Valor |
|-----|--------|
| Anvil #0 (owner) | `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` |
| Private key #0 | `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80` |
| Chain | `31337` · RPC `http://127.0.0.1:8545` |

**Nunca** usar esas keys en mainnet / fondos reales.

---

## 7. Checklist de handoff

- [ ] `forge test` verde
- [ ] `frontend`: `npm test` + `npm run build` (Node ≥ 20)
- [ ] Anvil + `Deploy.s.sol` + `.env.local` + UI mint/transfer/lookup
- [ ] Leídos LIMITACIONES y MEJORAS
- [ ] Remotes: preferir SSH a GitHub si HTTPS falla (401)

---

## 8. Contacto de contexto

Plan y protocolo de fases: `.cursorrules` + `doc/00-plan-implementacion-ES.md`.  
Módulo hermano en monorepo: suite `evm-smart-contracts-suite`.

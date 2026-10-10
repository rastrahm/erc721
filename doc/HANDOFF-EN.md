# Handoff — module 04 ERC-721

> 🌐 **English** · [Español](./HANDOFF-ES.md)

Guide for a third party inheriting the module: what is included, how to verify it and where to look.

**Status:** Phases **0–7** closed (2026-08-29).

---

## 1. What this module delivers

| Piece | Location |
|-------|----------|
| ERC-721 + ERC-2981 + Ownable2Step collection | `src/NFTCollection.sol` |
| Public surface | `src/interfaces/INFTCollection.sol` |
| Receiver / attack mocks | `src/mocks/` |
| Unit / fuzz / invariant / attack tests | `test/` |
| Anvil deploy + ABI export | `script/Deploy.s.sol`, `script/export-abi.sh` |
| Demo UI (Next.js 15 + ethers v6) | `frontend/` |
| ES/EN portfolio page | `portfolio/` |
| Docs | `doc/` |

**v1 decisions (frozen):** mint is **onlyOwner**; `tokenId` starts at **0**; `tokenURI = baseURI + id`; no Pausable / Enumerable / allowlist / reveal.

---

## 2. Quick verification

```bash
export PATH="$HOME/.foundry/bin:$PATH"
cd 04-erc721

forge build
forge test          # ~58 tests

cd frontend
# Node ≥ 20 (recommended: nvm use 22)
npm test            # 9 tests
npm run build
```

Local deploy + UI: [`DEPLOY-EN.md`](./DEPLOY-EN.md) · [`FRONTEND-EN.md`](./FRONTEND-EN.md) · [`MANUAL-FRONTEND-EN.md`](./MANUAL-FRONTEND-EN.md).  
In-app help: `http://localhost:3000/ayuda` (**? Ayuda** (? Help) button).

---

## 3. Documentation map

| Doc | Purpose |
|-----|---------|
| [`00-plan-implementacion-EN.md`](./00-plan-implementacion-EN.md) | Phased plan + DoD |
| [`01-diagrama-clases-EN.md`](./01-diagrama-clases-EN.md) | Classes / inheritance (as-built) |
| [`02-diagrama-flujo-EN.md`](./02-diagrama-flujo-EN.md) | Sequences |
| [`03-flujograma-EN.md`](./03-flujograma-EN.md) | Decisions |
| [`SWC-AUDIT-EN.md`](./SWC-AUDIT-EN.md) | SWC-100–136 |
| [`ATAQUES-EN.md`](./ATAQUES-EN.md) | Campaigns + tests |
| [`GAS-EN.md`](./GAS-EN.md) | Gas baseline |
| [`DEPLOY-EN.md`](./DEPLOY-EN.md) | Anvil / testnet / ABI |
| [`FRONTEND-EN.md`](./FRONTEND-EN.md) | UI setup |
| [`MANUAL-FRONTEND-EN.md`](./MANUAL-FRONTEND-EN.md) | UI user manual |
| [`LIMITACIONES-EN.md`](./LIMITACIONES-EN.md) | Out of scope / known limits |
| [`DECISIONES-TECNICAS-EN.md`](./DECISIONES-TECNICAS-EN.md) | Decisions, contract logic, gas |
| [`MEJORAS-EN.md`](./MEJORAS-EN.md) | Optional backlog |

---

## 4. Contracts — key points

- **Compiler:** `pragma solidity 0.8.24;` (pinned).
- **Supply:** `MAX_SUPPLY` immutable; `_totalMinted` + `_nextTokenId`; guards in `_reserveMint`.
- **Mint:** `mint` / `safeMint` / `mintBatch` / `safeMintBatch` — owner only.
- **Safe paths:** OZ `onERC721Received` if the recipient is a contract.
- **Admin:** `setBaseURI`, default/token/delete/reset royalties — `onlyOwner` + Ownable2Step.
- **Interfaces:** ERC-165 / 721 / 721 Metadata / 2981 via `supportsInterface`.
- **Errors:** custom errors in `INFTCollection` (+ OZ errors in transfers/Ownable).

---

## 5. Frontend — key points

| Topic | Detail |
|-------|--------|
| Node | **≥ 20** (`engines`); **22** recommended (`nvm use 22`) |
| Env | `NEXT_PUBLIC_RPC_URL`, `NEXT_PUBLIC_CHAIN_ID`, `NEXT_PUBLIC_COLLECTION_ADDRESS` (static access in `env.ts`) |
| Theme | Light/dark: `data-theme` + `localStorage` (`nft-theme`); toggle in the toolbar |
| Help | `/ayuda` route + **? Ayuda** button |
| ABIs | `frontend/abi/` (regenerate with `./script/export-abi.sh`) |

---

## 6. Demo credentials (local Anvil only)

| Role | Value |
|------|-------|
| Anvil #0 (owner) | `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` |
| Private key #0 | `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80` |
| Chain | `31337` · RPC `http://127.0.0.1:8545` |

**Never** use these keys on mainnet / with real funds.

---

## 7. Handoff checklist

- [ ] `forge test` green
- [ ] `frontend`: `npm test` + `npm run build` (Node ≥ 20)
- [ ] Anvil + `Deploy.s.sol` + `.env.local` + UI mint/transfer/lookup
- [ ] LIMITACIONES and MEJORAS read
- [ ] Remotes: prefer SSH to GitHub if HTTPS fails (401)

---

## 8. Context contact

Plan and phase protocol: `.cursorrules` + `doc/00-plan-implementacion-EN.md`.  
Sibling module in the monorepo: the `evm-smart-contracts-suite` suite.

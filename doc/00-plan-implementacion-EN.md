# Implementation Plan — ERC-721 NFT Collection & Royalty (Module 04)
> 🌐 **English** · [Español](./00-plan-implementacion-ES.md)

Master document for the module. It defines the phases, deliverables, acceptance criteria and the **authorization protocol** used during development.

> **Current status:** Phases **0–7** ✅ (module closed, 2026-08-29).

---

## Authorization protocol

> **Hard rule:** each phase must be reviewed and **explicitly approved** by the project owner before the next one starts.  
> No implementation code for a phase is written without that confirmation.  
> When closing a phase: mark its status → `✅ Aprobada` ("Approved") + date; only then can the start of the next one be requested.

| Status | Meaning |
|--------|-------------|
| 🔒 Pending authorization | Design ready; **do not execute** until OK |
| 🔄 In progress | Authorized and under development |
| ✅ Approved | Closed; the next one can be proposed |
| ⏸️ Paused | Blocked by an external decision |

**How to authorize:** reply in the chat with something like `Autorizo Fase N` ("I authorize Phase N") (or reject it with concrete changes).

---

## 1. Module goal

Build a **gas-optimized ERC-721 NFT collection** that:

- Implements full **ERC-721** (`ownerOf`, `transferFrom`, `safeTransferFrom`, `approve`, `setApprovalForAll`, `balanceOf`).
- Supports **ERC-165** (`supportsInterface`) and **ERC-2981** (on-chain royalties).
- Allows **single and batch minting** with supply and quantity guards.
- Manages a **dynamic base URI** (the owner can update the metadata root).
- Uses **Ownable2Step** for admin (URI, royalties, supply caps).
- Enforces **safe mint/transfer** via `onERC721Received` when the target is a contract.
- Applies **custom errors**, NatSpec and optimizations (`unchecked` only with prior bounds checks).
- Includes a Foundry suite: unit + fuzz + invariant + attack + interface and safe-receiver tests.
- Includes a Next.js demo (Phase 6 ✅): wallet, mint, transfer, URI, royalty, light/dark theme.

---

## 2. Agreed stack

| Layer | Technology | Notes |
|------|------------|--------|
| Contracts | Solidity `0.8.24` (fixed pragma) | No floating pragma |
| Tooling | Foundry (`forge`, `cast`, `anvil`) | Unit, fuzz, invariant, gas report |
| Libraries | OpenZeppelin **v5.0.2** | `ERC721`, `ERC2981`, `Ownable2Step`, ERC-165 |
| Standards | ERC-721, ERC-165, ERC-2981 | Interface IDs verified in tests |
| Frontend | Next.js 15 App Router + TS + ethers v6 + Zod | Phase 6 ✅ |
| UI tests | Vitest + RTL | Phase 6 ✅ (`frontend/`, Node ≥ 20) |

**Out of scope for v1 (unless explicitly authorized):** advanced ERC-4906 metadata events, lazy mint / signature mint, Merkle allowlist, reveal mechanism, in-house marketplace, mainnet production hardening.

---

## 3. Logical architecture (summary)

```
User / Owner (MetaMask / cast)
        │
        ▼
Next.js demo + ethers v6  ──RPC──►  Anvil / Testnet
        │                                │
        └──────── ABI + address ─────────┤
                                         ▼
                              NFTCollection (core)
                    ┌────────────┼────────────────┐
                    ▼            ▼                ▼
               ERC-721      Base URI /        ERC-2981
               mint/batch   tokenURI          royaltyInfo
               transfer     Ownable2Step      default + per-token
                    │
                    ▼
             IERC721Receiver (safe paths)
```

Related documentation:

- [Class diagram](./01-diagrama-clases-EN.md)
- [Flow diagram](./02-diagrama-flujo-EN.md)
- [Flowchart](./03-flujograma-EN.md)
- [SWC-AUDIT](./SWC-AUDIT-EN.md) · [ATTACKS](./ATAQUES-EN.md) · [GAS](./GAS-EN.md)
- [DEPLOY](./DEPLOY-EN.md) · [FRONTEND](./FRONTEND-EN.md)

---

## 4. Repository structure (current)

```
04-erc721/
├── .cursorrules
├── README.md
├── foundry.toml
├── remappings.txt
├── .env.example
├── doc/
│   ├── 00-plan-implementacion-EN.md
│   ├── 01-diagrama-clases-EN.md
│   ├── 02-diagrama-flujo-EN.md
│   ├── 03-flujograma-EN.md
│   ├── SWC-AUDIT-EN.md
│   ├── ATAQUES-EN.md
│   ├── GAS-EN.md
│   ├── DEPLOY-EN.md
│   ├── FRONTEND-EN.md
│   └── abi/                          # NFTCollection + INFTCollection
├── src/
│   ├── interfaces/INFTCollection.sol
│   ├── NFTCollection.sol
│   └── mocks/
│       ├── MockERC721Receiver.sol
│       ├── MockERC721NonReceiver.sol
│       └── MockERC721ReceiverReentrant.sol
├── script/
│   ├── Deploy.s.sol
│   └── export-abi.sh
├── test/
│   ├── NFTCollection.t.sol
│   ├── unit/                         # core, lifecycle, royalty
│   ├── fuzz/
│   ├── invariant/
│   └── attack/
└── frontend/                         # Next.js demo (Phase 6)
    ├── abi/
    └── src/                          # app, components, hooks, lib
```

---

## 5. On-chain surface (v1 implemented)

| Function / component | Role |
|-----------------|-----|
| `mint(to)` / `safeMint(to)` | Mints 1 token; respects `maxSupply` |
| `mintBatch(to, quantity)` / `safeMintBatch` | Batch mint; `unchecked` after checks |
| `setBaseURI(uri)` | Owner updates the metadata root |
| `tokenURI(tokenId)` | `baseURI + tokenId` (or agreed convention) |
| `setDefaultRoyalty(receiver, feeNumerator)` | ERC-2981 default |
| `setTokenRoyalty` / `resetTokenRoyalty` | Per-token royalty + reset to default |
| `deleteDefaultRoyalty()` | Clears the global royalty |
| `royaltyInfo(tokenId, salePrice)` | Standard ERC-2981 view |
| `supportsInterface(interfaceId)` | ERC-165 + 721 + Metadata + 2981 |
| Transfers / approvals | Standard OZ ERC-721 surface |

### Custom errors (v1)

- `TokenDoesNotExist()`
- `MaxSupplyExceeded()`
- `MintZeroQuantity()`
- `Unauthorized()`
- `ZeroAddress()`
- `InvalidRoyalty()` — reserved; fee/receiver validation is also done via OZ ERC-2981
- `NotImplemented()` — used only in the Phase 1 skeleton (no longer applies to live mutators)

### Key invariants

```text
totalSupply() <= maxSupply
ownerOf(tokenId) != address(0) ⇔ token exists
balanceOf(owner) == actual count of the owner's tokens
royalty feeNumerator <= feeDenominator (typically 10000)
```

---

## 6. Implementation phases

### Summary

| Phase | Name | Status |
|------|--------|--------|
| 0 | Foundry bootstrap + docs | ✅ Approved (2026-08-28) |
| 1 | On-chain design: interfaces, errors + red tests | ✅ Approved (2026-08-28) |
| 2 | Core ERC-721 implementation + mint/batch + URI | ✅ Approved (2026-08-28) |
| 3 | ERC-2981 royalties + Ownable2Step admin | ✅ Approved (2026-08-28) |
| 4 | Fuzz + safe-receiver / attacks + gas report | ✅ Approved (2026-08-28) |
| 5 | Deploy scripts + ABI | ✅ Approved (2026-08-28) |
| 6 | Frontend demo (optional) | ✅ Approved (2026-08-29) |
| 7 | Final docs, handoff, diagram alignment | ✅ Approved (2026-08-29) |

---

### Phase 0 — Module bootstrap

**Status:** ✅ Approved — 2026-08-28  
**Estimated duration:** 0.5 day

#### Goal

Initialize Foundry, pin OZ v5, fix `0.8.24`, and leave the layout ready. The `doc/` folder already exists with the plan and diagrams.

#### Tasks

1. `forge init` (respecting the monorepo `.gitignore`).
2. `foundry.toml`: Solidity `0.8.24`, fuzz runs ≥ 1000, optimizer.
3. Install OpenZeppelin Contracts v5 + forge-std.
4. Remappings; `src/`, `test/`, `script/` structure.
5. Verify `forge build`.

#### Acceptance criteria

- [x] Compiles without errors.
- [x] Fixed pragma `0.8.24`.
- [x] OZ dependencies installed.
- [x] `doc/` present and referenced in the README.

#### Result

- Foundry `1.4.3-stable` with `forge init --no-git --force`.
- `foundry.toml`: `solc = 0.8.24`, `evm_version = cancun`, fuzz `runs = 1000`, invariant configured.
- Dependencies: `forge-std` + `openzeppelin-contracts@v5.0.2`.
- Placeholders: `src/NFTCollection.sol`, `test/NFTCollection.t.sol`, `script/Deploy.s.sol`.
- Layout: `src/interfaces/`, `src/mocks/`, `test/{unit,fuzz}/`, `doc/`, `.env.example`, `README.md`.
- `forge build` OK; `forge test` → 1 passed (`test_moduleId`).
- Note: use `export PATH="$HOME/.foundry/bin:$PATH"` (the npm `forge` clashes with Foundry).

#### Approval

- [x] Authorized for execution  
- [x] Completed and reviewed → ✅ 2026-08-28

> Reply when you want to start **Phase 1**: `Autorizo Fase 1` ("I authorize Phase 1")

---

### Phase 1 — On-chain design + TDD (tests first)

**Status:** ✅ Approved — 2026-08-28  
**Estimated duration:** 1 day  
**Depends on:** Phase 0 ✅

#### Goal

Freeze the interface, errors, events and URI/royalty policy; write tests that fail before the full logic exists.

#### Tasks

1. `INFTCollection.sol` with full NatSpec.
2. Custom errors + events (`Transfer`, `Approval`, `ApprovalForAll`, `BatchMinted`, `BaseURIUpdated`, `RoyaltyUpdated`, …).
3. Define `tokenId` numbering (sequential from 0 or 1).
4. `NFTCollection.sol` skeleton + initial unit suite (expected asserts / `NotImplemented`).
5. Mocks: a receiver that accepts and a receiver that rejects `onERC721Received`.

#### Acceptance criteria

- [x] Interfaces compile.
- [x] Custom errors only (no `require` strings).
- [x] Unit tests written for mint → transfer → URI → royalty (red until Phase 2/3).
- [x] Design decisions documented in this plan / diagrams.

#### Result

- `src/interfaces/INFTCollection.sol` — events, errors, views, mutators, NatSpec + v1 decisions.
- `src/NFTCollection.sol` — ERC721 + ERC2981 + Ownable2Step skeleton; constructor and views; mutators → `NotImplemented`.
- `src/mocks/MockERC721Receiver.sol` — configurable receiver (accepts / reverts).
- `src/mocks/MockERC721NonReceiver.sol` — contract without the hook.
- `test/NFTCollection.t.sol` — **14 green tests** (constructor, interfaces, royalty, NotImplemented).
- `test/unit/NFTCollection.lifecycle.t.sol` — **7 red tests** TDD (mint, batch, URI, transfer, safe receiver, supply).
- Decisions: `tokenId` starts at **0**; `tokenURI = baseURI + toString(id)`; mint is **onlyOwner**; fee denominator **10000** (OZ).

#### Approval

- [x] Authorized for execution  
- [x] Completed and reviewed → ✅ 2026-08-28

> Reply when you want to start **Phase 2**: `Autorizo Fase 2` ("I authorize Phase 2")

---

### Phase 2 — Core ERC-721 + mint/batch + URI

**Status:** ✅ Approved — 2026-08-28  
**Estimated duration:** 1–2 days  
**Depends on:** Phase 1 ✅

#### Goal

Implement single/batch minting, metadata URI, transfers and approvals, applying CEI where relevant and safe paths.

#### Tasks

1. State: `maxSupply`, `_nextTokenId` / `totalSupply`, `_baseURI`.
2. `mint` / `safeMint` / `mintBatch` / `safeMintBatch` with upfront checks + `unchecked` in loops.
3. `setBaseURI` (onlyOwner) + `tokenURI`.
4. Unit tests: single/batch mint, max supply, zero quantity, transfer, approve, `setApprovalForAll`.
5. Safe mint to a non-receiver contract → explicit revert.

#### Acceptance criteria

- [x] `totalSupply` never exceeds `maxSupply`.
- [x] Batch mint emits consistent transfers and updates balances.
- [x] `tokenURI` reflects the updated `baseURI`.
- [x] NatSpec on public/external functions.

#### Result

- `NFTCollection.sol`: `_reserveMint` centralizes the guards; mint/batch with an `unchecked` loop; `setBaseURI` + event.
- `setDefaultRoyalty` still `NotImplemented` (Phase 3).
- `test/unit/NFTCollection.lifecycle.t.sol` — **7 green tests**.
- `test/unit/NFTCollection.core.t.sol` — **8 tests** (mint, batch event, approve, setApprovalForAll).
- `test/NFTCollection.t.sol` — updated (12 green tests).
- Total suite: **27 tests** green.

#### Approval

- [x] Authorized for execution  
- [x] Completed and reviewed → ✅ 2026-08-28

> Reply when you want to start **Phase 3**: `Autorizo Fase 3` ("I authorize Phase 3")

---

### Phase 3 — ERC-2981 + Ownable2Step admin

**Status:** ✅ Approved — 2026-08-28  
**Estimated duration:** 1 day  
**Depends on:** Phase 2 ✅

#### Goal

On-chain royalties and robust administrative control.

#### Tasks

1. ERC-2981 inheritance / composition (OZ).
2. `setDefaultRoyalty` / optional `setTokenRoyalty` / `deleteDefaultRoyalty`.
3. Override `supportsInterface` for 165 + 721 + 2981.
4. Ownable2Step: transfer/accept ownership for admin functions.
5. Tests for `royaltyInfo` and interface IDs.

#### Acceptance criteria

- [x] `supportsInterface` green for ERC-165, ERC-721, ERC-2981.
- [x] `royaltyInfo` computes receiver + amount correctly.
- [x] Only the owner (or pending→accept) administers URI/royalties/supply where applicable.

#### Result

- `setDefaultRoyalty`, `setTokenRoyalty`, `deleteDefaultRoyalty`, `resetTokenRoyalty` implemented.
- `RoyaltyUpdated` and `TokenRoyaltyUpdated` events in the interface and contract.
- `supportsInterface` already covered 165/721/2981 via OZ; tests use explicit hex IDs.
- `test/unit/NFTCollection.royalty.t.sol` — **12 tests** (royalty admin + Ownable2Step).
- Total suite: **39 tests** green.

#### Approval

- [x] Authorized for execution  
- [x] Completed and reviewed → ✅ 2026-08-28

> Reply when you want to start **Phase 4**: `Autorizo Fase 4` ("I authorize Phase 4")

---

### Phase 4 — Fuzz, safe-receiver, attacks, gas

**Status:** ✅ Approved — 2026-08-28  
**Estimated duration:** 1–2 days  
**Depends on:** Phase 3 ✅

#### Goal

Harden supply, ownership and safe-transfer security properties.

#### Tasks

1. Fuzz: quantity, `to`, royalty salePrice.
2. Invariants: supply ≤ max; consistent balances.
3. Attack: mint/transfer to a contract without a receiver; malicious callback if authorized.
4. `forge test --gas-report` and notes on tradeoffs.
5. Coverage of custom error paths.
6. SWC audit + attack campaigns (`doc/SWC-AUDIT-EN.md`, `doc/ATAQUES-EN.md`).

#### Acceptance criteria

- [x] Fuzz ≥ 1000 runs without breaking the supply invariant.
- [x] Non-receiver reverts explicitly.
- [x] Gas report baseline documented (`doc/GAS-EN.md`).
- [x] SWC-100–136 matrix and mapping to tests.

#### Result

- `test/fuzz/NFTCollection.fuzz.t.sol` — 5 fuzz × 1000 runs.
- `test/invariant/` — handler + 3 invariants (256 runs / 3840 calls).
- `test/attack/SafeTransferAttack.t.sol` — 11 tests (non-receiver, reentrancy, auth).
- `src/mocks/MockERC721ReceiverReentrant.sol` — malicious callback.
- `doc/SWC-AUDIT-EN.md` — SWC matrix aligned with `01-erc20` / `03-staking`.
- `doc/ATAQUES-EN.md` — campaigns A–F mapped to tests.
- `doc/GAS-EN.md` — deploy baseline ~1.71M gas.
- Total suite: **58 tests** green.

#### Approval

- [x] Authorized for execution  
- [x] Completed and reviewed → ✅ 2026-08-28

> Reply when you want to start **Phase 5**: `Autorizo Fase 5` ("I authorize Phase 5")

---

### Phase 5 — Deploy scripts + ABI

**Status:** ✅ Approved — 2026-08-28  
**Estimated duration:** 0.5 day  
**Depends on:** Phase 4 ✅

#### Goal

Reproducible deployment on Anvil/testnet and ABI export for the UI.

#### Tasks

1. `Deploy.s.sol` (name, symbol, maxSupply, baseURI, royalty receiver/fee).
2. `.env.example` without secrets.
3. Export ABI → `doc/abi/` and/or `frontend/abi/`.
4. Anvil playbook in README/DEPLOY.

#### Acceptance criteria

- [x] Deploy script green on Anvil.
- [x] Addresses + ABI documented.

#### Result

- `script/Deploy.s.sol` — env `INITIAL_OWNER`, `COLLECTION_*`, `MAX_SUPPLY`, `BASE_URI`, `ROYALTY_*`.
- `script/export-abi.sh` → `doc/abi/` + `frontend/abi/` (`NFTCollection`, `INFTCollection`).
- `doc/DEPLOY-EN.md` — Anvil playbook, testnet, post-deploy `cast`.
- Verified on Anvil chain 31337: `NFTCollection` `0x5FbDB2315678afecb367f032d93F642f64180aa3` (first local deploy).

#### Approval

- [x] Authorized for execution  
- [x] Completed and reviewed → ✅ 2026-08-28

> Reply when you want to start **Phase 6**: `Autorizo Fase 6` ("I authorize Phase 6") (or `Omitir Fase 6` — "Skip Phase 6")

---

### Phase 6 — Frontend demo (optional)

**Status:** ✅ Approved — 2026-08-29  
**Estimated duration:** 2–3 days  
**Depends on:** Phase 5 ✅

#### Goal

Next.js demo: connect wallet, mint (owner), view `tokenURI`, transfer, show royalty info, light/dark theme.

#### Tasks

1. App Router; explicit `'use client'` / `'use server'`.
2. ethers v6 + Zod + JSDoc.
3. Flows: mint, batch mint, transfer, setBaseURI (owner).
4. Vitest + RTL (interaction TDD).
5. `.env.example` with `NEXT_PUBLIC_*`.
6. Light/dark theme toggle with persistence (`localStorage`).

#### Acceptance criteria

- [x] Happy path documented.
- [x] `next build` OK.
- [x] Minimal UI tests green.
- [x] Demo verified on Anvil (on-chain reads + UI).
- [x] Light/dark theme working.

#### Result

- `frontend/` — Next.js 15 App Router + ethers v6 + Zod + Vitest.
- `NftCollectionApp` + hooks `useWallet` / `useNftCollection` / `useTheme`.
- `ThemeToggle` — `data-theme` + CSS variables; preference in `localStorage` (`nft-theme`); anti-flash script in `layout.tsx`.
- Flows: mint / safeMint / mintBatch, transfer, tokenURI+royalty lookup, setBaseURI.
- `doc/FRONTEND-EN.md` — Anvil setup + happy path.
- `npm test` → **9 passed**; `npm run build` → OK (Node ≥ 20; `nvm use 22` recommended).
- Verified live: Anvil + deploy + `http://localhost:3000` (supply, royalty, theme toggle).
- In-app manual `/ayuda` + `doc/MANUAL-FRONTEND-EN.md` + **? Ayuda** ("? Help") button.

#### Approval

- [x] Authorized for execution  
- [x] Completed and reviewed → ✅ 2026-08-29

---

### Phase 7 — Final docs and handoff

**Status:** ✅ Completed (2026-08-29)  
**Duration:** ~0.5 day  
**Depends on:** Phase 5 ✅ + Phase 6 ✅

#### Goal

Align diagrams with the final code; make the README usable by a third party; close the global DoD.

#### Tasks completed

1. Module README pointing to HANDOFF and the complete docs.
2. Diagrams `01`–`03` updated to **as-built** (`_reserveMint`, per-token royalties, OZ `tokenURI`, mocks, help/theme UI).
3. `doc/HANDOFF-EN.md`, `doc/LIMITACIONES-EN.md`, `doc/MEJORAS-EN.md`.
4. Global DoD §8 marked complete (incl. diagrams).
5. Light/dark theme and Node ≥ 20 documented in handoff / README / frontend.

#### Acceptance criteria

- [x] `doc/` consistent with the implementation.
- [x] A third party can test/deploy/use the UI by following the docs (`HANDOFF` → `DEPLOY` → `FRONTEND` / `MANUAL-FRONTEND`).

#### Approval

- [x] Authorized for execution (`Vamos al paso 7` — "Let's go to step 7")  
- [x] Completed and reviewed → ✅ 2026-08-29

---

## 7. Progress checklist

```text
[x] Phase 0  Foundry bootstrap          → ✅ 2026-08-28
[x] Phase 1  Design + TDD               → ✅ 2026-08-28
[x] Phase 2  Core mint/URI + unit       → ✅ 2026-08-28
[x] Phase 3  ERC-2981 + Ownable2Step    → ✅ 2026-08-28
[x] Phase 4  Fuzz / safe / gas / SWC    → ✅ 2026-08-28
[x] Phase 5  Deploy + ABI               → ✅ 2026-08-28
[x] Phase 6  Frontend (optional)        → ✅ 2026-08-29
[x] Phase 7  Final docs                 → ✅ 2026-08-29
```

---

## 8. Definition of Done (global)

1. [x] Fixed `pragma solidity 0.8.24`.
2. [x] ERC-721 + ERC-165 + ERC-2981 with verified `supportsInterface`.
3. [x] Single and batch mint with `MaxSupplyExceeded` / `MintZeroQuantity` guards.
4. [x] Dynamic base URI and correct `tokenURI`.
5. [x] Safe mint/transfer with `onERC721Received` check.
6. [x] Ownable2Step on admin functions.
7. [x] Custom errors only; NatSpec on public/external functions.
8. [x] Suite: unit + fuzz + invariant + non-receiver / reentrancy attack (`forge test` → 58).
9. [x] Diagrams and plan aligned at closing (Phase 7).
10. [x] Frontend authorized and implemented (Phase 6: mint/transfer/URI/royalty + light/dark theme + help).

---

## 9. Risks and mitigations

| Risk | Mitigation |
|--------|------------|
| Tokens locked in contracts without a receiver | `safeMint` / `safeTransferFrom` + non-receiver tests |
| Supply overflow in batch | Check `totalSupply + quantity <= maxSupply` before the loop |
| Invalid royalty fee | OZ ERC-2981 validation + admin tests |
| Malformed / empty URI | `tokenURI` tests; documented `baseURI + id` policy |
| OZ v5 inheritance / overrides | Follow OZ overrides; interface ID tests |
| Frontend Node version too old | `engines.node >= 20`; document `nvm use 22` |
| Progress without review | **Per-phase authorization protocol** |

---

## 10. Immediate next step

**Status:** module **closed** (Phases 0–7).  

For a third party: start from [`HANDOFF-EN.md`](./HANDOFF-EN.md). Optional improvements: [`MEJORAS-EN.md`](./MEJORAS-EN.md).

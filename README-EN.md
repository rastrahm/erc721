# 04 — ERC-721 NFT Collection & Royalty

> 🌐 **English** · [Español](./README-ES.md)

Gas-optimized **ERC-721** NFT collection with batch minting, dynamic base URI and **ERC-2981** royalties. Solidity `0.8.24` + Foundry + Next.js demo.

**Status:** Phases **0–7** ✅ (module closed).

---

## Stack

| Layer | Technology |
|-------|------------|
| Contracts | Solidity `0.8.24`, OpenZeppelin v5 (`ERC721`, `ERC2981`, `Ownable2Step`) |
| Tooling | Foundry (`forge` / `cast` / `anvil`) |
| Standards | ERC-721, ERC-165, ERC-2981 |
| Demo UI | Next.js 15, ethers v6, Zod, Vitest · light/dark theme · `/ayuda` |

---

## Documentation

| Document | Contents |
|----------|----------|
| [`doc/HANDOFF-EN.md`](doc/HANDOFF-EN.md) | **Start here** — verification and map |
| [`doc/00-plan-implementacion-EN.md`](doc/00-plan-implementacion-EN.md) | Phased plan + DoD |
| [`doc/01-diagrama-clases-EN.md`](doc/01-diagrama-clases-EN.md) | Class diagram (as-built) |
| [`doc/02-diagrama-flujo-EN.md`](doc/02-diagrama-flujo-EN.md) | Sequences |
| [`doc/03-flujograma-EN.md`](doc/03-flujograma-EN.md) | Decision flowcharts |
| [`doc/SWC-AUDIT-EN.md`](doc/SWC-AUDIT-EN.md) | SWC-100–136 audit |
| [`doc/ATAQUES-EN.md`](doc/ATAQUES-EN.md) | Attack campaigns + tests |
| [`doc/GAS-EN.md`](doc/GAS-EN.md) | Gas report baseline |
| [`doc/DEPLOY-EN.md`](doc/DEPLOY-EN.md) | Anvil / testnet deploy + ABI |
| [`doc/FRONTEND-EN.md`](doc/FRONTEND-EN.md) | Demo UI setup |
| [`doc/MANUAL-FRONTEND-EN.md`](doc/MANUAL-FRONTEND-EN.md) | UI user manual |
| [`doc/LIMITACIONES-EN.md`](doc/LIMITACIONES-EN.md) | v1 scope and limitations |
| [`doc/DECISIONES-TECNICAS-EN.md`](doc/DECISIONES-TECNICAS-EN.md) | Decisions, logic and gas improvements |
| [`doc/MEJORAS-EN.md`](doc/MEJORAS-EN.md) | Optional backlog |
| [`portfolio/`](portfolio/) | ES/EN explainer page for portfolio |

---

## Quick start

```bash
export PATH="$HOME/.foundry/bin:$PATH"

forge build
forge test                    # ~58 tests

# Local demo (see doc/DEPLOY-EN.md)
anvil                         # another terminal
forge script script/Deploy.s.sol:Deploy \
  --rpc-url http://127.0.0.1:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --broadcast

./script/export-abi.sh

cd frontend && cp .env.example .env.local && npm install && npm run dev
# Node ≥ 20 (recommended: nvm use 22)
# UI: http://localhost:3000 · Help: /ayuda
```

Playbooks: [`doc/DEPLOY-EN.md`](doc/DEPLOY-EN.md) · [`doc/FRONTEND-EN.md`](doc/FRONTEND-EN.md) · [`doc/HANDOFF-EN.md`](doc/HANDOFF-EN.md).

---

## Structure

```text
src/           # NFTCollection + interfaces + mocks
test/          # unit / fuzz / invariant / attack
script/        # Deploy + export-abi
lib/           # forge-std + openzeppelin-contracts
doc/           # Plan, diagrams, SWC, handoff, frontend
frontend/      # Next.js demo (ABIs in frontend/abi/)
```

---

## Definition of Done

Closed in Phase 7 — see the global checklist in [`doc/00-plan-implementacion-EN.md`](doc/00-plan-implementacion-EN.md) §8.

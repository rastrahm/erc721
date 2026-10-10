# 04 — ERC-721 NFT Collection & Royalty

> 🌐 [English](./README-EN.md) · **Español**

Colección NFT **ERC-721** gas-optimizada con mint por lotes, base URI dinámica y royalties **ERC-2981**. Solidity `0.8.24` + Foundry + demo Next.js.

**Estado:** Fases **0–7** ✅ (módulo cerrado).

---

## Stack

| Capa | Tecnología |
|------|------------|
| Contratos | Solidity `0.8.24`, OpenZeppelin v5 (`ERC721`, `ERC2981`, `Ownable2Step`) |
| Tooling | Foundry (`forge` / `cast` / `anvil`) |
| Estándares | ERC-721, ERC-165, ERC-2981 |
| UI demo | Next.js 15, ethers v6, Zod, Vitest · tema claro/oscuro · `/ayuda` |

---

## Documentación

| Documento | Contenido |
|-----------|-----------|
| [`doc/HANDOFF-ES.md`](doc/HANDOFF-ES.md) | **Empezar aquí** — verificación y mapa |
| [`doc/00-plan-implementacion-ES.md`](doc/00-plan-implementacion-ES.md) | Plan por fases + DoD |
| [`doc/01-diagrama-clases-ES.md`](doc/01-diagrama-clases-ES.md) | Diagrama de clases (as-built) |
| [`doc/02-diagrama-flujo-ES.md`](doc/02-diagrama-flujo-ES.md) | Secuencias |
| [`doc/03-flujograma-ES.md`](doc/03-flujograma-ES.md) | Flujogramas de decisión |
| [`doc/SWC-AUDIT-ES.md`](doc/SWC-AUDIT-ES.md) | Auditoría SWC-100–136 |
| [`doc/ATAQUES-ES.md`](doc/ATAQUES-ES.md) | Campañas de ataque + tests |
| [`doc/GAS-ES.md`](doc/GAS-ES.md) | Gas report baseline |
| [`doc/DEPLOY-ES.md`](doc/DEPLOY-ES.md) | Deploy Anvil / testnet + ABI |
| [`doc/FRONTEND-ES.md`](doc/FRONTEND-ES.md) | Setup demo UI |
| [`doc/MANUAL-FRONTEND-ES.md`](doc/MANUAL-FRONTEND-ES.md) | Manual de usuario UI |
| [`doc/LIMITACIONES-ES.md`](doc/LIMITACIONES-ES.md) | Alcance y límites v1 |
| [`doc/DECISIONES-TECNICAS-ES.md`](doc/DECISIONES-TECNICAS-ES.md) | Decisiones, lógica y mejoras de gas |
| [`doc/MEJORAS-ES.md`](doc/MEJORAS-ES.md) | Backlog opcional |
| [`portfolio/`](portfolio/) | Página explicativa ES/EN para portafolio |

---

## Uso rápido

```bash
export PATH="$HOME/.foundry/bin:$PATH"

forge build
forge test                    # ~58 tests

# Demo local (ver doc/DEPLOY-ES.md)
anvil                         # otra terminal
forge script script/Deploy.s.sol:Deploy \
  --rpc-url http://127.0.0.1:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --broadcast

./script/export-abi.sh

cd frontend && cp .env.example .env.local && npm install && npm run dev
# Node ≥ 20 (recomendado: nvm use 22)
# UI: http://localhost:3000 · Ayuda: /ayuda
```

Playbooks: [`doc/DEPLOY-ES.md`](doc/DEPLOY-ES.md) · [`doc/FRONTEND-ES.md`](doc/FRONTEND-ES.md) · [`doc/HANDOFF-ES.md`](doc/HANDOFF-ES.md).

---

## Estructura

```text
src/           # NFTCollection + interfaces + mocks
test/          # unit / fuzz / invariant / attack
script/        # Deploy + export-abi
lib/           # forge-std + openzeppelin-contracts
doc/           # Plan, diagramas, SWC, handoff, frontend
frontend/      # Demo Next.js (ABIs en frontend/abi/)
```

---

## Definition of Done

Cerrado en Fase 7 — ver checklist global en [`doc/00-plan-implementacion-ES.md`](doc/00-plan-implementacion-ES.md) §8.

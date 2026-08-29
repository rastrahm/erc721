# 04 — ERC-721 NFT Collection & Royalty

Colección NFT **ERC-721** gas-optimizada con mint por lotes, base URI dinámica y royalties **ERC-2981**. Solidity `0.8.24` + Foundry + demo Next.js.

**Estado:** Fases **0–6** ✅ · Fase **7** 🔒 pendiente.

---

## Stack

| Capa | Tecnología |
|------|------------|
| Contratos | Solidity `0.8.24`, OpenZeppelin v5 (`ERC721`, `ERC2981`, `Ownable2Step`) |
| Tooling | Foundry (`forge` / `cast` / `anvil`) |
| Estándares | ERC-721, ERC-165, ERC-2981 |
| UI demo | Next.js 15, ethers v6, Zod, Vitest |

---

## Documentación

| Documento | Contenido |
|-----------|-----------|
| [`doc/00-plan-implementacion.md`](doc/00-plan-implementacion.md) | Plan por fases + DoD |
| [`doc/01-diagrama-clases.md`](doc/01-diagrama-clases.md) | Diagrama de clases |
| [`doc/02-diagrama-flujo.md`](doc/02-diagrama-flujo.md) | Diagrama de flujo (secuencias) |
| [`doc/03-flujograma.md`](doc/03-flujograma.md) | Flujogramas de decisión |
| [`doc/SWC-AUDIT.md`](doc/SWC-AUDIT.md) | Auditoría SWC-100–136 |
| [`doc/ATAQUES.md`](doc/ATAQUES.md) | Campañas de ataque + tests |
| [`doc/GAS.md`](doc/GAS.md) | Gas report baseline |
| [`doc/DEPLOY.md`](doc/DEPLOY.md) | Deploy Anvil / testnet + ABI |
| [`doc/FRONTEND.md`](doc/FRONTEND.md) | Demo UI Next.js |

---

## Uso rápido

```bash
export PATH="$HOME/.foundry/bin:$PATH"

forge build
forge test

# Demo local (ver doc/DEPLOY.md)
anvil   # otra terminal
forge script script/Deploy.s.sol:Deploy \
  --rpc-url http://127.0.0.1:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --broadcast

./script/export-abi.sh

cd frontend && cp .env.example .env.local && npm install && npm run dev
# Node ≥ 20 (recomendado 22 via nvm)
```

Playbooks: [`doc/DEPLOY.md`](doc/DEPLOY.md) · [`doc/FRONTEND.md`](doc/FRONTEND.md).

---

## Estructura

```text
src/           # NFTCollection + interfaces + mocks
test/          # unit / fuzz / invariant / attack
script/        # Deploy + export-abi
lib/           # forge-std + openzeppelin-contracts
doc/           # Plan, diagramas, SWC, ataques, gas, frontend
frontend/      # Demo Next.js (ABIs en frontend/abi/)
```

---

## Próximo paso

Autorizar **Fase 7** (docs finales / handoff): `Autorizo Fase 7`

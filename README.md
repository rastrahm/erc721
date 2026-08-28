# 04 — ERC-721 NFT Collection & Royalty

Colección NFT **ERC-721** gas-optimizada con mint por lotes, base URI dinámica y royalties **ERC-2981**. Solidity `0.8.24` + Foundry.

**Estado:** Fases **0–4** ✅. Fases 5–7 🔒 pendientes.

---

## Stack

| Capa | Tecnología |
|------|------------|
| Contratos | Solidity `0.8.24`, OpenZeppelin v5 (`ERC721`, `ERC2981`, `Ownable2Step`) |
| Tooling | Foundry (`forge` / `cast` / `anvil`) |
| Estándares | ERC-721, ERC-165, ERC-2981 |
| UI demo | Next.js (Fase 6, opcional) |

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

---

## Uso rápido

```bash
export PATH="$HOME/.foundry/bin:$PATH"

forge build
forge test
```

---

## Estructura

```text
src/           # NFTCollection + interfaces + mocks (Fases 1+)
test/          # unit / fuzz / invariant / attack
script/        # Deploy + export-abi (Fase 5)
lib/           # forge-std + openzeppelin-contracts
doc/           # Plan, diagramas, SWC, ataques, gas
```

---

## Próximo paso

Autorizar **Fase 5** (deploy scripts + ABI): `Autorizo Fase 5`

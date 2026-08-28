# Auditoría SWC — NFTCollection

Verificación de `NFTCollection` contra el [SWC Registry](https://swcregistry.io/) (EIP-1470) y principios del monorepo (custom errors, Ownable2Step, safe ERC-721, ERC-2981).

> **Nota:** El SWC Registry no se mantiene activamente desde ~2020. Complementar con [SCSVS](https://github.com/ComposableSecurity/SCSVS) y [EEA EthTrust](https://entethalliance.org/specs/ethtrust/).

**Contrato auditado:** `src/NFTCollection.sol` (+ `src/interfaces/INFTCollection.sol`)  
**Fecha:** 2026-08-28  
**Referencia tests:** `test/NFTCollection.t.sol`, `test/unit/`, `test/fuzz/`, `test/invariant/`, `test/attack/`  
**Campañas:** [`ATAQUES.md`](./ATAQUES.md) · **Gas:** [`GAS.md`](./GAS.md)

---

## Resumen ejecutivo

| Estado | Cantidad |
|--------|----------|
| ✅ Mitigado / No aplicable | 33 |
| ⚠️ Informativo (diseño / estándar / trust) | 3 |
| ❌ Vulnerable | 0 |

**Conclusión:** Sin vulnerabilidades SWC explotables en el alcance de la colección ERC-721 + ERC-2981. Riesgos informativos: race de `approve` ERC-721, tokens locked si se usa `mint` a contrato sin receiver (mitigado con `safeMint`), y confianza en owner para mint/admin.

**Principios del suite verificados:**

| Principio | Estado |
|-----------|--------|
| Custom errors (no `require` strings) | ✅ |
| Pragma fijo `0.8.24` | ✅ |
| Ownable2Step en admin | ✅ |
| Safe paths (`safeMint` / `safeTransferFrom`) | ✅ + tests non-receiver |
| Supply cap upfront (`_reserveMint`) | ✅ + fuzz/invariant |
| ERC-2981 + `supportsInterface` | ✅ |
| Batch mint `unchecked` tras bounds | ✅ |

---

## Matriz completa SWC-100 — SWC-136

| ID | Título | Aplica | Estado | Evidencia en `NFTCollection` |
|----|--------|--------|--------|------------------------------|
| SWC-100 | Function Default Visibility | Sí | ✅ | Visibilidad explícita en todas las funciones |
| SWC-101 | Integer Overflow and Underflow | Sí | ✅ | Solidity `0.8.24`; `_reserveMint` antes de loop `unchecked` |
| SWC-102 | Outdated Compiler Version | Sí | ✅ | `pragma solidity 0.8.24` + `foundry.toml` |
| SWC-103 | Floating Pragma | Sí | ✅ | Pragma exacto (sin `^`) |
| SWC-104 | Unchecked Call Return Value | Parcial | ✅ | OZ `_checkOnERC721Received`; callback malicioso → revert tx |
| SWC-105 | Unprotected Ether Withdrawal | No | N/A | Sin ETH / `payable` / `.call{value}` |
| SWC-106 | Unprotected SELFDESTRUCT | No | N/A | Sin `selfdestruct` |
| SWC-107 | Reentrancy | Sí | ✅ | OZ ERC-721: effects antes de `onERC721Received`; tests callback |
| SWC-108 | State Variable Default Visibility | Sí | ✅ | State `private`; getters explícitos |
| SWC-109 | Uninitialized Storage Pointer | No | N/A | Sin punteros storage legacy |
| SWC-110 | Assert Violation | No | N/A | Sin `assert` de producción |
| SWC-111 | Deprecated Solidity Functions | Sí | ✅ | Sin `suicide` / `throw` / `tx.origin` |
| SWC-112 | Delegatecall to Untrusted Callee | No | N/A | Sin `delegatecall` |
| SWC-113 | DoS with Failed Call | Parcial | ✅ | Safe receiver fallido → revert completa (sin mint parcial en batch safe) |
| SWC-114 | Transaction Order Dependence | Sí | ⚠️ | Race de `approve` ERC-721 (estándar) |
| SWC-115 | Authorization through tx.origin | No | N/A | `onlyOwner` OZ; sin `tx.origin` |
| SWC-116 | Block values as a proxy for time | No | N/A | Sin lógica temporal on-chain |
| SWC-117 | Signature Malleability | No | N/A | Sin firmas / `ecrecover` / permit |
| SWC-118 | Incorrect Constructor Name | No | N/A | `constructor` 0.8+ |
| SWC-119 | Shadowing State Variables | Sí | ✅ | Overrides OZ sin shadowing |
| SWC-120 | Weak Sources of Randomness | No | N/A | Sin RNG |
| SWC-121 | Missing Protection against Signature Replay | No | N/A | Sin firmas |
| SWC-122 | Lack of Proper Signature Verification | No | N/A | Sin verificación de firmas |
| SWC-123 | Requirement Violation | Sí | ✅ | Custom errors + unit/fuzz/invariant/attack |
| SWC-124 | Write to Arbitrary Storage Location | No | N/A | Sin assembly de storage |
| SWC-125 | Incorrect Inheritance Order | Sí | ✅ | `INFTCollection, ERC721, ERC2981, Ownable2Step` |
| SWC-126 | Insufficient Gas Griefing | No | N/A | Sin relayers con stipend fijo |
| SWC-127 | Arbitrary Jump with Function Type Variable | No | N/A | Sin function types dinámicos |
| SWC-128 | DoS With Block Gas Limit | Sí | ⚠️ | `mintBatch`/`safeMintBatch` O(n) por diseño; cap `maxSupply` acota gas |
| SWC-129 | Typographical Error | Sí | ✅ | Revisión + `forge build` / tests |
| SWC-130 | Right-To-Left-Override | No | N/A | ASCII |
| SWC-131 | Presence of unused variables | Sí | ✅ | Sin dead code material |
| SWC-132 | Unexpected Ether balance | No | N/A | Contrato no maneja ETH |
| SWC-133 | Hash Collisions (var-length args) | No | N/A | Sin hashing multi-dinámico propio |
| SWC-134 | Message call with hardcoded gas | No | N/A | Sin `{gas: …}` |
| SWC-135 | Code With No Effects | No | N/A | Sin no-ops relevantes |
| SWC-136 | Unencrypted Private Data On-Chain | Parcial | ✅ | Ownership/metadata/royalties públicos por diseño NFT |

---

## Riesgos informativos

### SWC-114 — Front-running de `approve` (ERC-721)

Un tercero puede observar `approve(spender, tokenId)` y actuar antes de que se confirme la nueva aprobación (p. ej. `transferFrom` con allowance previa si existía política de re-approve).

**Mitigación de producto:** `setApprovalForAll` con cuidado; revocar approval antes de cambiar; integradores usan flujos atómicos off-chain.

### SWC-128 — Batch mint y gas

`mintBatch` / `safeMintBatch` iteran `quantity` veces. Un owner malicioso o un `maxSupply` muy alto puede hacer txs costosas.

**Mitigación:** `maxSupply` fijado en deploy; documentar límites de `quantity` para UI; preferir batches razonables.

### Owner trust + `mint` sin safe receiver

| Tema | Riesgo | Tratamiento v1 |
|------|--------|----------------|
| `mint` (no safe) a contrato | Token locked sin `onERC721Received` | Documentado; usar `safeMint` / `safeMintBatch` |
| Owner mint ilimitado (hasta cap) | Centralización | By design — colección curada `onlyOwner` |
| `setBaseURI` malicioso | Metadata incorrecta | Trust en owner; Ownable2Step |
| Royalties manipulables | Owner cambia fee/receiver | `setDefaultRoyalty` onlyOwner; ERC-2981 voluntary |

---

## Checklist principios monorepo

| Principio | ¿Cumple? | Notas |
|-----------|----------|--------|
| Custom errors | ✅ | `MaxSupplyExceeded`, `MintZeroQuantity`, … |
| Ownable2Step | ✅ | Tests transfer/accept |
| Safe ERC-721 receiver | ✅ | `safeMint*` + attack suite |
| Supply guards upfront | ✅ | `_reserveMint` |
| NatSpec públicas/externas | ✅ | |
| Fuzz ≥ 1000 runs | ✅ | `test/fuzz/NFTCollection.fuzz.t.sol` |
| Invariantes supply/balances | ✅ | `test/invariant/` |

---

## Mapeo SWC → tests

| SWC | Test(s) |
|-----|---------|
| SWC-101 | `testFuzz_mintBatch_*`, `testFuzz_sequentialMint_*`, `test_AttackC2_*` |
| SWC-103 | Compilador fijo (build) |
| SWC-107 | `test_AttackB1_*`, `test_AttackB2_*`, `test_AttackB3_*` |
| SWC-113 | `test_AttackA2_*` (batch safe sin mint parcial) |
| SWC-114 | Documental en ATAQUES Campaña C |
| SWC-123 | unit + lifecycle + attack + invariant |
| SWC-128 | Documental; invariant/fuzz con `maxSupply` acotado |
| ERC-721 receiver | `test_AttackA1_*`, `test_AttackA3_*`, `test_AttackD1_*` |

---

## Referencias

- [SWC Registry](https://swcregistry.io/)
- [EIP-1470](https://eips.ethereum.org/EIPS/eip-1470)
- [EIP-721](https://eips.ethereum.org/EIPS/eip-721)
- [EIP-2981](https://eips.ethereum.org/EIPS/eip-2981)
- Campañas: [`ATAQUES.md`](./ATAQUES.md)
- Gas: [`GAS.md`](./GAS.md)
- Plan: [`00-plan-implementacion.md`](./00-plan-implementacion.md)

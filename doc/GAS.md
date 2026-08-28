# Optimización de gas — NFTCollection

Regenerar:

```bash
export PATH="$HOME/.foundry/bin:$PATH"
forge test --match-contract 'NFTCollectionDesignTest|NFTCollectionLifecycleTest|NFTCollectionCoreTest|NFTCollectionRoyaltyAdminTest' --gas-report
```

**Fecha baseline:** 2026-08-28 (Fase 4)

---

## Deploy

| Métrica | Valor |
|---------|-------|
| Deployment Cost | 1 707 857 gas |
| Deployment Size | 8 865 bytes |

---

## Funciones principales (unit / lifecycle / royalty)

| Función | Min | Avg | Median | Max | Notas |
|---------|-----|-----|--------|-----|-------|
| `mint` | 23 868 | 94 580 | 115 420 | 115 420 | Primer mint más barato (cold storage) |
| `safeMint` | 118 165 | 118 717 | 118 489 | 119 724 | +~3k vs `mint` por receiver check |
| `mintBatch` | 24 280 | 926 095 | 167 461 | 2 586 544 | O(n); max en batch grande |
| `safeMintBatch` | 221 279 | 221 279 | 221 279 | 221 279 | n=5 en lifecycle |
| `transferFrom` | 55 613 | 56 511 | 56 511 | 57 410 | Estándar OZ |
| `setBaseURI` | 24 295 | 29 065 | 31 403 | 31 523 | 1 SSTORE string |
| `setDefaultRoyalty` | 24 140 | 26 492 | 24 332 | 30 948 | ERC-2981 storage |
| `setTokenRoyalty` | 26 659 | 42 825 | 50 908 | 50 908 | Per-token override |
| `royaltyInfo` | 2 928 | 4 955 | 5 140 | 5 140 | View |
| `tokenURI` | 2 627 | 6 282 | 6 689 | 6 689 | View + concat |
| `supportsInterface` | 500 | 615 | 648 | 697 | View |

---

## Tradeoffs aceptados

| Decisión | Por qué |
|----------|---------|
| `_reserveMint` upfront + loop `unchecked` | Menos checks en iteración; bounds verificados antes |
| `immutable MAX_SUPPLY` | Lectura barata en cada mint |
| Herencia OZ ERC721 + ERC2981 | Seguridad auditada > gas custom from-scratch |
| Batch O(n) | Requerimiento funcional; acotado por `maxSupply` |
| `safeMint*` vs `mint*` | Seguridad receiver; ~+95k gas en safe single mint |

---

## Seguridad vs gas

| Test suite | Rol |
|------------|-----|
| `test/attack/SafeTransferAttack.t.sol` | Non-receiver + reentrancy callback |
| `test/fuzz/NFTCollection.fuzz.t.sol` | 1000 runs supply/royalty |
| `test/invariant/NFTCollection.invariant.t.sol` | 256 runs × 3840 calls |

Suite Fase 4: **58 tests** verdes (incl. fuzz + invariant + attack).

Ver [`ATAQUES.md`](./ATAQUES.md) y [`SWC-AUDIT.md`](./SWC-AUDIT.md).

# Gas Optimization — NFTCollection
> 🌐 **English** · [Español](./GAS-ES.md)

Regenerate:

```bash
export PATH="$HOME/.foundry/bin:$PATH"
forge test --match-contract 'NFTCollectionDesignTest|NFTCollectionLifecycleTest|NFTCollectionCoreTest|NFTCollectionRoyaltyAdminTest' --gas-report
```

**Baseline date:** 2026-08-28 (Phase 4)

---

## Deploy

| Metric | Value |
|--------|-------|
| Deployment Cost | 1 707 857 gas |
| Deployment Size | 8 865 bytes |

---

## Main functions (unit / lifecycle / royalty)

| Function | Min | Avg | Median | Max | Notes |
|----------|-----|-----|--------|-----|-------|
| `mint` | 23 868 | 94 580 | 115 420 | 115 420 | First mint is cheaper (cold storage) |
| `safeMint` | 118 165 | 118 717 | 118 489 | 119 724 | +~3k vs `mint` due to receiver check |
| `mintBatch` | 24 280 | 926 095 | 167 461 | 2 586 544 | O(n); max on a large batch |
| `safeMintBatch` | 221 279 | 221 279 | 221 279 | 221 279 | n=5 in lifecycle |
| `transferFrom` | 55 613 | 56 511 | 56 511 | 57 410 | Standard OZ |
| `setBaseURI` | 24 295 | 29 065 | 31 403 | 31 523 | 1 string SSTORE |
| `setDefaultRoyalty` | 24 140 | 26 492 | 24 332 | 30 948 | ERC-2981 storage |
| `setTokenRoyalty` | 26 659 | 42 825 | 50 908 | 50 908 | Per-token override |
| `royaltyInfo` | 2 928 | 4 955 | 5 140 | 5 140 | View |
| `tokenURI` | 2 627 | 6 282 | 6 689 | 6 689 | View + concat |
| `supportsInterface` | 500 | 615 | 648 | 697 | View |

---

## Accepted tradeoffs

| Decision | Why |
|----------|-----|
| Upfront `_reserveMint` + `unchecked` loop | Fewer checks per iteration; bounds verified beforehand |
| `immutable MAX_SUPPLY` | Cheap read on every mint |
| Inheriting OZ ERC721 + ERC2981 | Audited security > custom from-scratch gas savings |
| O(n) batch | Functional requirement; bounded by `maxSupply` |
| `safeMint*` vs `mint*` | Receiver safety; ~+95k gas on a safe single mint |

---

## Security vs gas

| Test suite | Role |
|------------|------|
| `test/attack/SafeTransferAttack.t.sol` | Non-receiver + callback reentrancy |
| `test/fuzz/NFTCollection.fuzz.t.sol` | 1000 runs supply/royalty |
| `test/invariant/NFTCollection.invariant.t.sol` | 256 runs × 3840 calls |

Phase 4 suite: **58 tests** passing (incl. fuzz + invariant + attack).

See [`ATAQUES-EN.md`](./ATAQUES-EN.md) and [`SWC-AUDIT-EN.md`](./SWC-AUDIT-EN.md).

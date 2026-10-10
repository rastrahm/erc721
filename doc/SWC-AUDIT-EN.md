# SWC Audit — NFTCollection
> 🌐 **English** · [Español](./SWC-AUDIT-ES.md)

Verification of `NFTCollection` against the [SWC Registry](https://swcregistry.io/) (EIP-1470) and the monorepo principles (custom errors, Ownable2Step, safe ERC-721, ERC-2981).

> **Note:** The SWC Registry has not been actively maintained since ~2020. Complement it with [SCSVS](https://github.com/ComposableSecurity/SCSVS) and [EEA EthTrust](https://entethalliance.org/specs/ethtrust/).

**Audited contract:** `src/NFTCollection.sol` (+ `src/interfaces/INFTCollection.sol`)  
**Date:** 2026-08-28  
**Test references:** `test/NFTCollection.t.sol`, `test/unit/`, `test/fuzz/`, `test/invariant/`, `test/attack/`  
**Campaigns:** [`ATAQUES-EN.md`](./ATAQUES-EN.md) · **Gas:** [`GAS-EN.md`](./GAS-EN.md)

---

## Executive summary

| Status | Count |
|--------|-------|
| ✅ Mitigated / Not applicable | 33 |
| ⚠️ Informational (design / standard / trust) | 3 |
| ❌ Vulnerable | 0 |

**Conclusion:** No exploitable SWC vulnerabilities within the scope of the ERC-721 + ERC-2981 collection. Informational risks: the ERC-721 `approve` race, tokens locked if `mint` is used toward a contract without a receiver (mitigated by `safeMint`), and trust in the owner for mint/admin.

**Suite principles verified:**

| Principle | Status |
|-----------|--------|
| Custom errors (no `require` strings) | ✅ |
| Fixed pragma `0.8.24` | ✅ |
| Ownable2Step for admin | ✅ |
| Safe paths (`safeMint` / `safeTransferFrom`) | ✅ + non-receiver tests |
| Upfront supply cap (`_reserveMint`) | ✅ + fuzz/invariant |
| ERC-2981 + `supportsInterface` | ✅ |
| `unchecked` batch mint after bounds checks | ✅ |

---

## Full SWC-100 — SWC-136 matrix

| ID | Title | Applies | Status | Evidence in `NFTCollection` |
|----|-------|---------|--------|-----------------------------|
| SWC-100 | Function Default Visibility | Yes | ✅ | Explicit visibility on every function |
| SWC-101 | Integer Overflow and Underflow | Yes | ✅ | Solidity `0.8.24`; `_reserveMint` before the `unchecked` loop |
| SWC-102 | Outdated Compiler Version | Yes | ✅ | `pragma solidity 0.8.24` + `foundry.toml` |
| SWC-103 | Floating Pragma | Yes | ✅ | Exact pragma (no `^`) |
| SWC-104 | Unchecked Call Return Value | Partial | ✅ | OZ `_checkOnERC721Received`; malicious callback → tx reverts |
| SWC-105 | Unprotected Ether Withdrawal | No | N/A | No ETH / `payable` / `.call{value}` |
| SWC-106 | Unprotected SELFDESTRUCT | No | N/A | No `selfdestruct` |
| SWC-107 | Reentrancy | Yes | ✅ | OZ ERC-721: effects before `onERC721Received`; callback tests |
| SWC-108 | State Variable Default Visibility | Yes | ✅ | `private` state; explicit getters |
| SWC-109 | Uninitialized Storage Pointer | No | N/A | No legacy storage pointers |
| SWC-110 | Assert Violation | No | N/A | No production `assert` |
| SWC-111 | Deprecated Solidity Functions | Yes | ✅ | No `suicide` / `throw` / `tx.origin` |
| SWC-112 | Delegatecall to Untrusted Callee | No | N/A | No `delegatecall` |
| SWC-113 | DoS with Failed Call | Partial | ✅ | Failed safe receiver → full revert (no partial mint in safe batch) |
| SWC-114 | Transaction Order Dependence | Yes | ⚠️ | ERC-721 `approve` race (standard) |
| SWC-115 | Authorization through tx.origin | No | N/A | OZ `onlyOwner`; no `tx.origin` |
| SWC-116 | Block values as a proxy for time | No | N/A | No on-chain time logic |
| SWC-117 | Signature Malleability | No | N/A | No signatures / `ecrecover` / permit |
| SWC-118 | Incorrect Constructor Name | No | N/A | 0.8+ `constructor` |
| SWC-119 | Shadowing State Variables | Yes | ✅ | OZ overrides without shadowing |
| SWC-120 | Weak Sources of Randomness | No | N/A | No RNG |
| SWC-121 | Missing Protection against Signature Replay | No | N/A | No signatures |
| SWC-122 | Lack of Proper Signature Verification | No | N/A | No signature verification |
| SWC-123 | Requirement Violation | Yes | ✅ | Custom errors + unit/fuzz/invariant/attack |
| SWC-124 | Write to Arbitrary Storage Location | No | N/A | No storage assembly |
| SWC-125 | Incorrect Inheritance Order | Yes | ✅ | `INFTCollection, ERC721, ERC2981, Ownable2Step` |
| SWC-126 | Insufficient Gas Griefing | No | N/A | No relayers with a fixed stipend |
| SWC-127 | Arbitrary Jump with Function Type Variable | No | N/A | No dynamic function types |
| SWC-128 | DoS With Block Gas Limit | Yes | ⚠️ | `mintBatch`/`safeMintBatch` O(n) by design; `maxSupply` cap bounds gas |
| SWC-129 | Typographical Error | Yes | ✅ | Review + `forge build` / tests |
| SWC-130 | Right-To-Left-Override | No | N/A | ASCII |
| SWC-131 | Presence of unused variables | Yes | ✅ | No material dead code |
| SWC-132 | Unexpected Ether balance | No | N/A | Contract does not handle ETH |
| SWC-133 | Hash Collisions (var-length args) | No | N/A | No custom multi-dynamic hashing |
| SWC-134 | Message call with hardcoded gas | No | N/A | No `{gas: …}` |
| SWC-135 | Code With No Effects | No | N/A | No relevant no-ops |
| SWC-136 | Unencrypted Private Data On-Chain | Partial | ✅ | Ownership/metadata/royalties are public by NFT design |

---

## Informational risks

### SWC-114 — `approve` front-running (ERC-721)

A third party can observe `approve(spender, tokenId)` and act before the new approval is confirmed (e.g. `transferFrom` using a previous approval if a re-approve policy existed).

**Product mitigation:** use `setApprovalForAll` carefully; revoke the approval before changing it; integrators use atomic off-chain flows.

### SWC-128 — Batch mint and gas

`mintBatch` / `safeMintBatch` iterate `quantity` times. A malicious owner or a very high `maxSupply` can produce expensive transactions.

**Mitigation:** `maxSupply` fixed at deploy; document `quantity` limits for the UI; prefer reasonably sized batches.

### Owner trust + `mint` without safe receiver

| Topic | Risk | v1 treatment |
|-------|------|--------------|
| `mint` (non-safe) to a contract | Token locked without `onERC721Received` | Documented; use `safeMint` / `safeMintBatch` |
| Unlimited owner mint (up to cap) | Centralization | By design — curated `onlyOwner` collection |
| Malicious `setBaseURI` | Incorrect metadata | Trust in owner; Ownable2Step |
| Manipulable royalties | Owner changes fee/receiver | `setDefaultRoyalty` onlyOwner; ERC-2981 is voluntary |

---

## Monorepo principles checklist

| Principle | Compliant? | Notes |
|-----------|------------|-------|
| Custom errors | ✅ | `MaxSupplyExceeded`, `MintZeroQuantity`, … |
| Ownable2Step | ✅ | Transfer/accept tests |
| Safe ERC-721 receiver | ✅ | `safeMint*` + attack suite |
| Upfront supply guards | ✅ | `_reserveMint` |
| NatSpec on public/external | ✅ | |
| Fuzz ≥ 1000 runs | ✅ | `test/fuzz/NFTCollection.fuzz.t.sol` |
| Supply/balance invariants | ✅ | `test/invariant/` |

---

## SWC → tests mapping

| SWC | Test(s) |
|-----|---------|
| SWC-101 | `testFuzz_mintBatch_*`, `testFuzz_sequentialMint_*`, `test_AttackC2_*` |
| SWC-103 | Fixed compiler (build) |
| SWC-107 | `test_AttackB1_*`, `test_AttackB2_*`, `test_AttackB3_*` |
| SWC-113 | `test_AttackA2_*` (safe batch without partial mint) |
| SWC-114 | Documented in ATAQUES Campaign C |
| SWC-123 | unit + lifecycle + attack + invariant |
| SWC-128 | Documented; invariant/fuzz with bounded `maxSupply` |
| ERC-721 receiver | `test_AttackA1_*`, `test_AttackA3_*`, `test_AttackD1_*` |

---

## References

- [SWC Registry](https://swcregistry.io/)
- [EIP-1470](https://eips.ethereum.org/EIPS/eip-1470)
- [EIP-721](https://eips.ethereum.org/EIPS/eip-721)
- [EIP-2981](https://eips.ethereum.org/EIPS/eip-2981)
- Campaigns: [`ATAQUES-EN.md`](./ATAQUES-EN.md)
- Gas: [`GAS-EN.md`](./GAS-EN.md)
- Plan: [`00-plan-implementacion-EN.md`](./00-plan-implementacion-EN.md)

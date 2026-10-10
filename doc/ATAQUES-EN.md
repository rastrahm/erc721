# Attack Campaigns — NFTCollection
> 🌐 **English** · [Español](./ATAQUES-ES.md)

> **Protocol:** defensive Foundry tests (`vm.expectRevert` / invariants). An attack "succeeds" when it **fails**, or when it is documented as a limitation of the standard.  
> **Out of scope:** offensive exploit scripts or procedures for stealing third-party NFTs.

Contract: `src/NFTCollection.sol`  
Audit: [`SWC-AUDIT-EN.md`](./SWC-AUDIT-EN.md)

---

## Summary

| Campaign | Name | SWC / topic | Status |
|----------|------|-------------|--------|
| A | Safe receiver / locked tokens | SWC-113, 123 | ✅ |
| B | Reentrancy in `onERC721Received` | SWC-107 | ✅ |
| C | Supply cap and mint authorization | SWC-101, 123 | ✅ |
| D | ETH surface / invalid selector | SWC-105, 112, 132 | ✅ |
| E | Fuzz / invariants | SWC-101, 123, 128 | ✅ |
| F | Transaction ordering / approve | SWC-114 | ✅ Documented |

---

## Campaign A — Safe receiver (non-receiver)

**Hypothesis:** a safe mint/transfer to a contract without `onERC721Received` reverts; a safe batch does not leave partial supply behind.

| # | Scenario | Expected result | Test |
|---|----------|-----------------|------|
| A1 | `safeMint` to a contract without the hook | `ERC721InvalidReceiver` | `test_AttackA1_safeMint_nonReceiver_reverts` |
| A2 | `safeMintBatch` to a non-receiver | revert; `totalSupply == 0` | `test_AttackA2_safeMintBatch_nonReceiver_reverts_noPartialMint` |
| A3 | `safeTransferFrom` to a non-receiver | revert; owner unchanged | `test_AttackA3_safeTransfer_nonReceiver_reverts` |
| A4 | `safeMint` to a valid receiver | OK | `test_safeMint_succeedsOnGoodReceiver` (lifecycle) |
| A5 | Wrong selector returned by receiver | `ERC721InvalidReceiver` | `test_AttackD1_receiverReturnsWrongSelector_reverts` |

**Note:** `mint` / `mintBatch` (non-safe) **can** lock tokens in contracts without the hook — a documented limitation; use the `safe*` variants.

---

## Campaign B — Callback reentrancy (SWC-107)

**Hypothesis:** during `onERC721Received`, reentering `mint` or `transferFrom` neither drains supply nor steals tokens.

| # | Scenario | Expected result | Test |
|---|----------|-----------------|------|
| B1 | Reenter `mint` during `safeMint` | revert; supply 0 | `test_AttackB1_safeMint_reentrantMint_reverts_noExtraSupply` |
| B2 | Reenter `transferFrom` during `safeTransfer` | revert; original owner | `test_AttackB2_safeTransfer_reentrantDoubleTransfer_reverts` |
| B3 | Reenter `mint` during `safeMintBatch` | revert; supply 0 | `test_AttackB3_safeMintBatch_reentrantMint_reverts_allOrNothing` |

Mitigation: OZ ERC-721 updates state before the callback; unauthorized reentry reverts (`onlyOwner` / ownership).

---

## Campaign C — Supply and authorization

**Hypothesis:** nobody can mint without being the owner; `maxSupply` cannot be exceeded; the zero address reverts.

| # | Scenario | Expected result | Test |
|---|----------|-----------------|------|
| C1 | Non-owner `mint` | Ownable revert | `test_AttackC1_unauthorizedMint_reverts` |
| C2 | Mint after supply is exhausted | `MaxSupplyExceeded` | `test_AttackC2_batchBeyondMaxSupply_reverts` |
| C3 | `mint(address(0))` | `ZeroAddress` | `test_AttackC3_mintToZero_reverts` |
| C4 | `mintBatch(0)` | `MintZeroQuantity` | `test_mintBatch_revertsZeroQuantity` (lifecycle) |

---

## Campaign D — Contract surface

| # | Scenario | Expected result | Test |
|---|----------|-----------------|------|
| D0 | No ETH surface | no `payable` / ETH withdraw | `test_AttackD0_noPayableMintSurface` |
| D1 | Receiver returns a bad selector | revert | `test_AttackD1_receiverReturnsWrongSelector_reverts` |

---

## Campaign E — Fuzzing and invariants

**Hypothesis:** supply and balances remain consistent under random call sequences.

| # | Scenario | Expected result | Test |
|---|----------|-----------------|------|
| E1 | Fuzz batch within cap | `totalSupply <= maxSupply` | `testFuzz_mintBatch_respectsMaxSupply` |
| E2 | Fuzz batch above cap | `MaxSupplyExceeded` | `testFuzz_mintBatch_revertsWhenExceedsMaxSupply` |
| E3 | Fuzz bounded royalty | `amount <= salePrice` | `testFuzz_royaltyInfo_bounded` |
| E4 | Fuzz sequential ids | `tokenId == index` | `testFuzz_sequentialMint_idsMatchTotalSupply` |
| E5 | Fuzz safe batch (EOA) | consistent owners | `testFuzz_safeMintBatch_quantity` |
| E6 | Supply cap invariant | `totalSupply <= maxSupply` | `invariant_supplyWithinCap` |
| E7 | Balances invariant | `Σ balance == totalSupply` | `invariant_balancesMatchSupply` |
| E8 | Owners invariant | every id has an owner | `invariant_allMintedTokensHaveOwner` |

---

## Campaign F — Transaction ordering (SWC-114)

**Hypothesis:** the contract does not eliminate the classic `approve` / `setApprovalForAll` race inherent to the ERC-721 standard.

| # | Scenario | Classification | Action |
|---|----------|----------------|--------|
| F1 | `approve` observed in the mempool | ERC-721 limitation | Documented (see SWC-AUDIT) |

Off-chain mitigation: revoke the approval; use atomic flows; do not re-approve without resetting first.

---

## Out of scope (v1)

- Enumerable / in-house marketplace  
- Lazy mint / signature mint  
- Pausable / rescue  
- Offensive exploits / real-theft PoCs  

See [`SWC-AUDIT-EN.md`](./SWC-AUDIT-EN.md), informational section.

# Campañas de ataque — NFTCollection

> **Protocolo:** tests Foundry defensivos (`vm.expectRevert` / invariantes). El “éxito” del ataque es que **falle** o quede documentado como limitación de estándar.  
> **Fuera de alcance:** scripts de exploit ofensivos o procedimientos para robar NFTs ajenos.

Contrato: `src/NFTCollection.sol`  
Auditoría: [`SWC-AUDIT.md`](./SWC-AUDIT.md)

---

## Resumen

| Campaña | Nombre | SWC / tema | Estado |
|---------|--------|------------|--------|
| A | Safe receiver / tokens locked | SWC-113, 123 | ✅ |
| B | Reentrancy en `onERC721Received` | SWC-107 | ✅ |
| C | Supply cap y autorización mint | SWC-101, 123 | ✅ |
| D | Superficie ETH / selector inválido | SWC-105, 112, 132 | ✅ |
| E | Fuzz / invariantes | SWC-101, 123, 128 | ✅ |
| F | Orden de txs / approve | SWC-114 | ✅ Documental |

---

## Campaña A — Safe receiver (non-receiver)

**Hipótesis:** mint/transfer safe a contrato sin `onERC721Received` revierte; batch safe no deja supply parcial.

| # | Escenario | Resultado esperado | Test |
|---|-----------|--------------------|------|
| A1 | `safeMint` a contrato sin hook | `ERC721InvalidReceiver` | `test_AttackA1_safeMint_nonReceiver_reverts` |
| A2 | `safeMintBatch` a non-receiver | revert; `totalSupply == 0` | `test_AttackA2_safeMintBatch_nonReceiver_reverts_noPartialMint` |
| A3 | `safeTransferFrom` a non-receiver | revert; owner intacto | `test_AttackA3_safeTransfer_nonReceiver_reverts` |
| A4 | `safeMint` a receiver válido | OK | `test_safeMint_succeedsOnGoodReceiver` (lifecycle) |
| A5 | Selector incorrecto en receiver | `ERC721InvalidReceiver` | `test_AttackD1_receiverReturnsWrongSelector_reverts` |

**Nota:** `mint` / `mintBatch` (no safe) **pueden** lockear tokens en contratos sin hook — limitación documentada; usar variantes `safe*`.

---

## Campaña B — Reentrancy en callback (SWC-107)

**Hipótesis:** durante `onERC721Received`, reentrada a `mint` o `transferFrom` no drena supply ni roba tokens.

| # | Escenario | Resultado esperado | Test |
|---|-----------|--------------------|------|
| B1 | Reenter `mint` en `safeMint` | revert; supply 0 | `test_AttackB1_safeMint_reentrantMint_reverts_noExtraSupply` |
| B2 | Reenter `transferFrom` en `safeTransfer` | revert; owner original | `test_AttackB2_safeTransfer_reentrantDoubleTransfer_reverts` |
| B3 | Reenter `mint` en `safeMintBatch` | revert; supply 0 | `test_AttackB3_safeMintBatch_reentrantMint_reverts_allOrNothing` |

Mitigación: OZ ERC-721 actualiza estado antes del callback; reentrada no autorizada revierte (`onlyOwner` / ownership).

---

## Campaña C — Supply y autorización

**Hipótesis:** nadie mintea sin ser owner; no se supera `maxSupply`; cero address revierte.

| # | Escenario | Resultado esperado | Test |
|---|-----------|--------------------|------|
| C1 | Non-owner `mint` | revert Ownable | `test_AttackC1_unauthorizedMint_reverts` |
| C2 | Mint tras agotar supply | `MaxSupplyExceeded` | `test_AttackC2_batchBeyondMaxSupply_reverts` |
| C3 | `mint(address(0))` | `ZeroAddress` | `test_AttackC3_mintToZero_reverts` |
| C4 | `mintBatch(0)` | `MintZeroQuantity` | `test_mintBatch_revertsZeroQuantity` (lifecycle) |

---

## Campaña D — Superficie del contrato

| # | Escenario | Resultado esperado | Test |
|---|-----------|--------------------|------|
| D0 | Sin superficie ETH | sin `payable` / withdraw ETH | `test_AttackD0_noPayableMintSurface` |
| D1 | Receiver devuelve selector malo | revert | `test_AttackD1_receiverReturnsWrongSelector_reverts` |

---

## Campaña E — Fuzz e invariantes

**Hipótesis:** supply y balances permanecen coherentes bajo secuencias aleatorias.

| # | Escenario | Resultado esperado | Test |
|---|-----------|--------------------|------|
| E1 | Fuzz batch dentro de cap | `totalSupply <= maxSupply` | `testFuzz_mintBatch_respectsMaxSupply` |
| E2 | Fuzz batch sobre cap | `MaxSupplyExceeded` | `testFuzz_mintBatch_revertsWhenExceedsMaxSupply` |
| E3 | Fuzz royalty acotada | `amount <= salePrice` | `testFuzz_royaltyInfo_bounded` |
| E4 | Fuzz ids secuenciales | `tokenId == index` | `testFuzz_sequentialMint_idsMatchTotalSupply` |
| E5 | Fuzz safe batch (EOA) | owners coherentes | `testFuzz_safeMintBatch_quantity` |
| E6 | Invariant supply cap | `totalSupply <= maxSupply` | `invariant_supplyWithinCap` |
| E7 | Invariant balances | `Σ balance == totalSupply` | `invariant_balancesMatchSupply` |
| E8 | Invariant owners | cada id tiene owner | `invariant_allMintedTokensHaveOwner` |

---

## Campaña F — Orden de transacciones (SWC-114)

**Hipótesis:** el contrato no elimina el race clásico de `approve` / `setApprovalForAll` del estándar ERC-721.

| # | Escenario | Clasificación | Acción |
|---|-----------|---------------|--------|
| F1 | `approve` observado en mempool | Limitación ERC-721 | Documental (ver SWC-AUDIT) |

Mitigación off-chain: revocar approval; flujos atómicos; no re-aprobar sin reset.

---

## Fuera de alcance (v1)

- Enumerable / marketplace propio  
- Lazy mint / signature mint  
- Pausable / rescue  
- Exploits ofensivos / PoC de robo real  

Ver [`SWC-AUDIT.md`](./SWC-AUDIT.md) sección informativos.

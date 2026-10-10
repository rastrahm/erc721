# Flowchart — ERC-721 NFT Collection & Royalty

> 🌐 **English** · [Español](./03-flujograma-ES.md)

**As-built** decision diagrams (Phase 7). Sequences: [`02-diagrama-flujo-EN.md`](./02-diagrama-flujo-EN.md). Plan: [`00-plan-implementacion-EN.md`](./00-plan-implementacion-EN.md).

Mint order: `onlyOwner` → `_reserveMint` (checks + id reservation) → effects `_mint`/`_safeMint` → (safe) receiver interaction.

---

## 1. Flowchart: `safeMint(to)`

```mermaid
flowchart TD
    A([Start: safeMint to]) --> B{msg.sender == owner?}
    B -->|No| C[Revert Unauthorized / Ownable]
    C --> Z([End error])
    B -->|Yes| D{to != address 0?}
    D -->|No| E[Revert ZeroAddress]
    E --> Z
    D -->|Yes| F{totalSupply + 1 <= maxSupply?}
    F -->|No| G[Revert MaxSupplyExceeded]
    G --> Z
    F -->|Yes| H[Effects: assign tokenId, owner, balance++]
    H --> I[Emit Transfer address0 to tokenId]
    I --> J{to.code.length > 0?}
    J -->|No| K([End OK EOA])
    J -->|Yes| L[Call onERC721Received]
    L --> M{Returns correct selector?}
    M -->|No| N[Revert ERC721InvalidReceiver]
    N --> Z
    M -->|Yes| O([End OK contract])
```

---

## 2. Flowchart: `mintBatch` / `safeMintBatch`

```mermaid
flowchart TD
    A([Start: mintBatch to, quantity]) --> B{onlyOwner?}
    B -->|No| C[Revert]
    C --> Z([End error])
    B -->|Yes| D{quantity > 0?}
    D -->|No| E[Revert MintZeroQuantity]
    E --> Z
    D -->|Yes| F{to != 0?}
    F -->|No| G[Revert ZeroAddress]
    G --> Z
    F -->|Yes| H{totalSupply + quantity <= maxSupply?}
    H -->|No| I[Revert MaxSupplyExceeded]
    I --> Z
    H -->|Yes| J[fromId = _nextTokenId; reserve quantity]
    J --> K["Loop unchecked tokenId = fromId .. end"]
    K --> L[_mint or _safeMint tokenId]
    L --> M{Safe variant and to is contract?}
    M -->|Yes| N[onERC721Received per token]
    N --> O{OK?}
    O -->|No| P[Revert]
    P --> Z
    O -->|Yes| Q{More tokens?}
    M -->|No| Q
    Q -->|Yes| K
    Q -->|No| R[Emit BatchMinted]
    R --> S([End OK])
```

> Note: `_reserveMint` updates `_nextTokenId` and `_totalMinted` **before** the mint loop.

---

## 3. Flowchart: `tokenURI(tokenId)`

```mermaid
flowchart TD
    A([Start tokenURI]) --> B{token exists? _requireOwned}
    B -->|No| C[Revert OZ / TokenDoesNotExist]
    C --> Z([End error])
    B -->|Yes| D[Read _baseTokenURI]
    D --> E{bytes base length > 0?}
    E -->|No| F["return \"\" (OZ policy)"]
    E -->|Yes| G["return concat(baseURI, tokenId)"]
    F --> H([End OK])
    G --> H
```

---

## 4. Flowchart: `setBaseURI`

```mermaid
flowchart TD
    A([Start setBaseURI]) --> B{onlyOwner?}
    B -->|No| C[Revert]
    C --> Z([End error])
    B -->|Yes| D[Effects: _baseTokenURI = uri]
    D --> E[Emit BaseURIUpdated]
    E --> F([End OK])
```

---

## 5. Flowchart: `safeTransferFrom`

```mermaid
flowchart TD
    A([Start safeTransferFrom]) --> B{token exists?}
    B -->|No| C[Revert TokenDoesNotExist]
    C --> Z([End error])
    B -->|Yes| D{caller authorized?}
    D -->|No| E[Revert Unauthorized / OZ]
    E --> Z
    D -->|Yes| F{to != 0?}
    F -->|No| G[Revert ZeroAddress]
    G --> Z
    F -->|Yes| H[Effects: clear approval, balances, owner]
    H --> I[Emit Transfer]
    I --> J{to is contract?}
    J -->|No| K([End OK])
    J -->|Yes| L[onERC721Received]
    L --> M{Selector OK?}
    M -->|No| N[Revert]
    N --> Z
    M -->|Yes| K
```

---

## 6. Flowchart: `royaltyInfo`

```mermaid
flowchart TD
    A([Start royaltyInfo tokenId, salePrice]) --> B{Per-token royalty?}
    B -->|Yes| C[Use token receiver/fee]
    B -->|No| D[Use default royalty]
    C --> E
    D --> E
    E{"feeNumerator valid / receiver set?"}
    E -->|No| F["return (0, 0) or OZ policy"]
    E -->|Yes| G["amount = salePrice * fee / denominator"]
    G --> H([Return receiver, amount])
    F --> H
```

---

## 7. Flowchart: `setDefaultRoyalty`

```mermaid
flowchart TD
    A([Start setDefaultRoyalty]) --> B{onlyOwner?}
    B -->|No| C[Revert]
    C --> Z([End error])
    B -->|Yes| D{receiver != 0?}
    D -->|No| E[Revert ZeroAddress]
    E --> Z
    D -->|Yes| F{feeNumerator <= feeDenominator?}
    F -->|No| G[Revert InvalidRoyalty]
    G --> Z
    F -->|Yes| H[Effects: _setDefaultRoyalty]
    H --> I[Emit RoyaltyUpdated]
    I --> J([End OK])
```

---

## 8. Flowchart: `supportsInterface`

```mermaid
flowchart TD
    A([Start supportsInterface id]) --> B{id == ERC165?}
    B -->|Yes| Y[Return true]
    B -->|No| C{id == ERC721?}
    C -->|Yes| Y
    C -->|No| D{id == ERC721 Metadata?}
    D -->|Yes| Y
    D -->|No| E{id == ERC2981?}
    E -->|Yes| Y
    E -->|No| N[Return false]
    Y --> F([End])
    N --> F
```

---

## 9. Flowchart: Ownable2Step (owner change)

```mermaid
flowchart TD
    A([Owner calls transferOwnership]) --> B[pendingOwner = new]
    B --> C{New owner calls acceptOwnership?}
    C -->|No| D[Admin remains current owner]
    D --> E([Wait])
    E --> C
    C -->|Yes| F[owner = pending; pending = 0]
    F --> G([End OK new owner])
```

---

## 10. Flowchart: module phase authorization

```mermaid
flowchart TD
    A([Phase N designed]) --> B{Phase N authorized?}
    B -->|No| C[Wait for Autorizo Fase N]
    C --> B
    B -->|Yes| D[Execute]
    D --> E{Criteria OK?}
    E -->|No| F[Fix]
    F --> E
    E -->|Yes| G[Mark ✅]
    G --> H{Phase N+1?}
    H -->|Yes| I[Request authorization]
    I --> B
    H -->|No| J([Module closed 0-7])
```

---

## 11. Quick legend

| Symbol | Meaning |
|---------|-------------|
| Oval | Start / end |
| Rectangle | Process or effect |
| Diamond | Decision |
| CEI | Checks → Effects → Interactions (where there are external calls) |
| Safe path | Requires `onERC721Received` if `to` is a contract |
| Batch guard | Validate supply/quantity **before** the `unchecked` loop |
| Ownable2Step | Admin only after `acceptOwnership` |

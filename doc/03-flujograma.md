# Flujograma — ERC-721 NFT Collection & Royalty

Diagramas de decisión (sí/no) del diseño v1. Secuencias: [`02-diagrama-flujo.md`](./02-diagrama-flujo.md). Plan: [`00-plan-implementacion.md`](./00-plan-implementacion.md).

Orden típico en mutators de mint: `onlyOwner` → checks de dirección/quantity/supply → effects → (safe) interactions con receiver.

---

## 1. Flujograma: `safeMint(to)`

```mermaid
flowchart TD
    A([Inicio: safeMint to]) --> B{msg.sender == owner?}
    B -->|No| C[Revert Unauthorized / Ownable]
    C --> Z([Fin error])
    B -->|Sí| D{to != address 0?}
    D -->|No| E[Revert ZeroAddress]
    E --> Z
    D -->|Sí| F{totalSupply + 1 <= maxSupply?}
    F -->|No| G[Revert MaxSupplyExceeded]
    G --> Z
    F -->|Sí| H[Effects: asignar tokenId, owner, balance++]
    H --> I[Emit Transfer address0 to tokenId]
    I --> J{to.code.length > 0?}
    J -->|No| K([Fin OK EOA])
    J -->|Sí| L[Call onERC721Received]
    L --> M{Retorna selector correcto?}
    M -->|No| N[Revert ERC721InvalidReceiver]
    N --> Z
    M -->|Sí| O([Fin OK contrato])
```

---

## 2. Flujograma: `mintBatch` / `safeMintBatch`

```mermaid
flowchart TD
    A([Inicio: mintBatch to, quantity]) --> B{onlyOwner?}
    B -->|No| C[Revert]
    C --> Z([Fin error])
    B -->|Sí| D{quantity > 0?}
    D -->|No| E[Revert MintZeroQuantity]
    E --> Z
    D -->|Sí| F{to != 0?}
    F -->|No| G[Revert ZeroAddress]
    G --> Z
    F -->|Sí| H{totalSupply + quantity <= maxSupply?}
    H -->|No| I[Revert MaxSupplyExceeded]
    I --> Z
    H -->|Sí| J[fromId = _nextTokenId]
    J --> K[Loop unchecked i = 0 .. quantity)
    K --> L[Mint token fromId + i]
    L --> M{Variante safe y to es contrato?}
    M -->|Sí| N[onERC721Received por token]
    N --> O{OK?}
    O -->|No| P[Revert]
    P --> Z
    O -->|Sí| Q{Más tokens?}
    M -->|No| Q
    Q -->|Sí| K
    Q -->|No| R[Emit BatchMinted]
    R --> S([Fin OK])
```

---

## 3. Flujograma: `tokenURI(tokenId)`

```mermaid
flowchart TD
    A([Inicio tokenURI]) --> B{token existe?}
    B -->|No| C[Revert TokenDoesNotExist]
    C --> Z([Fin error])
    B -->|Sí| D[Leer _baseTokenURI]
    D --> E{baseURI vacío?}
    E -->|Sí| F[Política Fase 1: string vacío o revert]
    E -->|No| G["return concat(baseURI, tokenId)"]
    F --> H([Fin])
    G --> H
```

---

## 4. Flujograma: `setBaseURI`

```mermaid
flowchart TD
    A([Inicio setBaseURI]) --> B{onlyOwner?}
    B -->|No| C[Revert]
    C --> Z([Fin error])
    B -->|Sí| D[Effects: _baseTokenURI = uri]
    D --> E[Emit BaseURIUpdated]
    E --> F([Fin OK])
```

---

## 5. Flujograma: `safeTransferFrom`

```mermaid
flowchart TD
    A([Inicio safeTransferFrom]) --> B{token existe?}
    B -->|No| C[Revert TokenDoesNotExist]
    C --> Z([Fin error])
    B -->|Sí| D{caller autorizado?}
    D -->|No| E[Revert Unauthorized / OZ]
    E --> Z
    D -->|Sí| F{to != 0?}
    F -->|No| G[Revert ZeroAddress]
    G --> Z
    F -->|Sí| H[Effects: clear approval, balances, owner]
    H --> I[Emit Transfer]
    I --> J{to es contrato?}
    J -->|No| K([Fin OK])
    J -->|Sí| L[onERC721Received]
    L --> M{Selector OK?}
    M -->|No| N[Revert]
    N --> Z
    M -->|Sí| K
```

---

## 6. Flujograma: `royaltyInfo`

```mermaid
flowchart TD
    A([Inicio royaltyInfo tokenId, salePrice]) --> B{¿Royalty per-token?}
    B -->|Sí| C[Usar receiver/fee del token]
    B -->|No| D[Usar default royalty]
    C --> E
    D --> E
    E{"feeNumerator válido / receiver set?"}
    E -->|No| F["return (0, 0) o política OZ"]
    E -->|Sí| G["amount = salePrice * fee / denominator"]
    G --> H([Return receiver, amount])
    F --> H
```

---

## 7. Flujograma: `setDefaultRoyalty`

```mermaid
flowchart TD
    A([Inicio setDefaultRoyalty]) --> B{onlyOwner?}
    B -->|No| C[Revert]
    C --> Z([Fin error])
    B -->|Sí| D{receiver != 0?}
    D -->|No| E[Revert ZeroAddress]
    E --> Z
    D -->|Sí| F{feeNumerator <= feeDenominator?}
    F -->|No| G[Revert InvalidRoyalty]
    G --> Z
    F -->|Sí| H[Effects: _setDefaultRoyalty]
    H --> I[Emit RoyaltyUpdated]
    I --> J([Fin OK])
```

---

## 8. Flujograma: `supportsInterface`

```mermaid
flowchart TD
    A([Inicio supportsInterface id]) --> B{id == ERC165?}
    B -->|Sí| Y[Return true]
    B -->|No| C{id == ERC721?}
    C -->|Sí| Y
    C -->|No| D{id == ERC721 Metadata?}
    D -->|Sí| Y
    D -->|No| E{id == ERC2981?}
    E -->|Sí| Y
    E -->|No| N[Return false]
    Y --> F([Fin])
    N --> F
```

---

## 9. Flujograma: Ownable2Step (cambio de owner)

```mermaid
flowchart TD
    A([Owner llama transferOwnership]) --> B[pendingOwner = nuevo]
    B --> C{Nuevo llama acceptOwnership?}
    C -->|No| D[Admin sigue siendo owner actual]
    D --> E([Espera])
    E --> C
    C -->|Sí| F[owner = pending; pending = 0]
    F --> G([Fin OK nuevo owner])
```

---

## 10. Flujograma: autorización de fases del módulo

```mermaid
flowchart TD
    A([Fase N diseñada]) --> B{¿Autorizó Fase N?}
    B -->|No| C[Esperar Autorizo Fase N]
    C --> B
    B -->|Sí| D[Ejecutar]
    D --> E{¿Criterios OK?}
    E -->|No| F[Corregir]
    F --> E
    E -->|Sí| G[Marcar ✅]
    G --> H{¿Fase N+1?}
    H -->|Sí| I[Pedir autorización]
    I --> B
    H -->|No| J([Módulo cerrado 0-7])
```

---

## 11. Leyenda rápida

| Símbolo | Significado |
|---------|-------------|
| Óvalo | Inicio / fin |
| Rectángulo | Proceso o efecto |
| Rombo | Decisión |
| CEI | Checks → Effects → Interactions (donde hay calls externos) |
| Safe path | Exige `onERC721Received` si `to` es contrato |
| Batch guard | Validar supply/quantity **antes** del loop `unchecked` |
| Ownable2Step | Admin solo tras `acceptOwnership` |

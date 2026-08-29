# Diagrama de clases — ERC-721 NFT Collection & Royalty

Vista **as-built** (Fase 7) alineada a `src/NFTCollection.sol` + `INFTCollection.sol` + demo `frontend/`.

---

## 1. Diagrama de clases (Mermaid)

```mermaid
classDiagram
    direction TB

    class INFTCollection {
        <<interface>>
        +maxSupply() uint256
        +totalSupply() uint256
        +baseURI() string
        +tokenURI(tokenId) string
        +mint(to) uint256
        +safeMint(to) uint256
        +mintBatch(to, quantity) uint256
        +safeMintBatch(to, quantity) uint256
        +setBaseURI(uri)
        +setDefaultRoyalty(receiver, feeNumerator)
        +setTokenRoyalty(tokenId, receiver, feeNumerator)
        +deleteDefaultRoyalty()
        +resetTokenRoyalty(tokenId)
    }

    class NFTCollection {
        +string MODULE_ID
        -uint256 MAX_SUPPLY$
        -uint256 _totalMinted
        -uint256 _nextTokenId
        -string _baseTokenURI
        +constructor(name, symbol, maxSupply, baseURI, royaltyReceiver, feeNumerator, owner)
        +maxSupply() uint256
        +totalSupply() uint256
        +baseURI() string
        +tokenURI(tokenId) string
        +mint(to) uint256
        +safeMint(to) uint256
        +mintBatch(to, quantity) uint256
        +safeMintBatch(to, quantity) uint256
        +setBaseURI(uri)
        +setDefaultRoyalty(receiver, feeNumerator)
        +setTokenRoyalty(tokenId, receiver, feeNumerator)
        +deleteDefaultRoyalty()
        +resetTokenRoyalty(tokenId)
        +supportsInterface(interfaceId) bool
        -_reserveMint(to, quantity)* uint256
        -_baseURI() string
    }

    class ERC721 {
        <<OpenZeppelin v5>>
        +balanceOf(owner)
        +ownerOf(tokenId)
        +transferFrom(from, to, tokenId)
        +safeTransferFrom(from, to, tokenId)
        +approve(to, tokenId)
        +setApprovalForAll(operator, approved)
        +getApproved(tokenId)
        +isApprovedForAll(owner, operator)
        +name() string
        +symbol() string
    }

    class ERC2981 {
        <<OpenZeppelin v5>>
        +royaltyInfo(tokenId, salePrice)
        +supportsInterface(interfaceId)
        #_setDefaultRoyalty(receiver, feeNumerator)
        #_setTokenRoyalty(tokenId, receiver, feeNumerator)
        #_deleteDefaultRoyalty()
        #_resetTokenRoyalty(tokenId)
    }

    class ERC165 {
        <<OpenZeppelin>>
        +supportsInterface(interfaceId) bool
    }

    class Ownable2Step {
        <<OpenZeppelin>>
        +owner()
        +pendingOwner()
        +transferOwnership(newOwner)
        +acceptOwnership()
    }

    class IERC721Receiver {
        <<OpenZeppelin>>
        +onERC721Received(operator, from, tokenId, data) bytes4
    }

    class MockERC721Receiver {
        <<test>>
        +bool shouldAccept
        +onERC721Received(...) bytes4
    }

    class MockERC721NonReceiver {
        <<test>>
        note: sin onERC721Received
    }

    class MockERC721ReceiverReentrant {
        <<test>>
        +onERC721Received(...) bytes4
    }

    class NFTErrors {
        <<errors INFTCollection>>
        TokenDoesNotExist()
        MaxSupplyExceeded()
        MintZeroQuantity()
        Unauthorized()
        ZeroAddress()
        InvalidRoyalty()
        NotImplemented()
    }

    class NFTEvents {
        <<events>>
        Transfer(from, to, tokenId)
        Approval(owner, approved, tokenId)
        ApprovalForAll(owner, operator, approved)
        BatchMinted(to, fromTokenId, quantity)
        BaseURIUpdated(newBaseURI)
        RoyaltyUpdated(receiver, feeNumerator)
        TokenRoyaltyUpdated(tokenId, receiver, feeNumerator)
    }

    class NFTClient {
        <<frontend Next.js + ethers v6>>
        +connectWallet()
        +mint / safeMint / mintBatch()
        +transfer()
        +tokenURI + royaltyInfo()
        +setBaseURI()
        +themeToggle()
        +helpManual /ayuda
    }

    INFTCollection <|.. NFTCollection
    ERC721 <|-- NFTCollection
    ERC2981 <|-- NFTCollection
    Ownable2Step <|-- NFTCollection
    ERC165 <|-- ERC721
    ERC165 <|-- ERC2981
    NFTCollection ..> NFTErrors
    NFTCollection ..> NFTEvents
    NFTCollection ..> IERC721Receiver : safe mint/transfer
    MockERC721Receiver ..|> IERC721Receiver
    MockERC721ReceiverReentrant ..|> IERC721Receiver
    NFTClient ..> INFTCollection
```

---

## 2. Responsabilidades

| Tipo | Responsabilidad |
|------|-----------------|
| `INFTCollection` | Superficie pública estable (tests, scripts, UI) |
| `NFTCollection` | Mint/batch, URI, royalties, supply cap, admin |
| OZ `ERC721` | Ownership, transfers, approvals, safe receiver |
| OZ `ERC2981` | `royaltyInfo` + storage default/per-token |
| OZ `Ownable2Step` | Admin URI / royalty / ownership 2-step |
| `IERC721Receiver` | Hook en destinos contrato (safe paths) |
| Mocks | Aceptación, rechazo y reentrancy en tests |
| `NFTClient` | Demo Fase 6–7 (`frontend/`, tema + ayuda) |

---

## 3. Estado crítico (as-built)

```text
Global (NFTCollection):
  MODULE_ID               // constante "04-erc721"
  MAX_SUPPLY              // immutable
  _totalMinted            // totalSupply()
  _nextTokenId            // siguiente id (inicia en 0)
  _baseTokenURI           // raíz dinámica

Por token (OZ ERC721):
  _owners[tokenId]
  _tokenApprovals[tokenId]

Por owner/operator:
  _balances[owner]
  _operatorApprovals[owner][operator]

Royalties (OZ ERC2981):
  default royalty receiver + feeNumerator
  royalty por tokenId (opcional)
```

### Política de `tokenURI` (congelada)

```text
_requireOwned(tokenId)   // si no existe → error OZ / TokenDoesNotExist vía tests
base = _baseTokenURI
bytes(base).length > 0 ? concat(base, tokenId.toString()) : ""
```

Convención off-chain: terminar `baseURI` en `/` si el host lo requiere.

---

## 4. Interface IDs verificados

| Estándar | Interface ID |
|----------|----------------|
| ERC-165 | `0x01ffc9a7` |
| ERC-721 | `0x80ac58cd` |
| ERC-721 Metadata | `0x5b5e139f` |
| ERC-2981 | `0x2a55205a` |

---

## 5. Layout Solidity (implementado)

1. SPDX + `pragma solidity 0.8.24;`
2. Imports OZ + `INFTCollection`
3. Contrato: herencia `INFTCollection, ERC721, ERC2981, Ownable2Step`
4. Estado (`MAX_SUPPLY`, `_totalMinted`, `_nextTokenId`, `_baseTokenURI`)
5. Constructor
6. Views → mint mutators → admin URI/royalty → `_reserveMint` / `_baseURI` / `supportsInterface`

---

## 6. Decisiones de diseño (v1 cerradas)

| Tema | Decisión |
|------|----------|
| Base | OpenZeppelin ERC721 + ERC2981 |
| `tokenId` | Secuencial desde **0** |
| Mint | **onlyOwner** |
| `mint` / `safeMint` | Ambos + variantes batch |
| Royalty per-token | Sí (`set` / `reset`) + default |
| Pausable / Enumerable / URIStorage | No |
| Reveal / allowlist | Fuera de alcance |

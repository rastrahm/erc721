# Class Diagram — ERC-721 NFT Collection & Royalty

> 🌐 **English** · [Español](./01-diagrama-clases-ES.md)

**As-built** view (Phase 7) aligned with `src/NFTCollection.sol` + `INFTCollection.sol` + `frontend/` demo.

---

## 1. Class diagram (Mermaid)

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
        note: without onERC721Received
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

## 2. Responsibilities

| Type | Responsibility |
|------|-----------------|
| `INFTCollection` | Stable public surface (tests, scripts, UI) |
| `NFTCollection` | Mint/batch, URI, royalties, supply cap, admin |
| OZ `ERC721` | Ownership, transfers, approvals, safe receiver |
| OZ `ERC2981` | `royaltyInfo` + default/per-token storage |
| OZ `Ownable2Step` | Admin URI / royalty / 2-step ownership |
| `IERC721Receiver` | Hook on contract recipients (safe paths) |
| Mocks | Acceptance, rejection and reentrancy in tests |
| `NFTClient` | Phase 6–7 demo (`frontend/`, theme + help) |

---

## 3. Critical state (as-built)

```text
Global (NFTCollection):
  MODULE_ID               // constant "04-erc721"
  MAX_SUPPLY              // immutable
  _totalMinted            // totalSupply()
  _nextTokenId            // next id (starts at 0)
  _baseTokenURI           // dynamic root

Per token (OZ ERC721):
  _owners[tokenId]
  _tokenApprovals[tokenId]

Per owner/operator:
  _balances[owner]
  _operatorApprovals[owner][operator]

Royalties (OZ ERC2981):
  default royalty receiver + feeNumerator
  per-tokenId royalty (optional)
```

### `tokenURI` policy (frozen)

```text
_requireOwned(tokenId)   // if it does not exist → OZ error / TokenDoesNotExist via tests
base = _baseTokenURI
bytes(base).length > 0 ? concat(base, tokenId.toString()) : ""
```

Off-chain convention: end `baseURI` with `/` if the host requires it.

---

## 4. Verified interface IDs

| Standard | Interface ID |
|----------|----------------|
| ERC-165 | `0x01ffc9a7` |
| ERC-721 | `0x80ac58cd` |
| ERC-721 Metadata | `0x5b5e139f` |
| ERC-2981 | `0x2a55205a` |

---

## 5. Solidity layout (implemented)

1. SPDX + `pragma solidity 0.8.24;`
2. OZ imports + `INFTCollection`
3. Contract: inherits `INFTCollection, ERC721, ERC2981, Ownable2Step`
4. State (`MAX_SUPPLY`, `_totalMinted`, `_nextTokenId`, `_baseTokenURI`)
5. Constructor
6. Views → mint mutators → admin URI/royalty → `_reserveMint` / `_baseURI` / `supportsInterface`

---

## 6. Design decisions (v1 closed)

| Topic | Decision |
|------|----------|
| Base | OpenZeppelin ERC721 + ERC2981 |
| `tokenId` | Sequential from **0** |
| Mint | **onlyOwner** |
| `mint` / `safeMint` | Both + batch variants |
| Per-token royalty | Yes (`set` / `reset`) + default |
| Pausable / Enumerable / URIStorage | No |
| Reveal / allowlist | Out of scope |

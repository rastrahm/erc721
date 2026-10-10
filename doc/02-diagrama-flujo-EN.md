# Flow Diagram — ERC-721 NFT Collection & Royalty

> 🌐 **English** · [Español](./02-diagrama-flujo-ES.md)

**As-built** sequences (Phase 7): owner/user ↔ wallet/frontend ↔ `NFTCollection`.  
Complements: [`03-flujograma-EN.md`](./03-flujograma-EN.md) · plan: [`00-plan-implementacion-EN.md`](./00-plan-implementacion-EN.md).

---

## 1. Single mint (`safeMint`)

```mermaid
sequenceDiagram
    autonumber
    actor O as Owner
    participant W as Wallet
    participant N as NFTCollection
    participant R as IERC721Receiver (if to is a contract)

    O->>W: safeMint(to)
    W->>N: safeMint(to)
    Note over N: onlyOwner
    Note over N: Checks via _reserveMint:<br/>to != 0, totalSupply + 1 <= maxSupply
    Note over N: Effects: _nextTokenId++, _totalMinted++,<br/>then _safeMint → owner/balance
    Note over N: Emit Transfer(0, to, tokenId)
    alt to is EOA
        N-->>W: tokenId
    else to is contract
        N->>R: onERC721Received(operator, 0, tokenId, data)
        alt invalid selector / revert
            N-->>W: revert (token not locked)
        else OK
            N-->>W: tokenId
        end
    end
    W-->>O: receipt + tokenId
```

---

## 2. Batch mint (`safeMintBatch`)

```mermaid
sequenceDiagram
    autonumber
    actor O as Owner
    participant W as Wallet
    participant N as NFTCollection

    O->>W: safeMintBatch(to, quantity)
    W->>N: safeMintBatch(to, quantity)
    Note over N: onlyOwner
    Note over N: Checks via _reserveMint:<br/>quantity > 0, to != 0,<br/>totalSupply + quantity <= maxSupply
    loop i = 0 .. quantity-1 (unchecked after checks)
        Note over N: Effects: _safeMint(tokenId = start + i)
        Note over N: safe receiver check per token (if to is contract)
    end
    Note over N: Emit BatchMinted(to, fromTokenId, quantity)
    N-->>W: OK
    W-->>O: receipt
```

---

## 3. Base URI update

```mermaid
sequenceDiagram
    autonumber
    actor O as Owner
    participant W as Wallet
    participant N as NFTCollection

    O->>W: setBaseURI(newURI)
    W->>N: setBaseURI(newURI)
    Note over N: onlyOwner (Ownable2Step)
    Note over N: Effects: _baseTokenURI = newURI
    N-->>W: BaseURIUpdated
    Note over N: tokenURI(tokenId) reflects the new root<br/>for all existing tokens
```

---

## 4. Safe transfer between users

```mermaid
sequenceDiagram
    autonumber
    actor U as Holder
    participant W as Wallet
    participant N as NFTCollection
    participant R as Receiver contract (optional)

    U->>W: safeTransferFrom(from, to, tokenId)
    W->>N: safeTransferFrom(from, to, tokenId)
    Note over N: Checks: approved or owner, token exists, to != 0
    Note over N: Effects: clear approval, update owner/balances
    Note over N: Emit Transfer
    alt to is contract
        N->>R: onERC721Received(...)
        alt fail
            N-->>W: revert
        else OK
            N-->>W: success
        end
    else EOA
        N-->>W: success
    end
```

---

## 5. Approvals

```mermaid
sequenceDiagram
    autonumber
    actor U as Token owner
    participant W as Wallet
    participant N as NFTCollection
    actor Op as Operator / Spender

    alt approve per token
        U->>W: approve(spender, tokenId)
        W->>N: approve(spender, tokenId)
        N-->>W: Approval
    else setApprovalForAll
        U->>W: setApprovalForAll(operator, true)
        W->>N: setApprovalForAll(operator, true)
        N-->>W: ApprovalForAll
    end
    Op->>N: transferFrom(from, to, tokenId)
    Note over N: Authorized via getApproved or isApprovedForAll
```

---

## 6. Royalty query (ERC-2981)

```mermaid
sequenceDiagram
    autonumber
    actor M as Marketplace / UI
    participant N as NFTCollection

    M->>N: royaltyInfo(tokenId, salePrice)
    Note over N: Uses default (or per-token if it exists)
    Note over N: royaltyAmount = salePrice * feeNumerator / feeDenominator
    N-->>M: (receiver, royaltyAmount)
```

---

## 7. Royalty configuration (admin)

```mermaid
sequenceDiagram
    autonumber
    actor O as Owner
    participant W as Wallet
    participant N as NFTCollection

    O->>W: setDefaultRoyalty(receiver, feeNumerator)
    W->>N: setDefaultRoyalty(receiver, feeNumerator)
    Note over N: onlyOwner
    alt invalid fee or receiver = 0
        N-->>W: revert InvalidRoyalty / ZeroAddress
    else OK
        Note over N: Effects: _setDefaultRoyalty
        N-->>W: RoyaltyUpdated
    end
```

---

## 8. 2-step ownership (Ownable2Step)

```mermaid
sequenceDiagram
    autonumber
    actor O as Current owner
    actor P as New owner
    participant N as NFTCollection

    O->>N: transferOwnership(P)
    Note over N: pendingOwner = P
    P->>N: acceptOwnership()
    Note over N: owner = P; pending cleared
    Note over O,P: Only the accepted owner can setBaseURI / royalties / mint
```

---

## 9. Test lifecycle (mint → URI → transfer → royalty → interface)

```mermaid
sequenceDiagram
    autonumber
    participant Test as Foundry Test
    participant N as NFTCollection
    participant Bad as NonReceiverContract

    Test->>N: supportsInterface(721/165/2981)
    Test->>N: safeMint(user)
    Test->>N: tokenURI(tokenId)
    Test->>N: royaltyInfo(tokenId, 1 ether)
    Test->>N: safeTransferFrom(user, other, tokenId)
    Test->>N: safeMint(Bad)
    Note over Test,N: Expect revert (no onERC721Received)
    Test->>N: mintBatch up to maxSupply + 1
    Note over Test,N: Expect MaxSupplyExceeded
```

---

## 10. Safe mint to a malicious / hookless contract (must fail)

```mermaid
sequenceDiagram
    autonumber
    participant O as Owner
    participant N as NFTCollection
    participant A as AttackerContract without receiver

    O->>N: safeMint(A)
    Note over N: Effects prepared / mint attempt
    N->>A: onERC721Received (will fail: no code or bad selector)
    N-->>O: revert
    Note over A: No token is left locked in A
```

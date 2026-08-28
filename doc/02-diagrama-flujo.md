# Diagrama de flujo — ERC-721 NFT Collection & Royalty

Secuencias de interacción entre **usuario/owner**, **wallet/frontend** y **NFTCollection** (diseño v1). Complementa el [flujograma de decisiones](./03-flujograma.md). Plan: [`00-plan-implementacion.md`](./00-plan-implementacion.md).

---

## 1. Mint individual (`safeMint`)

```mermaid
sequenceDiagram
    autonumber
    actor O as Owner
    participant W as Wallet
    participant N as NFTCollection
    participant R as IERC721Receiver (si to es contrato)

    O->>W: safeMint(to)
    W->>N: safeMint(to)
    Note over N: onlyOwner
    Note over N: Checks: to != 0, totalSupply + 1 <= maxSupply
    Note over N: Effects: _nextTokenId++, owner/balance
    Note over N: Emit Transfer(0, to, tokenId)
    alt to es EOA
        N-->>W: tokenId
    else to es contrato
        N->>R: onERC721Received(operator, 0, tokenId, data)
        alt selector inválido / revert
            N-->>W: revert (token no locked)
        else OK
            N-->>W: tokenId
        end
    end
    W-->>O: receipt + tokenId
```

---

## 2. Mint por lotes (`safeMintBatch`)

```mermaid
sequenceDiagram
    autonumber
    actor O as Owner
    participant W as Wallet
    participant N as NFTCollection

    O->>W: safeMintBatch(to, quantity)
    W->>N: safeMintBatch(to, quantity)
    Note over N: onlyOwner
    Note over N: Checks: quantity > 0, to != 0,<br/>totalSupply + quantity <= maxSupply
    loop i = 0 .. quantity-1 (unchecked tras checks)
        Note over N: Effects: mint tokenId = start + i
        Note over N: safe receiver check por token (si to contrato)
    end
    Note over N: Emit BatchMinted(to, fromTokenId, quantity)
    N-->>W: OK
    W-->>O: receipt
```

---

## 3. Actualización de Base URI

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
    Note over N: tokenURI(tokenId) refleja nueva raíz<br/>para todos los tokens existentes
```

---

## 4. Transferencia segura entre usuarios

```mermaid
sequenceDiagram
    autonumber
    actor U as Holder
    participant W as Wallet
    participant N as NFTCollection
    participant R as Receiver contract (opcional)

    U->>W: safeTransferFrom(from, to, tokenId)
    W->>N: safeTransferFrom(from, to, tokenId)
    Note over N: Checks: approved o owner, token existe, to != 0
    Note over N: Effects: clear approval, update owner/balances
    Note over N: Emit Transfer
    alt to es contrato
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
    actor U as Owner del token
    participant W as Wallet
    participant N as NFTCollection
    actor Op as Operator / Spender

    alt approve por token
        U->>W: approve(spender, tokenId)
        W->>N: approve(spender, tokenId)
        N-->>W: Approval
    else setApprovalForAll
        U->>W: setApprovalForAll(operator, true)
        W->>N: setApprovalForAll(operator, true)
        N-->>W: ApprovalForAll
    end
    Op->>N: transferFrom(from, to, tokenId)
    Note over N: Autorizado vía getApproved o isApprovedForAll
```

---

## 6. Consulta de royalty (ERC-2981)

```mermaid
sequenceDiagram
    autonumber
    actor M as Marketplace / UI
    participant N as NFTCollection

    M->>N: royaltyInfo(tokenId, salePrice)
    Note over N: Usa default (o per-token si existe)
    Note over N: royaltyAmount = salePrice * feeNumerator / feeDenominator
    N-->>M: (receiver, royaltyAmount)
```

---

## 7. Configuración de royalty (admin)

```mermaid
sequenceDiagram
    autonumber
    actor O as Owner
    participant W as Wallet
    participant N as NFTCollection

    O->>W: setDefaultRoyalty(receiver, feeNumerator)
    W->>N: setDefaultRoyalty(receiver, feeNumerator)
    Note over N: onlyOwner
    alt fee inválido o receiver = 0
        N-->>W: revert InvalidRoyalty / ZeroAddress
    else OK
        Note over N: Effects: _setDefaultRoyalty
        N-->>W: RoyaltyUpdated
    end
```

---

## 8. Ownership 2-step (Ownable2Step)

```mermaid
sequenceDiagram
    autonumber
    actor O as Owner actual
    actor P as Nuevo owner
    participant N as NFTCollection

    O->>N: transferOwnership(P)
    Note over N: pendingOwner = P
    P->>N: acceptOwnership()
    Note over N: owner = P; pending limpio
    Note over O,P: Solo el owner aceptado puede setBaseURI / royalties / mint
```

---

## 9. Lifecycle de test (mint → URI → transfer → royalty → interface)

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
    Test->>N: mintBatch hasta maxSupply + 1
    Note over Test,N: Expect MaxSupplyExceeded
```

---

## 10. Safe mint a contrato malicioso / sin hook (debe fallar)

```mermaid
sequenceDiagram
    autonumber
    participant O as Owner
    participant N as NFTCollection
    participant A as AttackerContract sin receiver

    O->>N: safeMint(A)
    Note over N: Effects preparados / intento de mint
    N->>A: onERC721Received (fallará: sin código o selector malo)
    N-->>O: revert
    Note over A: No queda token locked en A
```

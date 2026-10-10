# Limitations — module 04 ERC-721

> 🌐 **English** · [Español](./LIMITACIONES-ES.md)

**v1** scope and known behaviors. These are not open bugs unless stated otherwise.

---

## Out of scope (v1)

| Item | Note |
|------|------|
| Public mint / allowlist / whitelist | `onlyOwner` only |
| Pausable | Not implemented |
| ERC-721 Enumerable | No (gas) |
| Per-token ERC-721URIStorage | No; a single `baseURI` |
| Reveal / rich on-chain metadata | Only `baseURI + tokenId` |
| Marketplace / escrow | Only on-chain `royaltyInfo` |
| Multisig / AccessControl roles | Ownable2Step only |
| Upgradeable (proxy) | Contract is not upgradeable |
| Mainnet production hardening | Demo + local tests / optional testnet |

---

## Behaviors to keep in mind

1. **`mint` vs `safeMint`:** `mint` to a contract without a receiver can **lock** the NFT. Prefer `safeMint` / `safeTransferFrom` towards contracts.
2. **`tokenURI` with an empty `baseURI`:** OZ behavior — if the token exists and the base is empty, it returns `""` (the id is not concatenated).
3. **URI convention:** the caller must add the trailing `/` to `baseURI` if the off-chain side needs it.
4. **Ownable:** access denial uses OZ errors (`OwnableUnauthorizedAccount`), not necessarily the interface's `Unauthorized()`.
5. **`NotImplemented()`:** declared in the interface for the Phase 1 skeleton; **not** used in the final implementation.
6. **Frontend:** does not expose per-token royalty admin or Ownable2Step; only mint/transfer/URI/royalty lookup + setBaseURI.
7. **Node:** UI builds/tests fail or are fragile on Node &lt; 20.
8. **Chain mismatch:** the UI tries `wallet_switchEthereumChain`; if MetaMask rejects it, you must switch the network manually.
9. **Supply:** once `maxSupply` is exhausted, any mint/batch reverts with `MaxSupplyExceeded`.
10. **Anvil keys:** for local demo only; they are not production secrets.

---

## Security (summary)

SWC audit and campaigns: [`SWC-AUDIT-EN.md`](./SWC-AUDIT-EN.md), [`ATAQUES-EN.md`](./ATAQUES-EN.md).  
Main mitigations: custom errors, supply check before `unchecked` loops, safe receiver on safe paths, Ownable2Step for admin.

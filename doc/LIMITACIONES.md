# Limitaciones — módulo 04 ERC-721

Alcance **v1** y comportamientos conocidos. No son bugs abiertos salvo que se indique.

---

## Fuera de alcance (v1)

| Ítem | Nota |
|------|------|
| Mint público / allowlist / whitelist | Solo `onlyOwner` |
| Pausable | No implementado |
| ERC-721 Enumerable | No (gas) |
| ERC-721URIStorage por token | No; una sola `baseURI` |
| Reveal / metadata on-chain rica | Solo `baseURI + tokenId` |
| Marketplace / escrow | Solo `royaltyInfo` on-chain |
| Multisig / AccessControl roles | Solo Ownable2Step |
| Upgradeable (proxy) | Contrato no upgradeable |
| Mainnet production hardening | Demo + tests locales / testnet opcional |

---

## Comportamientos a tener en cuenta

1. **`mint` vs `safeMint`:** `mint` a un contrato sin receiver puede **bloquear** el NFT. Preferir `safeMint` / `safeTransferFrom` hacia contratos.
2. **`tokenURI` con `baseURI` vacío:** comportamiento OZ — si el token existe y la base está vacía, retorna `""` (no concatena el id).
3. **Convención de URI:** el caller debe poner el `/` final en `baseURI` si lo necesita el off-chain.
4. **Ownable:** denegación de acceso usa errores OZ (`OwnableUnauthorizedAccount`), no necesariamente `Unauthorized()` de la interfaz.
5. **`NotImplemented()`:** declarado en la interfaz por el esqueleto Fase 1; **no** se usa en la implementación final.
6. **Frontend:** no expone admin de royalty per-token ni Ownable2Step; solo mint/transfer/URI/consulta royalty + setBaseURI.
7. **Node:** builds/tests de la UI fallan o son frágiles en Node &lt; 20.
8. **Chain mismatch:** la UI intenta `wallet_switchEthereumChain`; si MetaMask rechaza, hay que cambiar la red a mano.
9. **Supply:** al agotar `maxSupply`, cualquier mint/batch revierte `MaxSupplyExceeded`.
10. **Keys Anvil:** solo para demo local; no son secretos de producción.

---

## Seguridad (resumen)

Auditoría SWC y campañas: [`SWC-AUDIT.md`](./SWC-AUDIT.md), [`ATAQUES.md`](./ATAQUES.md).  
Mitigaciones principales: custom errors, supply check antes de loops `unchecked`, safe receiver en rutas safe, Ownable2Step para admin.

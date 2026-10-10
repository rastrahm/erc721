# Help manual — NFTCollection Frontend

> 🌐 **English** · [Español](./MANUAL-FRONTEND-ES.md)

User guide for the Next.js demo (`frontend/`). In-app version: **http://localhost:3000/ayuda** (**? Ayuda** (? Help) button in the UI).

---

## 1. Requirements

| Requirement | Detail |
|-------------|--------|
| Node | ≥ 20 (recommended `nvm use 22`) |
| Anvil | `http://127.0.0.1:8545`, chainId `31337` |
| Deploy | `forge script script/Deploy.s.sol:Deploy … --broadcast` |
| Env | `frontend/.env.local` with `NEXT_PUBLIC_COLLECTION_ADDRESS` |
| Wallet | MetaMask on Localhost; Anvil #0 = owner |

Full setup: [`FRONTEND-EN.md`](./FRONTEND-EN.md) · [`DEPLOY-EN.md`](./DEPLOY-EN.md).

---

## 2. Top bar

| Control | Action |
|---------|--------|
| **? Ayuda** | Opens this manual at `/ayuda` |
| **☀ Claro / ☾ Oscuro** (☀ Light / ☾ Dark) | Toggles the theme; saved in `localStorage` (`nft-theme`) |
| **← Colección** (← Collection) (on `/ayuda`) | Returns to the home page |

---

## 3. Connect wallet

1. On the home page, click **Conectar wallet** (Connect wallet).
2. Approve in MetaMask. If the network is not `31337`, the app tries to switch it.
3. If you are the contract owner, the **Owner** badge appears.

**Anvil #0 (demo):**

- Address: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
- Private key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`

---

## 4. Collection panel

Shows the name, symbol, supply (`total / max`), your NFT balance, base URI and the default royalty computed on an example sale of 1 ETH.

---

## 5. Mint (owner only)

| Field / button | Purpose |
|----------------|---------|
| Destinatario (Recipient) | Receiving address (empty = your wallet) |
| Cantidad batch (Batch quantity) | Integer ≥ 1 for batch minting |
| **Mint** | A single token (no safe receiver) |
| **Safe mint** | A single token; contracts must implement `onERC721Received` |
| **Mint batch** | Several consecutive `tokenId`s |

Without the Owner badge, mint and setBaseURI are disabled.

---

## 6. Transfer

1. A token ID you own.
2. Destination address.
3. **Safe transfer** → confirm in the wallet.

---

## 7. TokenURI · Royalty

1. An existing token ID + sale price in ETH.
2. **Consultar** (Look up) → `tokenURI`, token owner and `royaltyInfo` (ERC-2981).

---

## 8. Base URI (owner)

Updates the metadata root. Convention: end with `/`.  
`tokenURI(id) = baseURI + id`.

---

## 9. Common errors

| Message | What to do |
|---------|------------|
| Falta configuración (Missing configuration) | Complete `.env.local` |
| Red incorrecta (Wrong network) | Chain 31337 in MetaMask |
| MaxSupplyExceeded | Supply exhausted |
| Solo el owner… (Only the owner…) | Use the owner account (Anvil #0) |
| ERC721InvalidReceiver | Destination is a contract without a receiver; use an EOA or a valid receiver |
| Transacción rechazada (Transaction rejected) | You cancelled in MetaMask |

---

## 10. Useful scripts

```bash
# Contracts
export PATH="$HOME/.foundry/bin:$PATH"
anvil                                          # terminal A
forge script script/Deploy.s.sol:Deploy \
  --rpc-url http://127.0.0.1:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --broadcast                                  # terminal B

# UI
cd frontend
cp .env.example .env.local   # paste the deploy address
npm install && npm run dev   # http://localhost:3000
# Help: http://localhost:3000/ayuda
```

# Manual de ayuda — Frontend NFTCollection

Guía de usuario de la demo Next.js (`frontend/`). Versión in-app: **http://localhost:3000/ayuda** (botón **? Ayuda** en la UI).

---

## 1. Requisitos

| Requisito | Detalle |
|-----------|---------|
| Node | ≥ 20 (recomendado `nvm use 22`) |
| Anvil | `http://127.0.0.1:8545`, chainId `31337` |
| Deploy | `forge script script/Deploy.s.sol:Deploy … --broadcast` |
| Env | `frontend/.env.local` con `NEXT_PUBLIC_COLLECTION_ADDRESS` |
| Wallet | MetaMask en Localhost; Anvil #0 = owner |

Setup completo: [`FRONTEND.md`](./FRONTEND.md) · [`DEPLOY.md`](./DEPLOY.md).

---

## 2. Barra superior

| Control | Acción |
|---------|--------|
| **? Ayuda** | Abre este manual en `/ayuda` |
| **☀ Claro / ☾ Oscuro** | Alterna tema; se guarda en `localStorage` (`nft-theme`) |
| **← Colección** (en `/ayuda`) | Vuelve a la home |

---

## 3. Conectar wallet

1. En la home, pulsa **Conectar wallet**.
2. Acepta en MetaMask. Si la red no es `31337`, la app intenta cambiarla.
3. Si eres el owner del contrato, aparece el badge **Owner**.

**Anvil #0 (demo):**

- Address: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
- Private key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`

---

## 4. Panel Colección

Muestra nombre, símbolo, supply (`total / max`), tu balance NFT, base URI y royalty por defecto calculada sobre 1 ETH de ejemplo.

---

## 5. Mint (solo owner)

| Campo / botón | Uso |
|---------------|-----|
| Destinatario | Address receptora (vacío = tu wallet) |
| Cantidad batch | Entero ≥ 1 para mint por lotes |
| **Mint** | Un token (sin safe receiver) |
| **Safe mint** | Un token; contratos deben implementar `onERC721Received` |
| **Mint batch** | Varios `tokenId` consecutivos |

Sin badge Owner, mint y setBaseURI quedan deshabilitados.

---

## 6. Transfer

1. Token ID que posees.
2. Address destino.
3. **Safe transfer** → confirma en la wallet.

---

## 7. TokenURI · Royalty

1. Token ID existente + sale price en ETH.
2. **Consultar** → `tokenURI`, owner del token y `royaltyInfo` (ERC-2981).

---

## 8. Base URI (owner)

Actualiza la raíz de metadata. Convención: terminar en `/`.  
`tokenURI(id) = baseURI + id`.

---

## 9. Errores frecuentes

| Mensaje | Qué hacer |
|---------|-----------|
| Falta configuración | Completar `.env.local` |
| Red incorrecta | Chain 31337 en MetaMask |
| MaxSupplyExceeded | Supply agotado |
| Solo el owner… | Usar cuenta owner (Anvil #0) |
| ERC721InvalidReceiver | Destino contrato sin receiver; usa EOA o receiver válido |
| Transacción rechazada | Cancelaste en MetaMask |

---

## 10. Scripts útiles

```bash
# Contratos
export PATH="$HOME/.foundry/bin:$PATH"
anvil                                          # terminal A
forge script script/Deploy.s.sol:Deploy \
  --rpc-url http://127.0.0.1:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --broadcast                                  # terminal B

# UI
cd frontend
cp .env.example .env.local   # pegar address del deploy
npm install && npm run dev   # http://localhost:3000
# Ayuda: http://localhost:3000/ayuda
```

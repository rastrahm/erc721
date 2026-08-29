# Deploy playbook — NFTCollection (Fase 5)

Comandos para desplegar la colección ERC-721 + ERC-2981 y exportar ABIs.

## Prerrequisitos

```bash
export PATH="$HOME/.foundry/bin:$PATH"
cp .env.example .env   # no commitear .env real
forge build
```

## 1. Anvil (demo local)

Terminal A:

```bash
anvil
```

- RPC: `http://127.0.0.1:8545`
- Chain id: `31337`
- Cuenta #0:
  - Address: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
  - Private key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`

Terminal B — deploy con broadcast:

```bash
forge script script/Deploy.s.sol:Deploy \
  --rpc-url http://127.0.0.1:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --broadcast
```

Copia la address del log (`NFTCollection`).

### Variables de entorno (opcionales)

| Env | Default | Uso |
|-----|---------|-----|
| `INITIAL_OWNER` | broadcaster | Owner (`Ownable2Step`) |
| `COLLECTION_NAME` | `Demo NFT Collection` | Nombre ERC-721 |
| `COLLECTION_SYMBOL` | `DNFT` | Símbolo |
| `MAX_SUPPLY` | `10000` | Techo de mint |
| `BASE_URI` | `https://example.com/metadata/` | Raíz metadata (terminar en `/`) |
| `ROYALTY_RECEIVER` | `INITIAL_OWNER` | Beneficiario ERC-2981 |
| `ROYALTY_FEE_NUMERATOR` | `500` | Basis points (5%) |

Ejemplo custom:

```bash
COLLECTION_NAME="My Art" COLLECTION_SYMBOL="ART" MAX_SUPPLY=5000 \
ROYALTY_FEE_NUMERATOR=750 \
forge script script/Deploy.s.sol:Deploy \
  --rpc-url http://127.0.0.1:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --broadcast
```

## 2. Exportar ABIs

```bash
chmod +x script/export-abi.sh
./script/export-abi.sh
```

Genera (en `doc/abi/` y `frontend/abi/`):

- `NFTCollection.json`
- `INFTCollection.json`

## 3. Frontend env (Fase 6)

Ver playbook completo: [`FRONTEND.md`](./FRONTEND.md).

```bash
cd frontend
cp .env.example .env.local
# Rellena NEXT_PUBLIC_COLLECTION_ADDRESS del log de Deploy

NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_COLLECTION_ADDRESS=0x...

# Requiere Node ≥ 20 (nvm use 22)
npm install && npm run dev
```

## 4. Testnet (opcional)

```bash
source .env
forge script script/Deploy.s.sol:Deploy \
  --rpc-url "$RPC_URL" \
  --private-key "$PRIVATE_KEY" \
  --broadcast \
  --verify   # requiere ETHERSCAN_API_KEY
```

Documenta addresses fuera de git (`.env.local` ignorado).

## Ownership

`mint`, `setBaseURI`, `setDefaultRoyalty` y funciones admin son `onlyOwner`.  
En producción: multisig / Timelock como `INITIAL_OWNER`, no una EOA frágil.

## Verificación rápida post-deploy

Reemplaza `$COLLECTION` con la address del log:

```bash
export COLLECTION=0x...
export RPC=http://127.0.0.1:8545

cast call $COLLECTION "name()(string)" --rpc-url $RPC
cast call $COLLECTION "symbol()(string)" --rpc-url $RPC
cast call $COLLECTION "maxSupply()(uint256)" --rpc-url $RPC
cast call $COLLECTION "totalSupply()(uint256)" --rpc-url $RPC
cast call $COLLECTION "owner()(address)" --rpc-url $RPC
cast call $COLLECTION "supportsInterface(bytes4)(bool)" 0x80ac58cd --rpc-url $RPC
cast call $COLLECTION "supportsInterface(bytes4)(bool)" 0x2a55205a --rpc-url $RPC
```

Mint de prueba (solo owner):

```bash
cast send $COLLECTION "mint(address)(uint256)" 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 \
  --rpc-url $RPC \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

## Artefactos de broadcast

Foundry guarda en `broadcast/Deploy.s.sol/31337/` (ignorado por git). Útil para recuperar la última address local.

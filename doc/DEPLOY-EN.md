# Deploy playbook — NFTCollection (Phase 5)

> 🌐 **English** · [Español](./DEPLOY-ES.md)

Commands to deploy the ERC-721 + ERC-2981 collection and export the ABIs.

## Prerequisites

```bash
export PATH="$HOME/.foundry/bin:$PATH"
cp .env.example .env   # do not commit the real .env
forge build
```

## 1. Anvil (local demo)

Terminal A:

```bash
anvil
```

- RPC: `http://127.0.0.1:8545`
- Chain id: `31337`
- Account #0:
  - Address: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
  - Private key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`

Terminal B — deploy with broadcast:

```bash
forge script script/Deploy.s.sol:Deploy \
  --rpc-url http://127.0.0.1:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --broadcast
```

Copy the address from the log (`NFTCollection`).

### Environment variables (optional)

| Env | Default | Purpose |
|-----|---------|---------|
| `INITIAL_OWNER` | broadcaster | Owner (`Ownable2Step`) |
| `COLLECTION_NAME` | `Demo NFT Collection` | ERC-721 name |
| `COLLECTION_SYMBOL` | `DNFT` | Symbol |
| `MAX_SUPPLY` | `10000` | Mint cap |
| `BASE_URI` | `https://example.com/metadata/` | Metadata root (must end with `/`) |
| `ROYALTY_RECEIVER` | `INITIAL_OWNER` | ERC-2981 beneficiary |
| `ROYALTY_FEE_NUMERATOR` | `500` | Basis points (5%) |

Custom example:

```bash
COLLECTION_NAME="My Art" COLLECTION_SYMBOL="ART" MAX_SUPPLY=5000 \
ROYALTY_FEE_NUMERATOR=750 \
forge script script/Deploy.s.sol:Deploy \
  --rpc-url http://127.0.0.1:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --broadcast
```

## 2. Export ABIs

```bash
chmod +x script/export-abi.sh
./script/export-abi.sh
```

Generates (in `doc/abi/` and `frontend/abi/`):

- `NFTCollection.json`
- `INFTCollection.json`

## 3. Frontend env (Phase 6)

See the full playbook: [`FRONTEND-EN.md`](./FRONTEND-EN.md).

```bash
cd frontend
cp .env.example .env.local
# Fill in NEXT_PUBLIC_COLLECTION_ADDRESS from the Deploy log

NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_COLLECTION_ADDRESS=0x...

# Requires Node ≥ 20 (nvm use 22)
npm install && npm run dev
```

## 4. Testnet (optional)

```bash
source .env
forge script script/Deploy.s.sol:Deploy \
  --rpc-url "$RPC_URL" \
  --private-key "$PRIVATE_KEY" \
  --broadcast \
  --verify   # requires ETHERSCAN_API_KEY
```

Record addresses outside of git (`.env.local` is ignored).

## Ownership

`mint`, `setBaseURI`, `setDefaultRoyalty` and the admin functions are `onlyOwner`.  
In production: use a multisig / Timelock as `INITIAL_OWNER`, not a fragile EOA.

## Quick post-deploy verification

Replace `$COLLECTION` with the address from the log:

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

Test mint (owner only):

```bash
cast send $COLLECTION "mint(address)(uint256)" 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 \
  --rpc-url $RPC \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

## Broadcast artifacts

Foundry stores them in `broadcast/Deploy.s.sol/31337/` (ignored by git). Useful to recover the latest local address.

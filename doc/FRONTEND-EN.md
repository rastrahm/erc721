# Frontend demo — Phase 6

> 🌐 **English** · [Español](./FRONTEND-ES.md)

Next.js (App Router) UI for `NFTCollection`: connect a wallet, mint (owner), transfer, look up `tokenURI` / royalty and update the base URI.

## Prerequisites

1. Node **≥ 20** (22 recommended via nvm).
2. Anvil + deploy (see [`DEPLOY-EN.md`](./DEPLOY-EN.md)).
3. ABIs in `frontend/abi/` (`./script/export-abi.sh`).

## Setup

```bash
cd frontend
cp .env.example .env.local
# Edit NEXT_PUBLIC_COLLECTION_ADDRESS using the Deploy.s.sol log

npm install
npm run dev
```

Open http://localhost:3000. In MetaMask:

- Network: Localhost 8545, chainId **31337**
- Import the Anvil #0 private key (local demo only) — it is the **owner** of the default deploy

**Help manual:** **? Ayuda** (? Help) button in the UI → http://localhost:3000/ayuda  
Full document: [`MANUAL-FRONTEND-EN.md`](./MANUAL-FRONTEND-EN.md).

## Happy path

1. **Conectar wallet** (Connect wallet) → Anvil account #0 on chain 31337 (**Owner** badge).
2. **Mint** → leave the recipient empty to mint to your wallet, or paste another address.
3. **Mint batch** → quantity `3` (or whatever you want, ≤ remaining supply).
4. **Consultar** (Look up) token ID `0` with sale price `1` → see `tokenURI` and royalty.
5. **Safe transfer** → send the token to another Anvil account (e.g. #1).
6. (Owner) **Actualizar URI** (Update URI) → change the base URI and look it up again.

Playbooks: [`DEPLOY-EN.md`](./DEPLOY-EN.md) · manual: [`MANUAL-FRONTEND-EN.md`](./MANUAL-FRONTEND-EN.md) · handoff: [`HANDOFF-EN.md`](./HANDOFF-EN.md).

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm test` | Vitest + RTL (**9** tests) |
| `npm run lint` | ESLint |

## Next.js / env note

On the client, Next **only** injects variables accessed statically:

```ts
process.env.NEXT_PUBLIC_RPC_URL  // ✅
process.env["NEXT_PUBLIC_RPC_URL"] // ❌ usually ends up undefined in the browser
```

That is why `src/lib/env.ts` reads each key explicitly.

## Variables

| Env | Example |
|-----|---------|
| `NEXT_PUBLIC_RPC_URL` | `http://127.0.0.1:8545` |
| `NEXT_PUBLIC_CHAIN_ID` | `31337` |
| `NEXT_PUBLIC_COLLECTION_ADDRESS` | address from `Deploy.s.sol` |

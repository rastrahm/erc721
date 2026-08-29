# Frontend demo — Fase 6

UI Next.js (App Router) para `NFTCollection`: conectar wallet, mint (owner), transfer, consultar `tokenURI` / royalty y actualizar base URI.

## Prerrequisitos

1. Node **≥ 20** (recomendado 22 via nvm).
2. Anvil + deploy (ver [`DEPLOY.md`](./DEPLOY.md)).
3. ABIs en `frontend/abi/` (`./script/export-abi.sh`).

## Setup

```bash
cd frontend
cp .env.example .env.local
# Edita NEXT_PUBLIC_COLLECTION_ADDRESS con el log de Deploy.s.sol

npm install
npm run dev
```

Abre http://localhost:3000. En MetaMask:

- Red: Localhost 8545, chainId **31337**
- Importa la private key Anvil #0 (solo demo local) — es el **owner** del deploy por defecto

**Manual de ayuda:** botón **? Ayuda** en la UI → http://localhost:3000/ayuda  
Documento completo: [`MANUAL-FRONTEND.md`](./MANUAL-FRONTEND.md).

## Flujo feliz

1. **Conectar wallet** → cuenta Anvil #0 en chain 31337 (badge **Owner**).
2. **Mint** → deja el destinatario vacío para mintear a tu wallet, o pega otra address.
3. **Mint batch** → cantidad `3` (o la que quieras, ≤ remaining supply).
4. **Consultar** token ID `0` con sale price `1` → ver `tokenURI` y royalty.
5. **Safe transfer** → envía el token a otra cuenta Anvil (p. ej. #1).
6. (Owner) **Actualizar URI** → cambia la base URI y vuelve a consultar.

Playbooks: [`DEPLOY.md`](./DEPLOY.md) · manual: [`MANUAL-FRONTEND.md`](./MANUAL-FRONTEND.md) · handoff: [`HANDOFF.md`](./HANDOFF.md).

## Scripts

| Comando | Uso |
|---------|-----|
| `npm run dev` | Dev server |
| `npm run build` | Build producción |
| `npm test` | Vitest + RTL (**9** tests) |
| `npm run lint` | ESLint |

## Nota Next.js / env

En el cliente, Next **solo** inyecta variables con acceso estático:

```ts
process.env.NEXT_PUBLIC_RPC_URL  // ✅
process.env["NEXT_PUBLIC_RPC_URL"] // ❌ suele quedar undefined en browser
```

Por eso `src/lib/env.ts` lee cada clave de forma explícita.

## Variables

| Env | Ejemplo |
|-----|---------|
| `NEXT_PUBLIC_RPC_URL` | `http://127.0.0.1:8545` |
| `NEXT_PUBLIC_CHAIN_ID` | `31337` |
| `NEXT_PUBLIC_COLLECTION_ADDRESS` | address del `Deploy.s.sol` |

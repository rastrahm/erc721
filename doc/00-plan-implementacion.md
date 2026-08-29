# Plan de implementación — ERC-721 NFT Collection & Royalty (Módulo 04)

Documento maestro del módulo. Define fases, entregables, criterios de aceptación y el **protocolo de autorización** usado durante el desarrollo.

> **Estado actual:** Fases **0–7** ✅ (módulo cerrado, 2026-08-29).

---

## Protocolo de autorización

> **Regla dura:** cada fase debe ser revisada y **aprobada explícitamente** por el responsable del proyecto antes de iniciar la siguiente.  
> No se escribe código de implementación de una fase sin esa confirmación.  
> Al cerrar una fase: marcar estado → `✅ Aprobada` + fecha; solo entonces se puede pedir arranque de la siguiente.

| Estado | Significado |
|--------|-------------|
| 🔒 Pendiente de autorización | Diseño listo; **no ejecutar** hasta OK |
| 🔄 En curso | Autorizada y en desarrollo |
| ✅ Aprobada | Cerrada; se puede proponer la siguiente |
| ⏸️ Pausada | Bloqueada por decisión externa |

**Cómo autorizar:** responde en el chat con algo como `Autorizo Fase N` (o rechaza con cambios concretos).

---

## 1. Objetivo del módulo

Construir una **colección NFT ERC-721 gas-optimizada** que:

- Implemente **ERC-721** completo (`ownerOf`, `transferFrom`, `safeTransferFrom`, `approve`, `setApprovalForAll`, `balanceOf`).
- Soporte **ERC-165** (`supportsInterface`) y **ERC-2981** (royalties on-chain).
- Permita **mint individual y por lotes** con guardas de supply y quantity.
- Gestione **base URI dinámica** (owner puede actualizar metadata root).
- Use **Ownable2Step** para admin (URI, royalties, supply caps).
- Enforce **safe mint/transfer** vía `onERC721Received` cuando el destino es contrato.
- Aplique **custom errors**, NatSpec y optimizaciones (`unchecked` solo con bounds previos).
- Incluya suite Foundry: unit + fuzz + invariant + attack + tests de interfaces y safe-receiver.
- Incluya demo Next.js (Fase 6 ✅): wallet, mint, transfer, URI, royalty, tema claro/oscuro, manual `/ayuda`.
- Docs finales / handoff (Fase 7 ✅).

---

## 2. Stack acordado

| Capa | Tecnología | Notas |
|------|------------|--------|
| Contratos | Solidity `0.8.24` (pragma fijo) | Sin floating pragma |
| Tooling | Foundry (`forge`, `cast`, `anvil`) | Unit, fuzz, invariant, gas report |
| Librerías | OpenZeppelin **v5.0.2** | `ERC721`, `ERC2981`, `Ownable2Step`, ERC-165 |
| Estándares | ERC-721, ERC-165, ERC-2981 | Interface IDs verificados en tests |
| Frontend | Next.js 15 App Router + TS + ethers v6 + Zod | Fase 6 ✅ |
| Tests UI | Vitest + RTL | Fase 6 ✅ (`frontend/`, Node ≥ 20) |

**Fuera de alcance en v1 (salvo autorización explícita):** ERC-4906 metadata events avanzados, lazy mint / signature mint, allowlist Merkle, reveal mechanism, marketplace propio, mainnet production hardening.

---

## 3. Arquitectura lógica (resumen)

```
Usuario / Owner (MetaMask / cast)
        │
        ▼
Next.js demo + ethers v6  ──RPC──►  Anvil / Testnet
        │                                │
        └──────── ABI + address ─────────┤
                                         ▼
                              NFTCollection (core)
                    ┌────────────┼────────────────┐
                    ▼            ▼                ▼
               ERC-721      Base URI /        ERC-2981
               mint/batch   tokenURI          royaltyInfo
               transfer     Ownable2Step      default + per-token
                    │
                    ▼
             IERC721Receiver (safe paths)
```

Documentación relacionada:

- [Diagrama de clases](./01-diagrama-clases.md)
- [Diagrama de flujo](./02-diagrama-flujo.md)
- [Flujograma](./03-flujograma.md)
- [SWC-AUDIT](./SWC-AUDIT.md) · [ATAQUES](./ATAQUES.md) · [GAS](./GAS.md)
- [DEPLOY](./DEPLOY.md) · [FRONTEND](./FRONTEND.md)

---

## 4. Estructura de repositorio (actual)

```
04-erc721/
├── .cursorrules
├── README.md
├── foundry.toml
├── remappings.txt
├── .env.example
├── doc/
│   ├── 00-plan-implementacion.md
│   ├── 01-diagrama-clases.md
│   ├── 02-diagrama-flujo.md
│   ├── 03-flujograma.md
│   ├── SWC-AUDIT.md
│   ├── ATAQUES.md
│   ├── GAS.md
│   ├── DEPLOY.md
│   ├── FRONTEND.md
│   └── abi/                          # NFTCollection + INFTCollection
├── src/
│   ├── interfaces/INFTCollection.sol
│   ├── NFTCollection.sol
│   └── mocks/
│       ├── MockERC721Receiver.sol
│       ├── MockERC721NonReceiver.sol
│       └── MockERC721ReceiverReentrant.sol
├── script/
│   ├── Deploy.s.sol
│   └── export-abi.sh
├── test/
│   ├── NFTCollection.t.sol
│   ├── unit/                         # core, lifecycle, royalty
│   ├── fuzz/
│   ├── invariant/
│   └── attack/
└── frontend/                         # Next.js demo (Fase 6)
    ├── abi/
    └── src/                          # app, components, hooks, lib
```

---

## 5. Superficie on-chain (v1 implementada)

| Función / pieza | Rol |
|-----------------|-----|
| `mint(to)` / `safeMint(to)` | Mint 1 token; respeta `maxSupply` |
| `mintBatch(to, quantity)` / `safeMintBatch` | Mint por lotes; `unchecked` tras checks |
| `setBaseURI(uri)` | Owner actualiza raíz de metadata |
| `tokenURI(tokenId)` | `baseURI + tokenId` (o convención acordada) |
| `setDefaultRoyalty(receiver, feeNumerator)` | ERC-2981 default |
| `setTokenRoyalty` / `resetTokenRoyalty` | Royalty por token + reset al default |
| `deleteDefaultRoyalty()` | Limpia royalty global |
| `royaltyInfo(tokenId, salePrice)` | View estándar ERC-2981 |
| `supportsInterface(interfaceId)` | ERC-165 + 721 + Metadata + 2981 |
| Transfers / approvals | Superficie ERC-721 estándar OZ |

### Errores custom (v1)

- `TokenDoesNotExist()`
- `MaxSupplyExceeded()`
- `MintZeroQuantity()`
- `Unauthorized()`
- `ZeroAddress()`
- `InvalidRoyalty()` — reservado; validación fee/receiver también vía OZ ERC-2981
- `NotImplemented()` — usado solo en esqueleto Fase 1 (ya no aplica a mutators vivos)

### Invariantes clave

```text
totalSupply() <= maxSupply
ownerOf(tokenId) != address(0) ⇔ token existe
balanceOf(owner) == conteo real de tokens del owner
royalty feeNumerator <= feeDenominator (típicamente 10000)
```

---

## 6. Fases de implementación

### Resumen

| Fase | Nombre | Estado |
|------|--------|--------|
| 0 | Bootstrap Foundry + docs | ✅ Aprobada (2026-08-28) |
| 1 | Diseño on-chain: interfaces, errores + tests rojos | ✅ Aprobada (2026-08-28) |
| 2 | Implementación core ERC-721 + mint/batch + URI | ✅ Aprobada (2026-08-28) |
| 3 | ERC-2981 royalties + Ownable2Step admin | ✅ Aprobada (2026-08-28) |
| 4 | Fuzz + safe-receiver / ataques + gas report | ✅ Aprobada (2026-08-28) |
| 5 | Scripts deploy + ABI | ✅ Aprobada (2026-08-28) |
| 6 | Frontend demo (opcional) | ✅ Aprobada (2026-08-29) |
| 7 | Docs finales, handoff, alineación diagramas | 🔒 Pendiente |

---

### Fase 0 — Bootstrap del módulo

**Estado:** ✅ Aprobada — 2026-08-28  
**Duración estimada:** 0.5 día

#### Objetivo

Inicializar Foundry, pinnear OZ v5, fijar `0.8.24`, dejar layout listo. La carpeta `doc/` ya existe con plan y diagramas.

#### Tareas

1. `forge init` (respetando `.gitignore` del monorepo).
2. `foundry.toml`: Solidity `0.8.24`, fuzz runs ≥ 1000, optimizer.
3. Instalar OpenZeppelin Contracts v5 + forge-std.
4. Remappings; estructura `src/`, `test/`, `script/`.
5. Verificar `forge build`.

#### Criterios de aceptación

- [x] Compila sin errores.
- [x] Pragma fijo `0.8.24`.
- [x] Dependencias OZ instaladas.
- [x] `doc/` presente y referenciado en README.

#### Resultado

- Foundry `1.4.3-stable` con `forge init --no-git --force`.
- `foundry.toml`: `solc = 0.8.24`, `evm_version = cancun`, fuzz `runs = 1000`, invariant configurado.
- Dependencias: `forge-std` + `openzeppelin-contracts@v5.0.2`.
- Placeholder: `src/NFTCollection.sol`, `test/NFTCollection.t.sol`, `script/Deploy.s.sol`.
- Layout: `src/interfaces/`, `src/mocks/`, `test/{unit,fuzz}/`, `doc/`, `.env.example`, `README.md`.
- `forge build` OK; `forge test` → 1 passed (`test_moduleId`).
- Nota: usar `export PATH="$HOME/.foundry/bin:$PATH"` (el `forge` de npm choca con Foundry).

#### Aprobación

- [x] Autorizada para ejecutar  
- [x] Completada y revisada → ✅ 2026-08-28

> Responde cuando quieras iniciar la **Fase 1**: `Autorizo Fase 1`

---

### Fase 1 — Diseño on-chain + TDD (tests primero)

**Estado:** ✅ Aprobada — 2026-08-28  
**Duración estimada:** 1 día  
**Depende de:** Fase 0 ✅

#### Objetivo

Congelar interfaz, errores, eventos y política de URI/royalty; escribir tests que fallen antes de la lógica completa.

#### Tareas

1. `INFTCollection.sol` con NatSpec completo.
2. Custom errors + events (`Transfer`, `Approval`, `ApprovalForAll`, `BatchMinted`, `BaseURIUpdated`, `RoyaltyUpdated`, …).
3. Definir numeración de `tokenId` (secuencial desde 0 o 1).
4. Esqueleto `NFTCollection.sol` + suite unitaria inicial (asserts esperados / `NotImplemented`).
5. Mocks: receiver que acepta y receiver que rechaza `onERC721Received`.

#### Criterios de aceptación

- [x] Interfaces compilables.
- [x] Solo custom errors (sin `require` strings).
- [x] Tests unitarios escritos para mint → transfer → URI → royalty (rojos hasta Fase 2/3).
- [x] Decisiones de diseño documentadas en este plan / diagramas.

#### Resultado

- `src/interfaces/INFTCollection.sol` — events, errors, views, mutators, NatSpec + decisiones v1.
- `src/NFTCollection.sol` — esqueleto ERC721 + ERC2981 + Ownable2Step; constructor y views; mutators → `NotImplemented`.
- `src/mocks/MockERC721Receiver.sol` — receiver configurable (acepta / revierte).
- `src/mocks/MockERC721NonReceiver.sol` — contrato sin hook.
- `test/NFTCollection.t.sol` — **14 tests verdes** (constructor, interfaces, royalty, NotImplemented).
- `test/unit/NFTCollection.lifecycle.t.sol` — **7 tests rojos** TDD (mint, batch, URI, transfer, safe receiver, supply).
- Decisiones: `tokenId` desde **0**; `tokenURI = baseURI + toString(id)`; mint **onlyOwner**; fee denominator **10000** (OZ).

#### Aprobación

- [x] Autorizada para ejecutar  
- [x] Completada y revisada → ✅ 2026-08-28

> Responde cuando quieras iniciar la **Fase 2**: `Autorizo Fase 2`

---

### Fase 2 — Core ERC-721 + mint/batch + URI

**Estado:** ✅ Aprobada — 2026-08-28  
**Duración estimada:** 1–2 días  
**Depende de:** Fase 1 ✅

#### Objetivo

Implementar mint individual/batch, metadata URI, transfers y approvals con CEI donde aplique y safe paths.

#### Tareas

1. Estado: `maxSupply`, `_nextTokenId` / `totalSupply`, `_baseURI`.
2. `mint` / `safeMint` / `mintBatch` / `safeMintBatch` con checks upfront + `unchecked` en loops.
3. `setBaseURI` (onlyOwner) + `tokenURI`.
4. Unit tests: single/batch mint, max supply, zero quantity, transfer, approve, `setApprovalForAll`.
5. Safe mint a contrato no-receiver → revert explícito.

#### Criterios de aceptación

- [x] `totalSupply` nunca supera `maxSupply`.
- [x] Batch mint emite transfers coherentes y actualiza balances.
- [x] `tokenURI` refleja `baseURI` actualizada.
- [x] NatSpec en públicas/externas.

#### Resultado

- `NFTCollection.sol`: `_reserveMint` centraliza guards; mint/batch con loop `unchecked`; `setBaseURI` + evento.
- `setDefaultRoyalty` sigue en `NotImplemented` (Fase 3).
- `test/unit/NFTCollection.lifecycle.t.sol` — **7 tests verdes**.
- `test/unit/NFTCollection.core.t.sol` — **8 tests** (mint, batch event, approve, setApprovalForAll).
- `test/NFTCollection.t.sol` — actualizado (12 tests verdes).
- Suite total: **27 tests** verdes.

#### Aprobación

- [x] Autorizada para ejecutar  
- [x] Completada y revisada → ✅ 2026-08-28

> Responde cuando quieras iniciar la **Fase 3**: `Autorizo Fase 3`

---

### Fase 3 — ERC-2981 + admin Ownable2Step

**Estado:** ✅ Aprobada — 2026-08-28  
**Duración estimada:** 1 día  
**Depende de:** Fase 2 ✅

#### Objetivo

Royalties on-chain y control administrativo robusto.

#### Tareas

1. Herencia / composición ERC-2981 (OZ).
2. `setDefaultRoyalty` / opcional `setTokenRoyalty` / `deleteDefaultRoyalty`.
3. Override `supportsInterface` para 165 + 721 + 2981.
4. Ownable2Step: transfer/accept ownership para funciones admin.
5. Tests de `royaltyInfo` y interface IDs.

#### Criterios de aceptación

- [x] `supportsInterface` verde para ERC-165, ERC-721, ERC-2981.
- [x] `royaltyInfo` calcula receiver + amount correctamente.
- [x] Solo owner (o pending→accept) administra URI/royalties/supply si aplica.

#### Resultado

- `setDefaultRoyalty`, `setTokenRoyalty`, `deleteDefaultRoyalty`, `resetTokenRoyalty` implementados.
- Eventos `RoyaltyUpdated` y `TokenRoyaltyUpdated` en interfaz y contrato.
- `supportsInterface` ya cubría 165/721/2981 vía OZ; tests con IDs hex explícitos.
- `test/unit/NFTCollection.royalty.t.sol` — **12 tests** (royalty admin + Ownable2Step).
- Suite total: **39 tests** verdes.

#### Aprobación

- [x] Autorizada para ejecutar  
- [x] Completada y revisada → ✅ 2026-08-28

> Responde cuando quieras iniciar la **Fase 4**: `Autorizo Fase 4`

---

### Fase 4 — Fuzz, safe-receiver, ataques, gas

**Estado:** ✅ Aprobada — 2026-08-28  
**Duración estimada:** 1–2 días  
**Depende de:** Fase 3 ✅

#### Objetivo

Endurecer propiedades de supply, ownership y seguridad de safe transfers.

#### Tareas

1. Fuzz: quantity, `to`, salePrice en royalty.
2. Invariantes: supply ≤ max; balance coherente.
3. Ataque: mint/transfer a contrato sin receiver; callback malicioso si se autoriza.
4. `forge test --gas-report` y notas de tradeoffs.
5. Cobertura de paths de error custom.
6. Auditoría SWC + campañas de ataque (`doc/SWC-AUDIT.md`, `doc/ATAQUES.md`).

#### Criterios de aceptación

- [x] Fuzz ≥ 1000 runs sin rotura de invariante de supply.
- [x] Non-receiver revierte de forma explícita.
- [x] Gas report baseline documentado (`doc/GAS.md`).
- [x] Matriz SWC-100–136 y mapeo a tests.

#### Resultado

- `test/fuzz/NFTCollection.fuzz.t.sol` — 5 fuzz × 1000 runs.
- `test/invariant/` — handler + 3 invariantes (256 runs / 3840 calls).
- `test/attack/SafeTransferAttack.t.sol` — 11 tests (non-receiver, reentrancy, auth).
- `src/mocks/MockERC721ReceiverReentrant.sol` — callback malicioso.
- `doc/SWC-AUDIT.md` — matriz SWC alineada a `01-erc20` / `03-staking`.
- `doc/ATAQUES.md` — campañas A–F con mapeo a tests.
- `doc/GAS.md` — baseline deploy ~1.71M gas.
- Suite total: **58 tests** verdes.

#### Aprobación

- [x] Autorizada para ejecutar  
- [x] Completada y revisada → ✅ 2026-08-28

> Responde cuando quieras iniciar la **Fase 5**: `Autorizo Fase 5`

---

### Fase 5 — Deploy scripts + ABI

**Estado:** ✅ Aprobada — 2026-08-28  
**Duración estimada:** 0.5 día  
**Depende de:** Fase 4 ✅

#### Objetivo

Deploy reproducible en Anvil/testnet y export de ABI para UI.

#### Tareas

1. `Deploy.s.sol` (name, symbol, maxSupply, baseURI, royalty receiver/fee).
2. `.env.example` sin secretos.
3. Export ABI → `doc/abi/` y/o `frontend/abi/`.
4. Playbook Anvil en README/DEPLOY.

#### Criterios de aceptación

- [x] Deploy script verde en Anvil.
- [x] Addresses + ABI documentados.

#### Resultado

- `script/Deploy.s.sol` — env `INITIAL_OWNER`, `COLLECTION_*`, `MAX_SUPPLY`, `BASE_URI`, `ROYALTY_*`.
- `script/export-abi.sh` → `doc/abi/` + `frontend/abi/` (`NFTCollection`, `INFTCollection`).
- `doc/DEPLOY.md` — playbook Anvil, testnet, `cast` post-deploy.
- Verificado Anvil chain 31337: `NFTCollection` `0x5FbDB2315678afecb367f032d93F642f64180aa3` (primera deploy local).

#### Aprobación

- [x] Autorizada para ejecutar  
- [x] Completada y revisada → ✅ 2026-08-28

> Responde cuando quieras iniciar la **Fase 6**: `Autorizo Fase 6` (o `Omitir Fase 6`)

---

### Fase 6 — Frontend demo (opcional)

**Estado:** ✅ Aprobada — 2026-08-29  
**Duración estimada:** 2–3 días  
**Depende de:** Fase 5 ✅

#### Objetivo

Demo Next.js: conectar wallet, mint (owner), ver `tokenURI`, transfer, mostrar royalty info, tema claro/oscuro.

#### Tareas

1. App Router; `'use client'` / `'use server'` explícitos.
2. ethers v6 + Zod + JSDoc.
3. Flujos: mint, batch mint, transfer, setBaseURI (owner).
4. Vitest + RTL (TDD interacción).
5. `.env.example` con `NEXT_PUBLIC_*`.
6. Toggle tema claro/oscuro con persistencia (`localStorage`).

#### Criterios de aceptación

- [x] Flujo feliz documentado.
- [x] `next build` OK.
- [x] Tests UI mínimos verdes.
- [x] Demo verificada en Anvil (lectura on-chain + UI).
- [x] Tema claro/oscuro operativo.

#### Resultado

- `frontend/` — Next.js 15 App Router + ethers v6 + Zod + Vitest.
- `NftCollectionApp` + hooks `useWallet` / `useNftCollection` / `useTheme`.
- `ThemeToggle` — `data-theme` + CSS variables; preferencia en `localStorage` (`nft-theme`); script anti-flash en `layout.tsx`.
- Flujos: mint / safeMint / mintBatch, transfer, lookup tokenURI+royalty, setBaseURI.
- `doc/FRONTEND.md` — setup Anvil + flujo feliz.
- `npm test` → **9 passed**; `npm run build` → OK (Node ≥ 20; recomendado `nvm use 22`).
- Verificado en vivo: Anvil + deploy + `http://localhost:3000` (supply, royalty, toggle tema).
- Manual in-app `/ayuda` + `doc/MANUAL-FRONTEND.md` + botón **? Ayuda**.

#### Aprobación

- [x] Autorizada para ejecutar  
- [x] Completada y revisada → ✅ 2026-08-29

---

### Fase 7 — Docs finales y handoff

**Estado:** ✅ Completada (2026-08-29)  
**Duración:** ~0.5 día  
**Depende de:** Fase 5 ✅ + Fase 6 ✅

#### Objetivo

Alinear diagramas con código final; README usable por un tercero; cerrar DoD global.

#### Tareas realizadas

1. README del módulo apuntando a HANDOFF y docs completas.
2. Diagramas `01`–`03` actualizados a **as-built** (`_reserveMint`, royalties per-token, `tokenURI` OZ, mocks, UI ayuda/tema).
3. `doc/HANDOFF.md`, `doc/LIMITACIONES.md`, `doc/MEJORAS.md`.
4. DoD global §8 marcado completo (incl. diagramas).
5. Tema claro/oscuro y Node ≥ 20 documentados en handoff / README / frontend.

#### Criterios de aceptación

- [x] `doc/` coherente con implementación.
- [x] Tercero puede testear/deploy/UI siguiendo docs (`HANDOFF` → `DEPLOY` → `FRONTEND` / `MANUAL-FRONTEND`).

#### Aprobación

- [x] Autorizada para ejecutar (`Vamos al paso 7`)  
- [x] Completada y revisada → ✅ 2026-08-29

---

## 7. Checklist de avance

```text
[x] Fase 0  Bootstrap Foundry          → ✅ 2026-08-28
[x] Fase 1  Diseño + TDD               → ✅ 2026-08-28
[x] Fase 2  Core mint/URI + unit       → ✅ 2026-08-28
[x] Fase 3  ERC-2981 + Ownable2Step    → ✅ 2026-08-28
[x] Fase 4  Fuzz / safe / gas / SWC    → ✅ 2026-08-28
[x] Fase 5  Deploy + ABI               → ✅ 2026-08-28
[x] Fase 6  Frontend (opcional)        → ✅ 2026-08-29
[x] Fase 7  Docs finales               → ✅ 2026-08-29
```

---

## 8. Definition of Done (global)

1. [x] `pragma solidity 0.8.24` fijo.
2. [x] ERC-721 + ERC-165 + ERC-2981 con `supportsInterface` verificado.
3. [x] Mint individual y batch con guards `MaxSupplyExceeded` / `MintZeroQuantity`.
4. [x] Base URI dinámica y `tokenURI` correcto.
5. [x] Safe mint/transfer con chequeo `onERC721Received`.
6. [x] Ownable2Step en funciones admin.
7. [x] Solo custom errors; NatSpec en públicas/externas.
8. [x] Suite: unit + fuzz + invariant + ataque non-receiver / reentrancy (`forge test` → 58).
9. [x] Diagramas y plan alineados al cierre (Fase 7).
10. [x] Frontend autorizado e implementado (Fase 6: mint/transfer/URI/royalty + tema claro/oscuro + ayuda).

---

## 9. Riesgos y mitigaciones

| Riesgo | Mitigación |
|--------|------------|
| Tokens locked en contratos sin receiver | `safeMint` / `safeTransferFrom` + tests non-receiver |
| Overflow de supply en batch | Check `totalSupply + quantity <= maxSupply` antes del loop |
| Royalty fee inválido | Validación OZ ERC-2981 + tests admin |
| URI malformada / vacío | Tests `tokenURI`; política `baseURI + id` documentada |
| Herencia OZ v5 / overrides | Seguir overrides OZ; tests de interface IDs |
| Node frontend demasiado viejo | `engines.node >= 20`; documentar `nvm use 22` |
| Avance sin review | **Protocolo de autorización por fase** |

---

## 10. Próximo paso inmediato

**Estado:** módulo **cerrado** (Fases 0–7).  

Para un tercero: partir de [`HANDOFF.md`](./HANDOFF.md). Mejoras opcionales: [`MEJORAS.md`](./MEJORAS.md).

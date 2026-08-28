# Plan de implementación — ERC-721 NFT Collection & Royalty (Módulo 04)

Documento maestro del módulo. Define fases, entregables, criterios de aceptación y el **protocolo de autorización** usado durante el desarrollo.

> **Estado actual:** Fases **0–3** ✅ (2026-08-28). Fases **4–7** 🔒 pendientes de autorización.

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
- Incluya suite Foundry: unit + fuzz + tests de interfaces y safe-receiver.

---

## 2. Stack acordado

| Capa | Tecnología | Notas |
|------|------------|--------|
| Contratos | Solidity `0.8.24` (pragma fijo) | Sin floating pragma |
| Tooling | Foundry (`forge`, `cast`, `anvil`) | Unit, fuzz, gas report |
| Librerías | OpenZeppelin **v5.x** | `ERC721`, `ERC2981`, `Ownable2Step`, ERC-165 |
| Estándares | ERC-721, ERC-165, ERC-2981 | Interface IDs verificados en tests |
| Frontend | Next.js App Router + TS + ethers v6 + Zod | Opcional (Fase 6) |
| Tests UI | Vitest + RTL | Solo si Fase 6 autorizada |

**Fuera de alcance en v1 (salvo autorización explícita):** ERC-4906 metadata events avanzados, lazy mint / signature mint, allowlist Merkle, reveal mechanism, marketplace propio, mainnet production hardening.

---

## 3. Arquitectura lógica (resumen)

```
Usuario / Owner (MetaMask / cast)
        │
        ▼
[Opcional] Next.js + ethers v6  ──RPC──►  Anvil / Testnet
        │                                      │
        └──────── ABI + address ───────────────┤
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

Diagramas:

- [Diagrama de clases](./01-diagrama-clases.md)
- [Diagrama de flujo](./02-diagrama-flujo.md)
- [Flujograma](./03-flujograma.md)

---

## 4. Estructura de repositorio (prevista)

```
04-erc721/
├── .cursorrules
├── README.md
├── doc/                              # Plan, diagramas, handoff
├── foundry.toml
├── remappings.txt
├── src/
│   ├── interfaces/INFTCollection.sol
│   ├── NFTCollection.sol
│   └── mocks/MockERC721Receiver.sol  # receiver OK / bad para tests
├── script/
│   ├── Deploy.s.sol
│   └── export-abi.sh
├── test/
│   ├── NFTCollection.t.sol
│   ├── unit/
│   ├── fuzz/
│   └── attack/                       # non-receiver / reentrancy hooks
└── frontend/                         # Fase 6 opcional
```

---

## 5. Superficie on-chain prevista (v1)

| Función / pieza | Rol |
|-----------------|-----|
| `mint(to)` / `safeMint(to)` | Mint 1 token; respeta `maxSupply` |
| `mintBatch(to, quantity)` / `safeMintBatch` | Mint por lotes; `unchecked` tras checks |
| `setBaseURI(uri)` | Owner actualiza raíz de metadata |
| `tokenURI(tokenId)` | `baseURI + tokenId` (o convención acordada) |
| `setDefaultRoyalty(receiver, feeNumerator)` | ERC-2981 default |
| `setTokenRoyalty(tokenId, receiver, feeNumerator)` | Royalty por token (opcional v1) |
| `royaltyInfo(tokenId, salePrice)` | View estándar ERC-2981 |
| `supportsInterface(interfaceId)` | ERC-165 + 721 + 2981 |
| Transfers / approvals | Superficie ERC-721 estándar OZ |

### Errores custom (v1)

- `TokenDoesNotExist()`
- `MaxSupplyExceeded()`
- `MintZeroQuantity()`
- `Unauthorized()`
- `ZeroAddress()`
- `InvalidRoyalty()` — fee fuera de rango / receiver cero (si aplica)

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
| 4 | Fuzz + safe-receiver / ataques + gas report | 🔒 Pendiente |
| 5 | Scripts deploy + ABI | 🔒 Pendiente |
| 6 | Frontend demo (opcional) | 🔒 Pendiente |
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

**Estado:** 🔒 Pendiente  
**Duración estimada:** 1–2 días  
**Depende de:** Fase 3

#### Objetivo

Endurecer propiedades de supply, ownership y seguridad de safe transfers.

#### Tareas

1. Fuzz: quantity, `to`, salePrice en royalty.
2. Invariantes: supply ≤ max; balance coherente.
3. Ataque: mint/transfer a contrato sin receiver; callback malicioso si se autoriza.
4. `forge test --gas-report` y notas de tradeoffs.
5. Cobertura de paths de error custom.

#### Criterios de aceptación

- [ ] Fuzz ≥ 1000 runs sin rotura de invariante de supply.
- [ ] Non-receiver revierte de forma explícita.
- [ ] Gas report baseline documentado (`doc/GAS.md` cuando se autorice).

#### Aprobación

- [ ] Autorizada para ejecutar  
- [ ] Completada y revisada → ✅ fecha

> **No iniciar sin:** `Autorizo Fase 4`

---

### Fase 5 — Deploy scripts + ABI

**Estado:** 🔒 Pendiente  
**Duración estimada:** 0.5 día  
**Depende de:** Fase 4

#### Objetivo

Deploy reproducible en Anvil/testnet y export de ABI para UI.

#### Tareas

1. `Deploy.s.sol` (name, symbol, maxSupply, baseURI, royalty receiver/fee).
2. `.env.example` sin secretos.
3. Export ABI → `doc/abi/` y/o `frontend/abi/`.
4. Playbook Anvil en README/DEPLOY.

#### Criterios de aceptación

- [ ] Deploy script verde en Anvil.
- [ ] Addresses + ABI documentados.

#### Aprobación

- [ ] Autorizada para ejecutar  
- [ ] Completada y revisada → ✅ fecha

> **No iniciar sin:** `Autorizo Fase 5`

---

### Fase 6 — Frontend demo (opcional)

**Estado:** 🔒 Pendiente  
**Duración estimada:** 2–3 días  
**Depende de:** Fase 5

#### Objetivo

Demo Next.js: conectar wallet, mint (owner), ver `tokenURI`, transfer, mostrar royalty info.

#### Tareas

1. App Router; `'use client'` / `'use server'` explícitos.
2. ethers v6 + Zod + JSDoc.
3. Flujos: mint, batch mint, transfer, setBaseURI (owner).
4. Vitest + RTL (TDD interacción).
5. `.env.example` con `NEXT_PUBLIC_*`.

#### Criterios de aceptación

- [ ] Flujo feliz documentado.
- [ ] `next build` OK.
- [ ] Tests UI mínimos verdes.

#### Aprobación

- [ ] Autorizada para ejecutar (o **omitida**)  
- [ ] Completada / omitida → ✅ fecha

> **No iniciar sin:** `Autorizo Fase 6` o `Omitir Fase 6`

---

### Fase 7 — Docs finales y handoff

**Estado:** 🔒 Pendiente  
**Duración estimada:** 0.5–1 día  
**Depende de:** Fase 5 (y Fase 6 si no se omitió)

#### Objetivo

Alinear diagramas con código final; README usable por un tercero.

#### Tareas

1. README del módulo.
2. Actualizar diagramas si hubo desviaciones.
3. HANDOFF / limitaciones / mejoras (si se autorizan).
4. Checklist Definition of Done global.

#### Criterios de aceptación

- [ ] `doc/` coherente con implementación.
- [ ] Tercero puede testear/deploy siguiendo docs.

#### Aprobación

- [ ] Autorizada para ejecutar  
- [ ] Completada y revisada → ✅ fecha

> **No iniciar sin:** `Autorizo Fase 7`

---

## 7. Checklist de avance

```text
[x] Fase 0  Bootstrap Foundry          → ✅ 2026-08-28
[x] Fase 1  Diseño + TDD               → ✅ 2026-08-28
[x] Fase 2  Core mint/URI + unit       → ✅ 2026-08-28
[x] Fase 3  ERC-2981 + Ownable2Step    → ✅ 2026-08-28
[ ] Fase 4  Fuzz / safe / gas          → 🔒
[ ] Fase 5  Deploy + ABI               → 🔒
[ ] Fase 6  Frontend (opcional)        → 🔒
[ ] Fase 7  Docs finales               → 🔒
```

---

## 8. Definition of Done (global)

1. [ ] `pragma solidity 0.8.24` fijo.
2. [ ] ERC-721 + ERC-165 + ERC-2981 con `supportsInterface` verificado.
3. [ ] Mint individual y batch con guards `MaxSupplyExceeded` / `MintZeroQuantity`.
4. [ ] Base URI dinámica y `tokenURI` correcto.
5. [ ] Safe mint/transfer con chequeo `onERC721Received`.
6. [ ] Ownable2Step en funciones admin.
7. [ ] Solo custom errors; NatSpec en públicas/externas.
8. [ ] Suite: unit + fuzz (+ ataque non-receiver).
9. [ ] Diagramas y plan actualizados al cerrar.
10. [ ] Frontend solo si Fase 6 autorizada.

---

## 9. Riesgos y mitigaciones

| Riesgo | Mitigación |
|--------|------------|
| Tokens locked en contratos sin receiver | `safeMint` / `safeTransferFrom` + tests non-receiver |
| Overflow de supply en batch | Check `totalSupply + quantity <= maxSupply` antes del loop |
| Royalty fee inválido | Validar fee ≤ denominator; custom `InvalidRoyalty` |
| URI malformada / vacío | Tests `tokenURI`; política documentada (revert vs string vacío) |
| Herencia OZ v5 / overrides | Seguir overrides OZ; tests de interface IDs |
| Avance sin review | **Protocolo de autorización por fase** |

---

## 10. Próximo paso inmediato

**Fase 3 cerrada.** Royalties admin y Ownable2Step verificados.  
Para fuzz, invariantes y gas report: responde **`Autorizo Fase 4`**.

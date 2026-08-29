# Mejoras opcionales — módulo 04 ERC-721

Backlog **no comprometido**. Priorizar solo si hay autorización explícita.

---

## Contratos

| Mejora | Motivación |
|--------|------------|
| Mint público con precio / phases | Colecciones abiertas |
| Allowlist / Merkle | Drops controlados |
| `Pausable` en mint/transfer | Emergencias |
| Roles (`AccessControl`) | Separar minter / URI admin / royalty admin |
| Enumerable o index off-chain documentado | UX de “mis NFTs” |
| URI por token o reveal | Metadata más rica |
| Eliminar `NotImplemented` / `Unauthorized` no usados de la interfaz | Superficie limpia |
| Proxy UUPS/Transparent | Upgrades (cambia el modelo de confianza) |
| Cap de batch / rate limits | DoS gas en `safeMintBatch` a receivers pesados |

---

## Tests / ops

| Mejora | Motivación |
|--------|------------|
| Gas snapshot en CI | Regresiones de gas |
| Deploy script testnet con env tipado | Menos errores de ops |
| Slither / Aderyn en CI | Señales estáticas continuas |
| Coverage report en README | Transparencia |

---

## Frontend

| Mejora | Motivación |
|--------|------------|
| Panel admin royalties + Ownable2Step | Paridad con contrato |
| Lista de tokens del holder (events / indexer) | UX |
| Soporte WalletConnect / multi-wallet | Más allá de MetaMask injected |
| i18n | Audiencia bilingüe |
| Storybook / e2e Playwright | Regresión UI |
| Suprimir warning Vitest `configLoader` | Higiene tooling |

---

## Docs

| Mejora | Motivación |
|--------|------------|
| Video / GIF del flujo Anvil → mint | Onboarding visual |
| Traducción EN del HANDOFF | Colaboradores internacionales |

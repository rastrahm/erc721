# Optional improvements — module 04 ERC-721

> 🌐 **English** · [Español](./MEJORAS-ES.md)

**Non-committed** backlog. Prioritize only with explicit authorization.

---

## Contracts

| Improvement | Motivation |
|-------------|------------|
| Public mint with price / phases | Open collections |
| Allowlist / Merkle | Controlled drops |
| `Pausable` on mint/transfer | Emergencies |
| Roles (`AccessControl`) | Separate minter / URI admin / royalty admin |
| Enumerable or a documented off-chain index | “My NFTs” UX |
| Per-token URI or reveal | Richer metadata |
| Remove unused `NotImplemented` / `Unauthorized` from the interface | Clean surface |
| UUPS/Transparent proxy | Upgrades (changes the trust model) |
| Batch cap / rate limits | Gas DoS in `safeMintBatch` to heavy receivers |

---

## Tests / ops

| Improvement | Motivation |
|-------------|------------|
| Gas snapshot in CI | Gas regressions |
| Testnet deploy script with typed env | Fewer ops errors |
| Slither / Aderyn in CI | Continuous static signals |
| Coverage report in README | Transparency |

---

## Frontend

| Improvement | Motivation |
|-------------|------------|
| Royalties + Ownable2Step admin panel | Parity with the contract |
| Holder token list (events / indexer) | UX |
| WalletConnect / multi-wallet support | Beyond injected MetaMask |
| i18n | Bilingual audience |
| Storybook / Playwright e2e | UI regression |
| Suppress Vitest `configLoader` warning | Tooling hygiene |

---

## Docs

| Improvement | Motivation |
|-------------|------------|
| Video / GIF of the Anvil → mint flow | Visual onboarding |
| EN translation of the HANDOFF | International contributors |

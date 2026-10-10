# 04 — ERC-721 NFT Collection & Royalty

Gas-optimized **ERC-721** NFT collection with batch minting, dynamic base URI and **ERC-2981** royalties · Solidity `0.8.24` · Foundry · Next.js demo.

Colección NFT **ERC-721** gas-optimizada con mint por lotes, base URI dinámica y royalties **ERC-2981** · Solidity `0.8.24` · Foundry · demo Next.js.

---

## 🌐 Choose your language · Elige tu idioma

| | English | Español |
|---|---------|---------|
| **README** | [README-EN.md](./README-EN.md) | [README-ES.md](./README-ES.md) |

---

## 📚 Documentation index · Índice de documentación

| Topic · Tema | English | Español |
|--------------|---------|---------|
| Handoff (start here · empezar aquí) | [HANDOFF-EN](doc/HANDOFF-EN.md) | [HANDOFF-ES](doc/HANDOFF-ES.md) |
| Implementation plan · Plan de implementación | [00-plan-implementacion-EN](doc/00-plan-implementacion-EN.md) | [00-plan-implementacion-ES](doc/00-plan-implementacion-ES.md) |
| Class diagram · Diagrama de clases | [01-diagrama-clases-EN](doc/01-diagrama-clases-EN.md) | [01-diagrama-clases-ES](doc/01-diagrama-clases-ES.md) |
| Sequence diagrams · Diagramas de flujo | [02-diagrama-flujo-EN](doc/02-diagrama-flujo-EN.md) | [02-diagrama-flujo-ES](doc/02-diagrama-flujo-ES.md) |
| Decision flowcharts · Flujogramas | [03-flujograma-EN](doc/03-flujograma-EN.md) | [03-flujograma-ES](doc/03-flujograma-ES.md) |
| Technical decisions & gas · Decisiones técnicas y gas | [DECISIONES-TECNICAS-EN](doc/DECISIONES-TECNICAS-EN.md) | [DECISIONES-TECNICAS-ES](doc/DECISIONES-TECNICAS-ES.md) |
| Gas report · Reporte de gas | [GAS-EN](doc/GAS-EN.md) | [GAS-ES](doc/GAS-ES.md) |
| SWC audit · Auditoría SWC | [SWC-AUDIT-EN](doc/SWC-AUDIT-EN.md) | [SWC-AUDIT-ES](doc/SWC-AUDIT-ES.md) |
| Attack campaigns · Campañas de ataque | [ATAQUES-EN](doc/ATAQUES-EN.md) | [ATAQUES-ES](doc/ATAQUES-ES.md) |
| Deploy · Despliegue | [DEPLOY-EN](doc/DEPLOY-EN.md) | [DEPLOY-ES](doc/DEPLOY-ES.md) |
| Frontend setup · Setup frontend | [FRONTEND-EN](doc/FRONTEND-EN.md) | [FRONTEND-ES](doc/FRONTEND-ES.md) |
| Frontend user manual · Manual de usuario | [MANUAL-FRONTEND-EN](doc/MANUAL-FRONTEND-EN.md) | [MANUAL-FRONTEND-ES](doc/MANUAL-FRONTEND-ES.md) |
| Limitations · Limitaciones | [LIMITACIONES-EN](doc/LIMITACIONES-EN.md) | [LIMITACIONES-ES](doc/LIMITACIONES-ES.md) |
| Improvements backlog · Mejoras | [MEJORAS-EN](doc/MEJORAS-EN.md) | [MEJORAS-ES](doc/MEJORAS-ES.md) |

Portfolio page (ES/EN toggle) · Página de portafolio: [`portfolio/index.html`](portfolio/index.html)

---

## ⚡ Quick start · Inicio rápido

```bash
export PATH="$HOME/.foundry/bin:$PATH"
forge build && forge test          # ~58 tests

anvil                              # another terminal · otra terminal
forge script script/Deploy.s.sol:Deploy \
  --rpc-url http://127.0.0.1:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --broadcast

cd frontend && cp .env.example .env.local && npm install && npm run dev
# Node ≥ 20 · http://localhost:3000 · /ayuda
```

---

## 🔗 Repositories · Repositorios

- GitHub → https://github.com/rastrahm/erc721
- GitLab → https://gitlab.com/rastrahm/erc721

const I18N = {
  es: {
    'html.lang': 'es',
    'meta.title': 'ERC-721 + ERC-2981 NFT Collection — Rolando Strahm',
    'meta.description':
      'Colección NFT ERC-721 con royalties ERC-2981, optimización de gas, auditoría SWC y demo Next.js. Foundry · Solidity 0.8.24.',

    'nav.overview': 'Proyecto',
    'nav.pillars': 'Pilares',
    'nav.gas': 'Gas',
    'nav.swc': 'SWC',
    'nav.process': 'Proceso',
    'nav.attacks': 'Ataques',
    'nav.repos': 'Repos',
    'nav.close': '← Cerrar',

    'hero.tag': '// MÓDULO 04 · PORTFOLIO WEB3',
    'hero.title': 'ERC-721 + ERC-2981<br>NFT COLLECTION',
    'hero.role': 'Solidity 0.8.24 · Foundry · Gas · SWC · Next.js',
    'hero.sub':
      'Colección NFT gas-optimizada con mint por lotes, base URI dinámica, royalties on-chain, auditoría SWC y demo UI.',
    'hero.cta1': 'Ver en GitHub',
    'hero.cta2': 'Ver en GitLab',

    'ov.eyebrow': '// 01 — CONTEXTO',
    'ov.title': 'Por qué este proyecto',
    'ov.lead':
      'Continuando la suite de smart contracts, este módulo cierra una colección NFT de punta a punta: <strong>ERC-721</strong> + <strong>ERC-2981</strong>, con foco en <strong>optimización de gas</strong>, <strong>verificación SWC</strong> y una demo Next.js usable.',

    'pi.eyebrow': '// 02 — TRES PILARES',
    'pi.title': 'Qué entrega el módulo',
    'p1.num': '// PILAR_01',
    'p1.title': 'ERC-721 + ERC-2981',
    'p1.desc':
      'Colección curada (mint onlyOwner): batch mint, base URI dinámica, royalties default/per-token y Ownable2Step.',
    'p1.l1': 'safeMint / safeMintBatch + receiver checks',
    'p1.l2': 'Custom errors + NatSpec',
    'p1.l3': 'supportsInterface 165 / 721 / 2981',
    'p2.num': '// PILAR_02',
    'p2.title': 'Optimización de gas',
    'p2.desc':
      'MAX_SUPPLY immutable, _reserveMint con bounds upfront y loops unchecked documentados.',
    'p2.l1': 'immutable MAX_SUPPLY',
    'p2.l2': 'unchecked tras validar supply',
    'p2.l3': 'Gas report Foundry (doc/GAS-ES.md)',
    'p3.num': '// PILAR_03',
    'p3.title': 'Verificación de ataques',
    'p3.desc':
      'Matriz SWC-100–136, campañas A–F, fuzz + invariant + safe-receiver / reentrancy.',
    'p3.l1': 'Non-receiver + reentrancy callback',
    'p3.l2': 'Supply cap / onlyOwner',
    'p3.l3': '0 vulnerabilidades SWC explotables',

    'gas.eyebrow': '// 03 — OPTIMIZACIÓN DE GAS',
    'gas.title': 'Bounds primero, luego unchecked',
    'gas.lead':
      'Baseline en <code>doc/GAS-ES.md</code>: deploy ~1.7M gas. El hot path de mint valida supply/destino en <strong>_reserveMint</strong> y luego itera con <code>unchecked</code>. Tradeoff explícito: herencia OZ (seguridad auditada) vs gas custom from-scratch.',
    'gas.th1': 'Optimización',
    'gas.th2': 'Tradeoff / efecto',
    'gas.r1a': 'immutable MAX_SUPPLY',
    'gas.r1b': 'Lectura barata en cada mint vs SLOAD de storage',
    'gas.r2a': '_reserveMint: checks + reserva de ids upfront',
    'gas.r2b': 'Menos validaciones dentro del loop; fail-fast en supply',
    'gas.r3a': 'Loop batch con unchecked ++',
    'gas.r3b': 'Sin overflow checks redundantes tras bounds verificados',
    'gas.r4a': 'Custom errors (sin require strings)',
    'gas.r4b': 'Reverts compactos; ABI más barato',
    'gas.r5a': 'Herencia OZ ERC721 + ERC2981',
    'gas.r5b': 'Más bytecode; seguridad y estándares maduros',
    'gas.r6a': 'mint vs safeMint',
    'gas.r6b': 'safe ~+95k gas en single mint por receiver check (seguridad)',
    'gas.r7a': 'Views royaltyInfo / tokenURI / supportsInterface',
    'gas.r7b': 'Consultas baratas (~0.5k–7k gas) para marketplaces y UI',

    'swc.eyebrow': '// 04 — VERIFICACIÓN SWC',
    'swc.title': 'SWC Registry · EIP-1470',
    'swc.lead':
      'Fase 4: matriz completa <strong>SWC-100 → SWC-136</strong> contra <code>NFTCollection</code>. Informe en <code>doc/SWC-AUDIT-ES.md</code>. Conclusión: <strong>0 vulnerabilidades explotables</strong> en el alcance ERC-721 + ERC-2981.',
    'swc.s1': 'Mitigados / N/A',
    'swc.s2': 'Informativos (diseño)',
    'swc.s3': 'Vulnerables',
    'swc.th1': 'SWC clave',
    'swc.th2': 'Mitigación en el contrato',
    'swc.r101': 'Overflow: Solidity 0.8.24 + _reserveMint antes de unchecked',
    'swc.r103': 'Floating pragma: pragma solidity 0.8.24 fijo',
    'swc.r107': 'Reentrancy: effects OZ antes de onERC721Received + tests callback',
    'swc.r113': 'Failed receiver: safe paths revierten sin mint parcial',
    'swc.r123': 'Requirement: custom errors + unit/fuzz/invariant/attack',
    'swc.r125': 'Herencia: INFTCollection, ERC721, ERC2981, Ownable2Step',
    'swc.info': 'INFORMATIVO',
    'swc.i1t': 'Approve front-running',
    'swc.i1d':
      'Race del estándar ERC-721. Mitigación de producto: setApprovalForAll con cuidado; revocar antes de re-aprobar.',
    'swc.i2t': 'Batch mint O(n)',
    'swc.i2d':
      'mintBatch/safeMintBatch iteran quantity. Cap maxSupply y batches razonables en UI mitigan el gas.',
    'swc.i3t': 'mint sin safe receiver',
    'swc.i3d':
      'mint/mintBatch a contrato sin hook pueden lockear el NFT. Preferir safeMint / safeMintBatch.',

    'pr.eyebrow': '// 05 — PROCESO',
    'pr.title': 'Fases 0–7 cerradas',
    'pr.lead':
      'Desarrollo por gates: bootstrap, TDD, mint/URI, royalties, fuzz/SWC, deploy, frontend y handoff.',
    'ph.01': 'Bootstrap + diseño TDD',
    'ph.23': 'Core mint/URI + ERC-2981',
    'ph.4': 'Fuzz / attack / gas / SWC',
    'ph.56': 'Deploy + frontend demo',
    'ph.7': 'Docs finales / handoff',
    'st.1': 'Fases',
    'st.2': 'Tests forge',
    'st.3': 'SWC críticos',
    'st.4': 'Campañas',
    'term.label': 'rolando@strahm:~/04-erc721',
    'term.1': 'forge test',
    'term.2': '[PASS] suite · 58 passed',
    'term.3': 'cat doc/SWC-AUDIT-ES.md | head',
    'term.4': 'Vulnerable: 0 · Informativos: 3 · Mitigados/N/A: 33',
    'term.5': 'echo status',
    'term.6': 'MODULE_04_CLOSED · SWC_GAS_FRONTEND_OK',

    'at.eyebrow': '// 06 — CAMPAÑAS DE ATAQUE',
    'at.title': 'Defensivo, no ofensivo',
    'at.lead':
      'Tests Foundry donde el “éxito” del ataque es que falle. Sin PoCs ofensivos: safe-receiver, reentrancy, supply, superficie y fuzz.',
    'cA.t': 'Safe receiver',
    'cA.d': 'Non-receiver revierte; sin mint parcial en batch safe.',
    'cB.t': 'Reentrancy',
    'cB.d': 'Callback onERC721Received no drena supply ni tokens.',
    'cC.t': 'Supply / auth',
    'cC.d': 'onlyOwner, maxSupply y address(0).',
    'cD.t': 'Superficie',
    'cD.d': 'Sin ETH payable; selector inválido en receiver.',
    'cE.t': 'Fuzz / invariant',
    'cE.d': 'Supply y balances coherentes bajo secuencias aleatorias.',
    'cF.t': 'Approve race',
    'cF.d': 'SWC-114 documental (limitación del estándar ERC-721).',

    're.eyebrow': '// 07 — CÓDIGO ABIERTO',
    're.title': 'Repositorios',
    're.lead':
      'El mismo código en GitHub y GitLab: contratos, tests, gas, SWC, deploy, frontend y handoff.',
    're.cta': 'Contactar',
    're.linkedin': 'LinkedIn',

    'ft.left': 'ROLANDO STRAHM — ERC-721 + ERC-2981 · Portfolio',
    'ft.right': 'FOUNDRY · SOLC 0.8.24 · ALL_SYSTEMS_OPERATIONAL',
  },

  en: {
    'html.lang': 'en',
    'meta.title': 'ERC-721 + ERC-2981 NFT Collection — Rolando Strahm',
    'meta.description':
      'ERC-721 NFT collection with ERC-2981 royalties, gas optimization, SWC audit, and Next.js demo. Foundry · Solidity 0.8.24.',

    'nav.overview': 'Project',
    'nav.pillars': 'Pillars',
    'nav.gas': 'Gas',
    'nav.swc': 'SWC',
    'nav.process': 'Process',
    'nav.attacks': 'Attacks',
    'nav.repos': 'Repos',
    'nav.close': '← Close',

    'hero.tag': '// MODULE 04 · WEB3 PORTFOLIO',
    'hero.title': 'ERC-721 + ERC-2981<br>NFT COLLECTION',
    'hero.role': 'Solidity 0.8.24 · Foundry · Gas · SWC · Next.js',
    'hero.sub':
      'Gas-optimized NFT collection with batch minting, dynamic base URI, on-chain royalties, SWC audit, and a usable UI demo.',
    'hero.cta1': 'View on GitHub',
    'hero.cta2': 'View on GitLab',

    'ov.eyebrow': '// 01 — CONTEXT',
    'ov.title': 'Why this project',
    'ov.lead':
      'Continuing the smart-contracts suite, this module ships an end-to-end NFT collection: <strong>ERC-721</strong> + <strong>ERC-2981</strong>, focused on <strong>gas optimization</strong>, <strong>SWC verification</strong>, and a usable Next.js demo.',

    'pi.eyebrow': '// 02 — THREE PILLARS',
    'pi.title': 'What the module ships',
    'p1.num': '// PILLAR_01',
    'p1.title': 'ERC-721 + ERC-2981',
    'p1.desc':
      'Curated collection (mint onlyOwner): batch mint, dynamic base URI, default/per-token royalties, and Ownable2Step.',
    'p1.l1': 'safeMint / safeMintBatch + receiver checks',
    'p1.l2': 'Custom errors + NatSpec',
    'p1.l3': 'supportsInterface 165 / 721 / 2981',
    'p2.num': '// PILLAR_02',
    'p2.title': 'Gas optimization',
    'p2.desc':
      'Immutable MAX_SUPPLY, _reserveMint with upfront bounds, and documented unchecked loops.',
    'p2.l1': 'immutable MAX_SUPPLY',
    'p2.l2': 'unchecked after supply checks',
    'p2.l3': 'Foundry gas report (doc/GAS-EN.md)',
    'p3.num': '// PILLAR_03',
    'p3.title': 'Attack verification',
    'p3.desc':
      'SWC-100–136 matrix, campaigns A–F, fuzz + invariant + safe-receiver / reentrancy.',
    'p3.l1': 'Non-receiver + reentrancy callback',
    'p3.l2': 'Supply cap / onlyOwner',
    'p3.l3': '0 exploitable SWC findings',

    'gas.eyebrow': '// 03 — GAS OPTIMIZATION',
    'gas.title': 'Bounds first, then unchecked',
    'gas.lead':
      'Baseline in <code>doc/GAS-EN.md</code>: ~1.7M gas deploy. The mint hot path validates supply/recipient in <strong>_reserveMint</strong>, then iterates with <code>unchecked</code>. Explicit tradeoff: OZ inheritance (audited security) vs custom from-scratch gas.',
    'gas.th1': 'Optimization',
    'gas.th2': 'Tradeoff / effect',
    'gas.r1a': 'immutable MAX_SUPPLY',
    'gas.r1b': 'Cheap read on every mint vs storage SLOAD',
    'gas.r2a': '_reserveMint: checks + id reservation upfront',
    'gas.r2b': 'Fewer checks inside the loop; fail-fast on supply',
    'gas.r3a': 'Batch loop with unchecked ++',
    'gas.r3b': 'No redundant overflow checks after validated bounds',
    'gas.r4a': 'Custom errors (no require strings)',
    'gas.r4b': 'Compact reverts; cheaper ABI',
    'gas.r5a': 'OZ ERC721 + ERC2981 inheritance',
    'gas.r5b': 'More bytecode; mature security and standards',
    'gas.r6a': 'mint vs safeMint',
    'gas.r6b': 'safe ~+95k gas on single mint for receiver check (security)',
    'gas.r7a': 'Views royaltyInfo / tokenURI / supportsInterface',
    'gas.r7b': 'Cheap reads (~0.5k–7k gas) for marketplaces and UI',

    'swc.eyebrow': '// 04 — SWC VERIFICATION',
    'swc.title': 'SWC Registry · EIP-1470',
    'swc.lead':
      'Phase 4: full matrix <strong>SWC-100 → SWC-136</strong> against <code>NFTCollection</code>. Report in <code>doc/SWC-AUDIT-EN.md</code>. Conclusion: <strong>0 exploitable vulnerabilities</strong> in the ERC-721 + ERC-2981 scope.',
    'swc.s1': 'Mitigated / N/A',
    'swc.s2': 'Informational (design)',
    'swc.s3': 'Vulnerable',
    'swc.th1': 'Key SWC',
    'swc.th2': 'Mitigation in the contract',
    'swc.r101': 'Overflow: Solidity 0.8.24 + _reserveMint before unchecked',
    'swc.r103': 'Floating pragma: fixed pragma solidity 0.8.24',
    'swc.r107': 'Reentrancy: OZ effects before onERC721Received + callback tests',
    'swc.r113': 'Failed receiver: safe paths revert with no partial mint',
    'swc.r123': 'Requirement: custom errors + unit/fuzz/invariant/attack',
    'swc.r125': 'Inheritance: INFTCollection, ERC721, ERC2981, Ownable2Step',
    'swc.info': 'INFORMATIONAL',
    'swc.i1t': 'Approve front-running',
    'swc.i1d':
      'ERC-721 standard race. Product mitigation: careful setApprovalForAll; revoke before re-approving.',
    'swc.i2t': 'Batch mint O(n)',
    'swc.i2d':
      'mintBatch/safeMintBatch iterate quantity. maxSupply cap and reasonable UI batches mitigate gas.',
    'swc.i3t': 'mint without safe receiver',
    'swc.i3d':
      'mint/mintBatch to a contract without the hook can lock the NFT. Prefer safeMint / safeMintBatch.',

    'pr.eyebrow': '// 05 — PROCESS',
    'pr.title': 'Phases 0–7 closed',
    'pr.lead':
      'Approval-gated delivery: bootstrap, TDD, mint/URI, royalties, fuzz/SWC, deploy, frontend, and handoff.',
    'ph.01': 'Bootstrap + TDD design',
    'ph.23': 'Core mint/URI + ERC-2981',
    'ph.4': 'Fuzz / attack / gas / SWC',
    'ph.56': 'Deploy + frontend demo',
    'ph.7': 'Final docs / handoff',
    'st.1': 'Phases',
    'st.2': 'Forge tests',
    'st.3': 'Critical SWC',
    'st.4': 'Campaigns',
    'term.label': 'rolando@strahm:~/04-erc721',
    'term.1': 'forge test',
    'term.2': '[PASS] suite · 58 passed',
    'term.3': 'cat doc/SWC-AUDIT-EN.md | head',
    'term.4': 'Vulnerable: 0 · Informational: 3 · Mitigated/N/A: 33',
    'term.5': 'echo status',
    'term.6': 'MODULE_04_CLOSED · SWC_GAS_FRONTEND_OK',

    'at.eyebrow': '// 06 — ATTACK CAMPAIGNS',
    'at.title': 'Defensive, not offensive',
    'at.lead':
      'Foundry tests where a successful “attack” means it fails. No offensive PoCs: safe-receiver, reentrancy, supply, surface, and fuzz.',
    'cA.t': 'Safe receiver',
    'cA.d': 'Non-receiver reverts; no partial mint on safe batch.',
    'cB.t': 'Reentrancy',
    'cB.d': 'onERC721Received callback cannot drain supply or tokens.',
    'cC.t': 'Supply / auth',
    'cC.d': 'onlyOwner, maxSupply, and address(0).',
    'cD.t': 'Surface',
    'cD.d': 'No payable ETH; invalid receiver selector.',
    'cE.t': 'Fuzz / invariant',
    'cE.d': 'Supply and balances stay coherent under random sequences.',
    'cF.t': 'Approve race',
    'cF.d': 'Documentary SWC-114 (ERC-721 standard limitation).',

    're.eyebrow': '// 07 — OPEN SOURCE',
    're.title': 'Repositories',
    're.lead':
      'The same codebase on GitHub and GitLab: contracts, tests, gas, SWC, deploy, frontend, and handoff.',
    're.cta': 'Contact',
    're.linkedin': 'LinkedIn',

    'ft.left': 'ROLANDO STRAHM — ERC-721 + ERC-2981 · Portfolio',
    'ft.right': 'FOUNDRY · SOLC 0.8.24 · ALL_SYSTEMS_OPERATIONAL',
  },
};

function setLanguage(lang) {
  const dict = I18N[lang] || I18N.es;
  document.documentElement.lang = dict['html.lang'];
  document.title = dict['meta.title'];

  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc && dict['meta.description']) {
    metaDesc.setAttribute('content', dict['meta.description']);
  }

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    const val = dict[key];
    if (val == null) return;
    if (el.hasAttribute('data-i18n-html')) el.innerHTML = val;
    else el.textContent = val;
  });

  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  localStorage.setItem('erc721-portfolio-lang', lang);

  const url = new URL(window.location.href);
  url.searchParams.set('lang', lang);
  history.replaceState(null, '', url);
}

function initI18n() {
  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get('lang');
  const saved = localStorage.getItem('erc721-portfolio-lang');
  const preferred =
    (fromQuery === 'en' || fromQuery === 'es' ? fromQuery : null) ||
    saved ||
    (navigator.language?.startsWith('en') ? 'en' : 'es');

  setLanguage(preferred);

  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
  });
}

document.addEventListener('DOMContentLoaded', initI18n);

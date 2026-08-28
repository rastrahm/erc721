#!/usr/bin/env bash
# Exporta ABIs de artefactos Foundry a doc/abi/ y frontend/abi/ (si existe o se crea).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${HOME}/.foundry/bin:${PATH}"

echo "==> forge build"
forge build

OUT_DIRS=("$ROOT/doc/abi" "$ROOT/frontend/abi")
for d in "${OUT_DIRS[@]}"; do
  mkdir -p "$d"
done

copy_abi() {
  local artifact="$1"
  local name="$2"
  local src="$ROOT/out/${artifact}/${name}.json"
  if [[ ! -f "$src" ]]; then
    echo "WARN: missing $src" >&2
    return 1
  fi
  for d in "${OUT_DIRS[@]}"; do
    jq '{abi: .abi}' "$src" > "${d}/${name}.json"
    echo "  -> ${d}/${name}.json"
  done
}

echo "==> export ABIs"
copy_abi "NFTCollection.sol" "NFTCollection"
copy_abi "INFTCollection.sol" "INFTCollection"

echo "Done."

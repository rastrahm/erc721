/**
 * Acorta address `0x1234…abcd`.
 * @param {string} address
 * @param {number} [chars=4]
 * @returns {string}
 */
export function shortAddress(address: string, chars = 4): string {
  if (address.length < 10) return address;
  return `${address.slice(0, 2 + chars)}…${address.slice(-chars)}`;
}

/**
 * Valida y normaliza address Ethereum.
 * @param {string} input
 * @returns {string}
 * @throws {Error} Si no es address válida.
 */
export function parseAddress(input: string): string {
  const trimmed = input.trim();
  if (!/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
    throw new Error("Address inválida (0x + 40 hex)");
  }
  return trimmed;
}

/**
 * Parsea quantity de mint batch (entero > 0).
 * @param {string} input
 * @returns {bigint}
 * @throws {Error} Si no es entero positivo.
 */
export function parseQuantity(input: string): bigint {
  const trimmed = input.trim();
  if (!/^\d+$/.test(trimmed)) {
    throw new Error("Cantidad inválida (entero ≥ 1)");
  }
  const value = BigInt(trimmed);
  if (value <= 0n) throw new Error("Cantidad debe ser ≥ 1");
  return value;
}

/**
 * Formatea wei a ETH legible para royalty demo.
 * @param {bigint} wei
 * @param {number} [maxFrac=4]
 * @returns {string}
 */
export function formatEth(wei: bigint, maxFrac = 4): string {
  const neg = wei < 0n;
  const abs = neg ? -wei : wei;
  const whole = abs / 10n ** 18n;
  const frac = abs % 10n ** 18n;
  const fracStr = frac.toString().padStart(18, "0").slice(0, maxFrac).replace(/0+$/, "");
  const body = fracStr ? `${whole}.${fracStr}` : whole.toString();
  return neg ? `-${body}` : body;
}

/**
 * Parsea input ETH a wei.
 * @param {string} input
 * @returns {bigint}
 * @throws {Error} Si el input no es decimal válido positivo.
 */
export function parseEthInput(input: string): bigint {
  const trimmed = input.trim();
  if (!trimmed || !/^\d+(\.\d+)?$/.test(trimmed)) {
    throw new Error("Precio inválido");
  }
  const [whole, frac = ""] = trimmed.split(".");
  const fracPadded = (frac + "0".repeat(18)).slice(0, 18);
  const wei = BigInt(whole) * 10n ** 18n + BigInt(fracPadded);
  if (wei <= 0n) throw new Error("Precio debe ser > 0");
  return wei;
}

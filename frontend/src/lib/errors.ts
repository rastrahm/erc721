/**
 * Extrae mensaje usable de errores ethers / custom errors de la colección.
 * @param {unknown} err
 * @returns {string}
 */
export function humanizeError(err: unknown): string {
  if (err == null) return "Error desconocido";
  if (typeof err === "string") return err;

  const e = err as {
    shortMessage?: string;
    reason?: string;
    message?: string;
    code?: string;
    info?: { error?: { message?: string } };
  };

  const raw =
    e.shortMessage ||
    e.reason ||
    e.info?.error?.message ||
    e.message ||
    String(err);

  const custom: Record<string, string> = {
    MaxSupplyExceeded: "Se alcanzó el maxSupply de la colección",
    MintZeroQuantity: "Cantidad de mint debe ser ≥ 1",
    ZeroAddress: "Address cero no permitida",
    TokenDoesNotExist: "El token no existe",
    InvalidRoyalty: "Parámetros de royalty inválidos",
    Unauthorized: "No autorizado",
    OwnableUnauthorizedAccount: "Solo el owner puede ejecutar esta acción",
    ERC721InsufficientApproval: "No tienes approval para transferir este token",
    ERC721IncorrectOwner: "No eres el owner del token",
    ERC721NonexistentToken: "El token no existe",
    ERC721InvalidReceiver: "El receptor no implementa onERC721Received",
    "user rejected": "Transacción rechazada en la wallet",
    ACTION_REJECTED: "Transacción rechazada en la wallet",
  };

  for (const [key, msg] of Object.entries(custom)) {
    if (raw.includes(key)) return msg;
  }

  return raw.length > 180 ? `${raw.slice(0, 177)}…` : raw;
}

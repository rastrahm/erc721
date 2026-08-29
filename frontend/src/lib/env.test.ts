import { describe, expect, it } from "vitest";
import { parsePublicEnv, safeParsePublicEnv } from "@/lib/env";
import {
  formatEth,
  parseAddress,
  parseEthInput,
  parseQuantity,
  shortAddress,
} from "@/lib/format";
import { humanizeError } from "@/lib/errors";

const valid = {
  NEXT_PUBLIC_RPC_URL: "http://127.0.0.1:8545",
  NEXT_PUBLIC_CHAIN_ID: "31337",
  NEXT_PUBLIC_COLLECTION_ADDRESS: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
};

describe("parsePublicEnv", () => {
  it("acepta env Anvil válido", () => {
    const env = parsePublicEnv(valid);
    expect(env.NEXT_PUBLIC_CHAIN_ID).toBe(31337);
    expect(env.NEXT_PUBLIC_COLLECTION_ADDRESS).toMatch(/^0x/i);
  });

  it("rechaza address inválida", () => {
    const r = safeParsePublicEnv({
      ...valid,
      NEXT_PUBLIC_COLLECTION_ADDRESS: "0x123",
    });
    expect(r.success).toBe(false);
  });
});

describe("format helpers", () => {
  it("parsea address y quantity", () => {
    expect(parseAddress("0x5FbDB2315678afecb367f032d93F642f64180aa3")).toMatch(/^0x/i);
    expect(() => parseAddress("0x123")).toThrow();
    expect(parseQuantity("5")).toBe(5n);
    expect(() => parseQuantity("0")).toThrow();
  });

  it("formatea ETH y acorta address", () => {
    expect(formatEth(50_000_000_000_000_000n)).toBe("0.05");
    expect(parseEthInput("1.5")).toBe(1_500_000_000_000_000_000n);
    expect(shortAddress("0x5FbDB2315678afecb367f032d93F642f64180aa3")).toBe(
      "0x5FbD…0aa3",
    );
  });
});

describe("humanizeError", () => {
  it("mapea MaxSupplyExceeded", () => {
    expect(
      humanizeError({ shortMessage: "execution reverted: MaxSupplyExceeded()" }),
    ).toMatch(/maxSupply/i);
  });
});

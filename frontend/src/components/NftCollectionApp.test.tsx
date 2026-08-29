import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NftCollectionApp } from "@/components/NftCollectionApp";

const connect = vi.fn();

vi.mock("@/hooks/useWallet", () => ({
  useWallet: () => ({
    address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    chainId: 31337,
    connecting: false,
    error: null,
    provider: null,
    signer: {},
    wrongChain: false,
    connect,
    disconnect: vi.fn(),
  }),
}));

vi.mock("@/hooks/useNftCollection", () => ({
  useNftCollection: () => ({
    snap: {
      name: "Demo NFT Collection",
      symbol: "DNFT",
      maxSupply: 10_000n,
      totalSupply: 0n,
      baseURI: "https://example.com/metadata/",
      owner: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      balance: 0n,
      royaltyReceiver: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      royaltyAmount: 50_000_000_000_000_000n,
    },
    busy: null,
    error: null,
    txHash: null,
    tokenUri: null,
    lookedUpOwner: null,
    isOwner: true,
    refresh: vi.fn(),
    mint: vi.fn(),
    safeMint: vi.fn(),
    mintBatch: vi.fn(),
    transfer: vi.fn(),
    setBaseURI: vi.fn(),
    lookupToken: vi.fn(),
  }),
}));

vi.mock("@/hooks/useTheme", () => ({
  useTheme: () => ({
    theme: "dark",
    toggleTheme: vi.fn(),
    setTheme: vi.fn(),
    ready: true,
  }),
}));

describe("NftCollectionApp", () => {
  const env = {
    NEXT_PUBLIC_RPC_URL: "http://127.0.0.1:8545",
    NEXT_PUBLIC_CHAIN_ID: "31337",
    NEXT_PUBLIC_COLLECTION_ADDRESS: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  };

  beforeEach(() => {
    cleanup();
    for (const [k, v] of Object.entries(env)) {
      vi.stubEnv(k, v);
    }
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllEnvs();
  });

  it("muestra brand, wallet y stats de colección", () => {
    render(<NftCollectionApp />);
    expect(screen.getByText("NFTCollection")).toBeInTheDocument();
    expect(screen.getByTestId("wallet-address")).toBeInTheDocument();
    expect(screen.getByTestId("owner-badge")).toHaveTextContent("Owner");
    expect(screen.getByTestId("collection-name")).toHaveTextContent("Demo NFT Collection");
    expect(screen.getByTestId("total-supply")).toHaveTextContent("0 / 10000");
    expect(screen.getByTestId("theme-toggle")).toBeInTheDocument();
  });

  it("permite escribir destinatario de mint", async () => {
    const user = userEvent.setup();
    render(<NftCollectionApp />);
    const input = screen.getByTestId("mint-to-input");
    expect(input).not.toBeDisabled();
    await user.clear(input);
    await user.type(input, "0x70997970C51812dc3A010C7d01b50e0d17dc79C8");
    expect(input).toHaveValue("0x70997970C51812dc3A010C7d01b50e0d17dc79C8");
  });

  it("expone toggle de tema accesible", () => {
    render(<NftCollectionApp />);
    const toggle = screen.getByTestId("theme-toggle");
    expect(toggle).toHaveAttribute("aria-label", "Cambiar a modo claro");
  });

  it("expone enlace al manual de ayuda", () => {
    render(<NftCollectionApp />);
    const help = screen.getByTestId("help-link");
    expect(help).toHaveAttribute("href", "/ayuda");
    expect(help).toHaveAccessibleName("Abrir manual de ayuda");
  });
});

import { NftCollectionApp } from "@/components/NftCollectionApp";

/**
 * Home: monta la demo cliente.
 * Server Component; la interacción vive en `NftCollectionApp` (`'use client'`).
 * @returns {JSX.Element}
 */
export default function HomePage() {
  return <NftCollectionApp />;
}

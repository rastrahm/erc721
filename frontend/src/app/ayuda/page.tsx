import type { Metadata } from "next";
import { HelpManual } from "@/components/HelpManual";

export const metadata: Metadata = {
  title: "Ayuda — NFTCollection",
  description: "Manual de uso de la demo NFTCollection",
};

/**
 * Ruta `/ayuda`: manual de la demo (Server Component wrapper).
 * @returns {JSX.Element}
 */
export default function AyudaPage() {
  return <HelpManual />;
}

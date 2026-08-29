"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

type AppToolbarProps = {
  /** Mostrar enlace a la home (útil en /ayuda). */
  showHome?: boolean;
};

/**
 * Barra superior: ayuda + tema (y opcionalmente volver al inicio).
 * @param {AppToolbarProps} props
 * @returns {JSX.Element}
 */
export function AppToolbar({ showHome = false }: AppToolbarProps) {
  return (
    <div className="hero-top toolbar">
      {showHome ? (
        <Link href="/" className="btn btn-ghost" data-testid="home-link">
          ← Colección
        </Link>
      ) : (
        <Link
          href="/ayuda"
          className="btn btn-ghost"
          data-testid="help-link"
          aria-label="Abrir manual de ayuda"
        >
          ? Ayuda
        </Link>
      )}
      <ThemeToggle />
    </div>
  );
}

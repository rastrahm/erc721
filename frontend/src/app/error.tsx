"use client";

/**
 * Boundary de error por ruta (App Router).
 * @param {{ error: Error; reset: () => void }} props
 * @returns {JSX.Element}
 */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="panel" role="alert">
      <h2 className="panel-title">Error</h2>
      <p className="error-box">{error.message}</p>
      <button type="button" className="btn" onClick={reset}>
        Reintentar
      </button>
    </section>
  );
}

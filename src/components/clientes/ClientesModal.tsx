"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { SectorClientes } from "@/lib/clientes";

type Props = {
  abierto: boolean;
  onCerrar: () => void;
  sectores: SectorClientes[];
  /** Marca cuyo logo se clickeó, para abrir el modal en su sector. */
  destacado?: string | null;
};

/**
 * Directorio completo de clientes, agrupado por sector, sobre un velo que
 * oscurece la página.
 *
 * Va en un portal a `document.body` porque el carrusel que lo abre vive dentro
 * de un contenedor con `overflow-hidden`: renderizado en su sitio, el velo se
 * recortaría en vez de cubrir la pantalla.
 */
export default function ClientesModal({ abierto, onCerrar, sectores, destacado }: Props) {
  const cerrarRef = useRef<HTMLButtonElement>(null);
  const focoPrevioRef = useRef<HTMLElement | null>(null);
  const destacadoRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (!abierto) return;

    focoPrevioRef.current = document.activeElement as HTMLElement | null;
    cerrarRef.current?.focus({ preventScroll: true });
    // Si se entró clickeando un logo, el directorio se abre donde está esa
    // marca: si no, quien busca "su" cliente tiene que barrer seis sectores.
    destacadoRef.current?.scrollIntoView({ block: "center" });

    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCerrar();
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflowPrevio;
      focoPrevioRef.current?.focus();
    };
  }, [abierto, onCerrar]);

  // El modal nace cerrado, así que en el servidor y en la hidratación siempre
  // sale `null`; para cuando hay algo que portalizar, ya hay `document`.
  if (!abierto || typeof document === "undefined") return null;

  const total = sectores.reduce((n, s) => n + s.logos.length, 0);

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-brand-navy/70 p-0 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out] sm:items-center sm:p-6"
      onClick={onCerrar}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="clientes-modal-titulo"
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92vh] w-full max-w-[1100px] flex-col overflow-hidden rounded-t-[20px] bg-white shadow-[0_24px_60px_rgba(0,18,51,0.35)] sm:max-h-[88vh] sm:rounded-[20px]"
      >
        <header className="flex items-start justify-between gap-4 border-b border-border px-5 py-5 md:px-8">
          <div>
            <h2
              id="clientes-modal-titulo"
              className="font-[var(--font-display)] text-2xl font-extrabold tracking-[-0.02em] text-brand-navy md:text-3xl"
            >
              Nuestros clientes
            </h2>
            <p className="mt-1 font-[var(--font-body)] text-sm text-text-muted">
              {total} empresas de {sectores.length} sectores confían en Asignar.
            </p>
          </div>
          <button
            ref={cerrarRef}
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-brand-navy/15 text-brand-navy/60 transition-all hover:border-brand-blue hover:text-brand-blue"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        <div className="overflow-y-auto overscroll-contain px-5 py-6 md:px-8 md:py-8">
          <div className="space-y-10">
            {sectores.map((sector) => (
              <section key={sector.nombre}>
                <div className="mb-5 inline-block rounded-lg bg-surface-gray px-5 py-3">
                  <span className="font-[var(--font-ui)] text-sm font-semibold text-brand-navy">
                    {sector.nombre}
                  </span>
                </div>
                <ul className="grid list-none grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7">
                  {sector.logos.map((logo) => (
                    <li
                      key={logo.src}
                      ref={destacado === logo.alt ? destacadoRef : undefined}
                      className="flex flex-col items-center gap-2 text-center"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={logo.src}
                        alt={logo.alt}
                        loading="lazy"
                        className={`h-[76px] w-[76px] rounded-full object-contain md:h-[92px] md:w-[92px] ${
                          destacado === logo.alt ? "ring-2 ring-brand-blue ring-offset-2" : ""
                        }`}
                      />
                      <span className="font-[var(--font-ui)] text-[11px] leading-tight text-text-muted">
                        {logo.alt}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

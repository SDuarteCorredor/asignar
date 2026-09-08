"use client";

import { useCallback, useMemo, useState } from "react";
import LogosCarrusel from "@/components/clientes/LogosCarrusel";
import ClientesModal from "@/components/clientes/ClientesModal";
import { SECTORES_CLIENTES, type LogoCliente } from "@/lib/clientes";

/**
 * Carrusel de clientes con directorio completo detrás: el mismo bloque en el
 * Home y en `/servicios`.
 *
 * En `/servicios` esto era una grilla con los 62 logos a la vez —una pared que
 * nadie recorría— y en el Home un marquee que no se podía detener a mirar. El
 * carrusel muestra el volumen en movimiento y deja el detalle organizado a un
 * clic, para quien de verdad quiera buscar su sector.
 */
export default function ClientesShowcase() {
  const [abierto, setAbierto] = useState(false);
  const [destacado, setDestacado] = useState<string | null>(null);

  const logos = useMemo(
    () => SECTORES_CLIENTES.flatMap((sector) => sector.logos),
    [],
  );

  const abrirEnLogo = useCallback((logo: LogoCliente) => {
    setDestacado(logo.alt);
    setAbierto(true);
  }, []);

  const cerrar = useCallback(() => setAbierto(false), []);

  return (
    <>
      <LogosCarrusel
        logos={logos}
        onLogoClick={abrirEnLogo}
        etiqueta="Clientes de Asignar"
        nombreItems="clientes"
      />

      <div className="mt-8 flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setDestacado(null);
            setAbierto(true);
          }}
          className="inline-flex items-center gap-2 rounded-full border-[1.5px] border-border bg-white px-7 py-[13px] font-[var(--font-ui)] text-[15px] font-semibold text-brand-navy transition-colors hover:border-brand-blue hover:text-brand-blue"
        >
          Ver los {logos.length} clientes
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
            <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <p className="font-[var(--font-body)] text-[13px] text-text-muted">
          Usa las flechas para recorrerlos o haz clic en un logo.
        </p>
      </div>

      <ClientesModal
        abierto={abierto}
        onCerrar={cerrar}
        sectores={SECTORES_CLIENTES}
        destacado={destacado}
      />
    </>
  );
}

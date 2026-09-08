import LogosCarrusel from "@/components/clientes/LogosCarrusel";
import { LOGOS_CLIENTES } from "@/lib/clientes";

export default function ClientLogos() {
  return (
    <section className="py-14 md:py-20 bg-white overflow-hidden">
      <p className="text-center font-[var(--font-ui)] text-xs font-semibold uppercase tracking-[0.12em] text-text-muted mb-10">
        Empresas que confían en nosotros
      </p>
      <LogosCarrusel
        logos={LOGOS_CLIENTES}
        etiqueta="Empresas que confían en Asignar"
        nombreItems="logos"
      />
    </section>
  );
}

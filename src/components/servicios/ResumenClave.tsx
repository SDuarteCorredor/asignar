import type { ReactNode } from "react";

/* Resumen extraíble: lo primero que lee un gerente con afán —y lo primero que
   cita un motor de respuesta con IA— después del H1. Solo información que la
   página ya sustenta más abajo; aquí no se afirma nada nuevo. */
const puntosClave: { titulo: string; detalle: ReactNode }[] = [
  {
    titulo: "Qué hacemos",
    detalle:
      "Cuatro servicios para empresas: servicios temporales (personal eventual y temporal fijo), outsourcing de procesos (operativo y administrativo), selección de personal (headhunting ejecutivo y alto volumen) y gestión de SG-SST.",
  },
  {
    titulo: "Qué tan rápido",
    detalle:
      "Cobertura de personal en tiempo récord y respuesta comercial en menos de 24 horas hábiles, con un proceso de 7 pasos del reclutamiento a la vinculación.",
  },
  {
    titulo: "Dónde operamos",
    detalle:
      "Sedes en Medellín, Rionegro, Bogotá, Cali, Barranquilla, Santa Marta, Cartagena, Pereira y Manizales, con especialización en hotelería, restaurantes, clubes, centros de eventos, inmobiliario e industria.",
  },
  {
    titulo: "Con qué respaldo",
    detalle:
      "Ley 50 de 1990, SG-SST, ARL SURA y póliza de cumplimiento vigente, bajo licencia del Ministerio de Trabajo: más de 20 años de operación y +5.000 colaboradores en misión.",
  },
];

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3.5 8.5L6.5 11.5L12.5 4.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ResumenClave() {
  return (
    // Sin padding superior: el bloque se lee como continuación del hero.
    <section
      aria-labelledby="resumen-clave-titulo"
      className="bg-surface pb-[var(--spacing-section-mobile)] md:pb-[var(--spacing-section)]"
    >
      <div className="max-w-[var(--container-max)] mx-auto px-4 md:px-16">
        <div className="bg-white border border-border rounded-3xl p-6 md:p-8 card-elevated">
          <h2
            id="resumen-clave-titulo"
            className="font-[var(--font-display)] text-xl md:text-2xl font-extrabold text-brand-navy tracking-[-0.02em] mb-5"
          >
            En resumen: qué ofrece Asignar a tu empresa
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {puntosClave.map((punto) => (
              <li key={punto.titulo} className="flex items-start gap-3">
                <span className="mt-0.5 w-[22px] h-[22px] rounded-full bg-brand-blue/10 flex items-center justify-center shrink-0">
                  <CheckIcon className="w-4 h-4 text-brand-blue" />
                </span>
                <p className="font-[var(--font-body)] text-[15px] text-text-secondary leading-relaxed">
                  <strong className="font-semibold text-brand-navy">
                    {punto.titulo}:
                  </strong>{" "}
                  {punto.detalle}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

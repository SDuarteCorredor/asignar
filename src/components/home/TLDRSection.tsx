type IconProps = { className?: string };

const Check = ({ className = "" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* Resumen de entrada (TL;DR). Solo afirma cosas que el resto del home ya
   sustenta: propósito, oferta a candidatos, oferta a empresas y respaldo. */
const resumen = [
  {
    title: "Qué es Asignar",
    desc: "Conectamos el mejor talento humano con las empresas más destacadas de Colombia, con más de 20 años de trayectoria.",
  },
  {
    title: "Para candidatos",
    desc: "Vacantes activas en hotelería, restaurantes, logística e industria — postúlate en minutos y recibe acompañamiento en cada paso.",
  },
  {
    title: "Para empresas",
    desc: "Selección verificada, nómina y prestaciones incluidas, y reemplazo ágil ante cualquier ausencia.",
  },
  {
    title: "Cobertura y respaldo",
    desc: "Presencia en 9 sedes de Colombia, más de 5.000 colaboradores en misión y cumplimiento normativo SG-SST auditado y vigente.",
  },
];

export default function TLDRSection() {
  return (
    <section aria-labelledby="tldr-heading" className="bg-white py-12 md:py-16">
      <div className="mx-auto max-w-[1280px] px-4 md:px-16">
        <div className="rounded-2xl border border-border bg-surface-gray p-6 md:p-8">
          <h2
            id="tldr-heading"
            className="mb-6 font-[var(--font-display)] text-xl font-bold text-brand-navy md:text-2xl"
          >
            En resumen: qué es Asignar
          </h2>
          <ul className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
            {resumen.map((r) => (
              <li key={r.title} className="flex items-start gap-3">
                <Check className="mt-1 h-4 w-4 shrink-0 text-brand-blue" />
                <p className="font-[var(--font-body)] text-base leading-relaxed text-text-secondary">
                  <strong className="font-bold text-brand-navy">{r.title}:</strong>{" "}
                  {r.desc}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

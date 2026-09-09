import Link from "next/link";
import Image from "next/image";

/* Inline SVG icons — bulletproof (no icon-font dependency) */
const Check = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M5 12.5l4.5 4.5L19 7.5"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const ArrowRight = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M4 12h15M13 5l7 7-7 7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const beneficios = [
  "Proceso de selección completo y verificado",
  "Vinculación directa con Asignar como empleador",
  "Nómina, prestaciones y seguridad social incluidas",
  "Reemplazo ágil ante cualquier ausencia",
  "Especialistas en hotelería, restaurantes e industria",
  "Reporte mensual de gestión y rotación",
];

export default function B2BSection() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-12 px-4 md:px-16 lg:grid-cols-2 lg:gap-16">
        {/* LEFT — image block with floating glass stats */}
        <div className="scroll-reveal relative order-2 lg:order-1">
          <div
            className="relative aspect-[4/3] w-full overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-light-blue via-brand-blue to-brand-deep-blue shadow-[0_40px_90px_-40px_rgba(0,18,51,0.5)]"
            role="img"
            aria-label="Equipo de Asignar coordinando personal en operación"
          >
            {/* photo layer — /b2b.jpg sobre el degradado de marca */}
            <Image
              src="/home/b2b.jpg"
              alt=""
              aria-hidden="true"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center"
            />
            {/* brand grade overlay for cohesion */}
            <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/40 via-transparent to-transparent" />

            {/* stat — experience (top right) */}
            <div className="absolute right-4 top-4 rounded-2xl border border-white/25 bg-brand-navy/40 px-4 py-3 backdrop-blur-md">
              <p className="font-[var(--font-display)] text-xl font-extrabold leading-none text-white">
                +20
              </p>
              <p className="mt-1 font-[var(--font-ui)] text-[11px] leading-tight text-white/80">
                Años de
                <br />
                experiencia
              </p>
            </div>
          </div>

          {/* stat — sedes (bottom left) — inside image on mobile, overlapping on md+ */}
          <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-2xl border border-white/25 bg-brand-navy/40 px-3 py-2 backdrop-blur-md md:float-card md:-bottom-4 md:-left-5 md:gap-3 md:border-white/70 md:bg-white/85 md:px-4 md:py-3 md:shadow-[0_20px_44px_-18px_rgba(0,18,51,0.35)]">
            <p className="font-[var(--font-display)] text-lg md:text-2xl font-extrabold leading-none text-white md:text-brand-blue">
              9
            </p>
            <p className="font-[var(--font-ui)] text-[11px] md:text-xs leading-tight text-white/80 md:text-text-muted">
              Sedes en
              <br />
              Colombia
            </p>
          </div>

          {/* stat — clients (bottom right) — inside image on mobile, overlapping on md+ */}
          <div className="absolute bottom-3 right-3 flex items-center gap-2 rounded-2xl border border-white/25 bg-brand-navy/40 px-3 py-2 backdrop-blur-md md:float-card md:-bottom-5 md:right-6 md:gap-3 md:border-white/70 md:bg-white/85 md:px-4 md:py-3 md:shadow-[0_20px_44px_-18px_rgba(0,18,51,0.35)]"
            style={{ animationDelay: "1.6s" }}
          >
            <p className="font-[var(--font-display)] text-lg md:text-2xl font-extrabold leading-none text-white md:text-brand-navy">
              64+
            </p>
            <p className="font-[var(--font-ui)] text-[11px] md:text-xs leading-tight text-white/80 md:text-text-muted">
              Empresas
              <br />
              cliente
            </p>
          </div>
        </div>

        {/* RIGHT — copy + checklist + CTAs */}
        <div className="scroll-reveal order-1 text-center lg:order-2 lg:text-left" data-delay="120">
          <span className="inline-flex items-center rounded-full bg-brand-blue/[0.08] px-3.5 py-1.5 font-[var(--font-ui)] text-xs font-semibold uppercase tracking-[0.12em] text-brand-blue">
            Para empresas
          </span>

          <h2 className="mt-5 font-[var(--font-display)] text-3xl font-extrabold leading-[1.05] tracking-[-0.02em] text-brand-navy md:text-[2.75rem]">
            Personal calificado
            <br />
            cuando lo necesitas
          </h2>

          <p className="mt-4 max-w-lg mx-auto font-[var(--font-body)] text-base leading-relaxed text-text-secondary lg:mx-0">
            Gestionamos todo el proceso de selección, vinculación y nómina para
            que tú te concentres en tu negocio.
          </p>

          <ul className="mt-7 inline-flex flex-col space-y-3 text-left">
            {beneficios.map((b) => (
              <li key={b} className="flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-blue text-white">
                  <Check className="h-3.5 w-3.5" />
                </span>
                <span className="font-[var(--font-body)] text-[15px] text-brand-navy">
                  {b}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:gap-4 lg:items-start">
            <Link
              href="/contacto"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-brand-blue px-8 py-4 font-[var(--font-ui)] text-sm font-semibold text-white shadow-[0_12px_30px_-10px_rgba(0,122,254,0.6)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_44px_-12px_rgba(0,122,254,0.6)] active:translate-y-0 active:scale-[0.98]"
              style={{
                transitionDuration: "var(--duration-base)",
                transitionTimingFunction: "var(--ease-spring)",
              }}
            >
              Solicitar propuesta
              <ArrowRight className="h-[18px] w-[18px] transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/servicios"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-navy/15 bg-white px-8 py-4 font-[var(--font-ui)] text-sm font-semibold text-brand-navy transition-all hover:-translate-y-0.5 hover:border-brand-navy/30"
              style={{ transitionDuration: "var(--duration-base)" }}
            >
              Conocer más
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

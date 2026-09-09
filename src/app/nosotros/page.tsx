import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import StatsBar from "@/components/nosotros/StatsBar";
import CTAWithVerticalMarquee from "@/components/ui/cta-with-text-marquee";

export const metadata: Metadata = {
  alternates: { canonical: "/nosotros" },
  title: "Nosotros",
  description:
    "Conoce a Asignar SAS: +20 años conectando talento humano con las mejores empresas de Colombia. Nuestra historia, valores DOCA y presencia en 9 ciudades.",
};

/* ─── Inline icons ─── */
const ArrowRight = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M4 12h15M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Check = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ─── Data ─── */
/* Resumen de entrada (TL;DR). Solo afirma cosas que el resto de la página ya
   sustenta: trayectoria, cobertura, respaldo legal y el modelo DOCA. */
const resumen = [
  {
    title: "Desde 2006",
    desc: "más de 20 años operando como Empresa de Servicios Temporales colombiana, con sede principal en Medellín.",
  },
  {
    title: "9 ciudades",
    desc: "Medellín, Bogotá, Rionegro, Cali, Cartagena, Barranquilla, Santa Marta, Pereira y Manizales, con equipos locales en cada una.",
  },
  {
    title: "Respaldo legal completo",
    desc: "contratación bajo la Ley 50 de 1990, licencia del Ministerio de Trabajo, SG-SST certificado y respaldo de ARL SURA.",
  },
  {
    title: "Modelo DOCA",
    desc: "Disposición, Oportunidad, Calidad y Acompañamiento: respuesta ágil, selección verificada y supervisión in situ después de la vinculación.",
  },
];

const doca = [
  {
    num: "01",
    title: "Disposición",
    desc: "Respondemos con rapidez. Tu urgencia es nuestra prioridad — estamos listos cuando nos necesitas, sin burocracia.",
  },
  {
    num: "02",
    title: "Oportunidad",
    desc: "Conectamos personas con empleos dignos y empresas con talento verificado. Cada posición que llenamos es una oportunidad real para ambas partes.",
  },
  {
    num: "03",
    title: "Calidad",
    desc: "Selección rigurosa con pruebas psicotécnicas, verificación de antecedentes y entrevistas. Solo enviamos personas en las que confiamos.",
  },
  {
    num: "04",
    title: "Acompañamiento",
    desc: "No desaparecemos después de la vinculación. Supervisión in situ, reportes mensuales y un equipo disponible para resolver cualquier situación.",
  },
];

const maps = (q: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

const sedes = [
  { ciudad: "Medellín", dir: "Cra. 48 #10-45, El Poblado", q: "Cra. 48 #10-45, El Poblado, Medellín", featured: true },
  { ciudad: "Bogotá", dir: "Cra 19 #44-61", q: "Cra 19 #44-61, Bogotá" },
  { ciudad: "Rionegro", dir: "Cra. 48 #49-05", q: "Cra. 48 #49-05, Rionegro, Antioquia" },
  { ciudad: "Cali", dir: "Cl. 4 #34-18, El Sindicato", q: "Cl. 4 #34-18, El Sindicato, Cali" },
  { ciudad: "Cartagena", dir: "Cl. 35 #8B-05, Centro", q: "Calle 35 Avenida Venezuela #8B-05, Centro, Cartagena" },
  { ciudad: "Barranquilla", q: "Asignar SAS, Barranquilla, Colombia" },
  { ciudad: "Santa Marta", q: "Asignar SAS, Santa Marta, Colombia" },
  { ciudad: "Pereira", q: "Asignar SAS, Pereira, Colombia" },
  { ciudad: "Manizales", q: "Asignar SAS, Manizales, Colombia" },
];

const social = [
  {
    platform: "Instagram",
    handle: "@asignar_sas",
    url: "https://www.instagram.com/asignar_sas",
    desc: "Vacantes, tips laborales y contenido de nuestra cultura organizacional.",
    color: "from-pink-500 to-purple-600",
    icon: (
      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    platform: "LinkedIn",
    handle: "Asignar SAS",
    url: "https://www.linkedin.com/company/asignar-sas",
    desc: "Noticias corporativas, logros del equipo y oportunidades profesionales.",
    color: "from-blue-600 to-blue-700",
    icon: (
      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    platform: "Facebook",
    handle: "Asignar Temporal",
    url: "https://www.facebook.com/asignartemporal",
    desc: "Comunidad activa, eventos y todo sobre nuestros servicios temporales.",
    color: "from-blue-500 to-blue-600",
    icon: (
      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
];


export default function NosotrosPage() {
  return (
    <>
      {/* 01 — Hero */}
      <section className="bg-surface-gray py-16 md:py-24">
        <div className="max-w-[1280px] mx-auto px-4 md:px-16">
          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
            <div className="flex-1 max-w-xl text-center md:text-left">
              <h1 className="font-[var(--font-display)] text-4xl md:text-5xl lg:text-[48px] font-bold text-brand-navy leading-[1.15] tracking-[-0.02em] mb-6">
                Detrás de cada satisfacción hay un equipo que nadie ve
              </h1>
              <p className="font-[var(--font-body)] text-lg text-text-secondary leading-relaxed mb-8 max-w-lg mx-auto md:mx-0">
                Desde 2006, Asignar conecta el talento colombiano con las empresas que mueven el país. No somos una agencia más: somos el equipo que garantiza que tu operación nunca se detenga — con personal calificado, cumplimiento total y presencia en 9 ciudades.
              </p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <Link
                  href="/servicios"
                  className="group inline-flex items-center gap-2 rounded-full bg-brand-blue px-6 py-3 font-[var(--font-ui)] text-sm font-semibold text-white transition-all hover:bg-brand-deep-blue hover:-translate-y-0.5"
                >
                  Conoce nuestros servicios
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/contacto"
                  className="group inline-flex items-center gap-2 rounded-full border border-border bg-white px-6 py-3 font-[var(--font-ui)] text-sm font-semibold text-brand-navy transition-all hover:border-brand-blue hover:-translate-y-0.5"
                >
                  Habla con nosotros
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
            <div className="flex-1 w-full max-w-lg">
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-gradient-to-br from-brand-blue/10 to-brand-deep-blue/20">
                <Image
                  src="/images/nosotros/hero-nosotros.webp"
                  alt="Colaboradora Asignar organizando toallas en hotel — servicio hotelero profesional"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 01b — TL;DR: resumen de confianza, justo después del H1 */}
      <section aria-labelledby="resumen-heading" className="bg-white pt-12 md:pt-16">
        <div className="max-w-[1280px] mx-auto px-4 md:px-16">
          <div className="rounded-2xl border border-border bg-surface-gray p-6 md:p-8">
            <h2
              id="resumen-heading"
              className="font-[var(--font-display)] text-xl md:text-2xl font-bold text-brand-navy mb-6"
            >
              En resumen: por qué confiar en Asignar
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {resumen.map((r) => (
                <li key={r.title} className="flex items-start gap-3">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-brand-blue" />
                  <p className="font-[var(--font-body)] text-base text-text-secondary leading-relaxed">
                    <strong className="font-bold text-brand-navy">{r.title}:</strong>{" "}
                    {r.desc}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 02 — Origin Story */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-[1280px] mx-auto px-4 md:px-16">
          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
            <div className="w-full md:w-5/12">
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-brand-navy/30 via-brand-navy/50 to-brand-navy/90 z-10" />
                <Image
                  src="/images/nosotros/origin-medellin.webp"
                  alt="Panorámica de Medellín al atardecer — ciudad donde nació Asignar"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 40vw"
                />
                <span className="absolute top-5 left-5 z-20 inline-flex items-center rounded-full bg-brand-blue px-4 py-1.5 font-[var(--font-ui)] text-xs font-semibold text-white">
                  Desde 2006
                </span>
              </div>
            </div>
            <div className="flex-1">
              <h2 className="font-[var(--font-display)] text-3xl md:text-4xl font-bold text-brand-navy leading-tight mb-6">
                Nacimos donde el talento se encuentra con la oportunidad
              </h2>
              <div className="space-y-4 font-[var(--font-body)] text-base text-text-secondary leading-relaxed">
                <p>
                  En Medellín, una ciudad que reinventa su futuro cada día, nació Asignar con una premisa simple: las empresas necesitan personas confiables, y las personas merecen oportunidades dignas. Lo que empezó como una respuesta al sector hotelero se convirtió en la red de talento temporal más especializada de Colombia.
                </p>
                <p>
                  Hoy operamos en 9 ciudades, gestionamos más de 5.000 colaboradores en misión y atendemos sectores desde hotelería y restaurantes hasta logística e industria. Todo bajo la Ley 50 de 1990, con licencia del Ministerio de Trabajo, SG-SST certificado y el respaldo de ARL SURA.
                </p>
              </div>
              <blockquote className="mt-6 border-l-4 border-brand-blue pl-5 font-[var(--font-body)] text-base italic text-text-primary">
                «Creemos que el talento no tiene fronteras, pero la atención personalizada marca la diferencia.»
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* 03 — Stats Band */}
      <StatsBar />

      {/* 04 — DOCA Values */}
      <section className="py-16 md:py-24 bg-surface-gray">
        <div className="max-w-[1280px] mx-auto px-4 md:px-16">
          <div className="mb-12 text-center lg:text-left">
            <h2 className="font-[var(--font-display)] text-3xl md:text-4xl font-bold text-brand-navy mb-3">
              Lo que nos mueve: DOCA
            </h2>
            <p className="font-[var(--font-body)] text-lg text-text-secondary max-w-2xl mx-auto lg:mx-0">
              Cuatro principios que guían cada decisión, cada proceso y cada persona que enviamos a tu operación.
            </p>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {doca.map((d) => (
              <li
                key={d.num}
                className="group relative bg-white rounded-2xl shadow-[0_0_0_1px_rgba(0,18,51,0.04),0_1px_3px_rgba(0,18,51,0.06),0_6px_16px_rgba(0,18,51,0.04)] overflow-hidden transition-all duration-300 hover:shadow-[0_0_0_1px_rgba(0,122,254,0.08),0_2px_6px_rgba(0,18,51,0.08),0_12px_24px_rgba(0,18,51,0.06)] hover:-translate-y-0.5"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-brand-light-blue to-brand-blue" />
                <div className="pl-8 pr-7 py-8">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-brand-gradient font-[var(--font-ui)] text-base font-semibold text-white">
                      {d.num}
                    </span>
                  </div>
                  <h3 className="font-[var(--font-display)] text-xl font-bold text-brand-navy mb-2">
                    {d.title}
                  </h3>
                  <p className="font-[var(--font-body)] text-base text-text-secondary leading-relaxed">
                    {d.desc}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 05 — National Presence */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-[1280px] mx-auto px-4 md:px-16">
          <div className="mb-12 text-center lg:text-left">
            <h2 className="font-[var(--font-display)] text-3xl md:text-4xl font-bold text-brand-navy mb-3">
              Presencia nacional, atención local
            </h2>
            <p className="font-[var(--font-body)] text-lg text-text-secondary max-w-2xl mx-auto lg:mx-0">
              Operamos en las principales ciudades de Colombia con equipos locales. Haz clic en cualquier ciudad para ver la ubicación exacta.
            </p>
          </div>

          <ul className="flex flex-col md:flex-row gap-6">
            {/* Featured — Medellín */}
            <li className="md:w-5/12 aspect-[4/3] md:aspect-auto md:min-h-[400px]">
              <a
                href={maps(sedes[0].q)}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block h-full w-full rounded-2xl overflow-hidden bg-brand-navy"
              >
                {/* Foto de Medellín */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: "url('/images/nosotros/medellin-sede.webp')" }}
                />
                {/* Tinte navy #000826 al 40% */}
                <div className="absolute inset-0 z-10" style={{ backgroundColor: "rgba(0,8,38,0.4)" }} />
                {/* Gradiente lineal para legibilidad del texto */}
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-brand-navy/85 via-brand-navy/25 to-transparent" />
                <div className="absolute bottom-8 left-8 right-8 z-20">
                  <span className="inline-flex items-center rounded-full bg-brand-blue px-3.5 py-1 font-[var(--font-ui)] text-[11px] font-semibold text-white uppercase tracking-wider mb-3">
                    Sede principal
                  </span>
                  <h3 className="font-[var(--font-display)] text-3xl md:text-4xl font-extrabold text-white mb-1">
                    Medellín
                  </h3>
                  <p className="font-[var(--font-body)] text-base text-white/70 mb-2">
                    Cra. 48 #10-45, El Poblado
                  </p>
                  <span className="font-[var(--font-ui)] text-sm font-medium text-brand-light-blue transition-colors group-hover:text-white">
                    Ver en Google Maps →
                  </span>
                </div>
              </a>
            </li>

            {/* Other cities grid */}
            <li className="flex-1">
              <ul className="grid grid-cols-2 gap-4">
                {sedes.slice(1).map((s) => (
                  <li key={s.ciudad}>
                    <a
                      href={maps(s.q)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex h-full flex-col gap-1 rounded-xl border border-border bg-surface-gray p-5 transition-all hover:border-brand-blue/30 hover:shadow-md hover:-translate-y-0.5"
                    >
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-blue/10">
                          <span className="h-2 w-2 rounded-full bg-brand-blue" />
                        </span>
                        <h3 className="font-[var(--font-display)] text-base font-bold text-brand-navy">
                          {s.ciudad}
                        </h3>
                      </div>
                      {s.dir && (
                        <span className="font-[var(--font-body)] text-[13px] text-text-muted ml-9">
                          {s.dir}
                        </span>
                      )}
                      <span className="font-[var(--font-ui)] text-[13px] font-medium text-brand-blue ml-9 transition-colors group-hover:text-brand-deep-blue">
                        Ver en mapa →
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </div>
      </section>

      {/* 06 — Social Connect */}
      <section className="py-16 md:py-24 bg-surface-gray">
        <div className="max-w-[1280px] mx-auto px-4 md:px-16">
          <div className="mb-12 text-center lg:text-left">
            <h2 className="font-[var(--font-display)] text-3xl md:text-4xl font-bold text-brand-navy mb-3">
              Síguenos y conoce nuestro día a día
            </h2>
            <p className="font-[var(--font-body)] text-lg text-text-secondary max-w-2xl mx-auto lg:mx-0">
              Historias reales de nuestro equipo, vacantes activas y la cultura que nos define.
            </p>
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {social.map((s) => (
              <li key={s.platform}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block h-full bg-white rounded-2xl border border-border p-6 transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-brand-blue/20"
                >
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${s.color} text-white mb-4`}>
                    {s.icon}
                  </div>
                  <h3 className="font-[var(--font-display)] text-lg font-bold text-brand-navy mb-0.5">
                    {s.platform}
                  </h3>
                  <p className="font-[var(--font-ui)] text-sm font-medium text-brand-blue mb-2">
                    {s.handle}
                  </p>
                  <p className="font-[var(--font-body)] text-sm text-text-secondary leading-relaxed mb-3">
                    {s.desc}
                  </p>
                  <span className="font-[var(--font-body)] text-xs text-text-muted">
                    {s.url.replace("https://www.", "")}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 07 — CTA */}
      <CTAWithVerticalMarquee />
    </>
  );
}

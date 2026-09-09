"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePropuesta } from "@/components/servicios/PropuestaProvider";

function ArrowRight({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M4 12h15M13 5l7 7-7 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none">
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

interface SubTipo {
  nombre: string;
  descripcion: string;
  checks: string[];
}

interface Servicio {
  num: string;
  titulo: string;
  shortDesc: string;
  subtipos: SubTipo[];
}

/* Los `titulo` deben coincidir con SERVICIOS_OPCIONES en
   components/servicios/PropuestaProvider.tsx para que el <select>
   del formulario quede en la opción correcta. */
const servicios: Servicio[] = [
  {
    num: "01",
    titulo: "Servicios Temporales",
    shortDesc: "Personal calificado para picos, reemplazos y proyectos.",
    subtipos: [
      {
        nombre: "Personal eventual",
        descripcion:
          "Suministro ágil de personal para cubrir picos de demanda, eventos, temporadas y reemplazos puntuales con cumplimiento total de la Ley 50 de 1990.",
        checks: [
          "Cobertura ágil",
          "Eventos, temporadas y picos",
          "Gestión completa de nómina",
          "Sin compromisos a largo plazo",
        ],
      },
      {
        nombre: "Personal temporal fijo",
        descripcion:
          "Personal en misión de tiempo completo para operaciones continuas. Tu equipo, nuestra gestión administrativa y de riesgo laboral.",
        checks: [
          "Misión a tiempo completo",
          "Continuidad operativa garantizada",
          "Prestaciones y seguridad social",
          "Póliza de cumplimiento vigente",
        ],
      },
    ],
  },
  {
    num: "02",
    titulo: "Outsourcing de Procesos",
    shortDesc: "Tercerizamos áreas operativas completas.",
    subtipos: [
      {
        nombre: "Outsourcing operativo",
        descripcion:
          "Gestión integral de áreas como limpieza, cocina, servicio y producción. Nos encargamos del personal y la supervisión en sitio.",
        checks: [
          "Limpieza y mantenimiento",
          "Cocina y servicio de alimentos",
          "Supervisión permanente en sitio",
          "Indicadores y reportes mensuales",
        ],
      },
      {
        nombre: "Outsourcing administrativo",
        descripcion:
          "Tercerización de back-office, recepción, atención al cliente y soporte administrativo con personal capacitado y evaluado.",
        checks: [
          "Recepción y atención al cliente",
          "Soporte administrativo",
          "Personal capacitado y evaluado",
          "Flexibilidad para escalar",
        ],
      },
    ],
  },
  {
    num: "03",
    titulo: "Selección de Personal",
    shortDesc: "Headhunting y evaluación para vacantes directas.",
    subtipos: [
      {
        nombre: "Headhunting ejecutivo",
        descripcion:
          "Búsqueda especializada de perfiles directivos y de alta gerencia que se ajustan a tu cultura organizacional.",
        checks: [
          "Perfiles directivos y especializados",
          "Evaluación por competencias",
          "Verificación de antecedentes",
          "Garantía de permanencia",
        ],
      },
      {
        nombre: "Selección operativa",
        descripcion:
          "Reclutamiento de alto volumen para cubrir vacantes operativas rápidamente, con el mismo rigor de evaluación y verificación.",
        checks: [
          "Reclutamiento de alto volumen",
          "Procesos de selección ágiles",
          "Pruebas psicotécnicas incluidas",
          "Entrevistas grupales e individuales",
        ],
      },
    ],
  },
  {
    num: "04",
    titulo: "Gestión de SST",
    shortDesc: "Sistema de seguridad y salud en el trabajo.",
    subtipos: [
      {
        nombre: "Implementación SG-SST",
        descripcion:
          "Diseño y puesta en marcha del Sistema de Gestión de Seguridad y Salud en el Trabajo. Cumplimiento normativo desde el día uno.",
        checks: [
          "Diseño del SG-SST a medida",
          "Capacitaciones iniciales",
          "Documentación y protocolos",
          "Cumplimiento Resolución 0312",
        ],
      },
      {
        nombre: "Seguimiento y auditoría",
        descripcion:
          "Inspecciones periódicas, capacitaciones continuas y acompañamiento en auditorías para mantener la cultura de prevención.",
        checks: [
          "Inspecciones periódicas en sitio",
          "Capacitaciones continuas",
          "Acompañamiento en auditorías",
          "Gestión de incidentes y reportes",
        ],
      },
    ],
  },
];

/* El estado del carrusel vive en el padre para que el CTA sepa qué
   subtipo se está viendo y pueda precargarlo en el formulario. */
function ServiceDetailCarousel({
  subtipos,
  slide,
  setSlide,
}: {
  subtipos: SubTipo[];
  slide: number;
  setSlide: React.Dispatch<React.SetStateAction<number>>;
}) {
  const autoplayRef = useRef<ReturnType<typeof setInterval>>(null);

  const resetAutoplay = useCallback(() => {
    if (autoplayRef.current) clearInterval(autoplayRef.current);
    if (subtipos.length > 1) {
      autoplayRef.current = setInterval(() => {
        setSlide((prev) => (prev + 1) % subtipos.length);
      }, 6000);
    }
  }, [subtipos.length, setSlide]);

  useEffect(() => {
    resetAutoplay();
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
  }, [resetAutoplay]);

  const goToSlide = (idx: number) => {
    setSlide(idx);
    resetAutoplay();
  };

  return (
    <>
      {/* Sub-type pills */}
      {subtipos.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {subtipos.map((sub, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`px-4 py-[7px] rounded-full font-[var(--font-ui)] text-[13px] font-semibold transition-all duration-300 ${
                idx === slide
                  ? "bg-brand-blue/[0.09] text-brand-blue"
                  : "text-text-muted hover:text-brand-navy hover:bg-surface"
              }`}
            >
              {sub.nombre}
            </button>
          ))}
        </div>
      )}

      {/* Sliding content */}
      <div className="overflow-hidden">
        <div
          className="flex"
          style={{
            transform: `translateX(-${slide * 100}%)`,
            transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {subtipos.map((sub, idx) => (
            <div key={idx} className="min-w-full pr-1">
              <p className="font-[var(--font-body)] text-base text-text-secondary leading-relaxed">
                {sub.descripcion}
              </p>

              <div className="h-px bg-border my-5" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5">
                {sub.checks.map((check) => (
                  <div key={check} className="flex items-center gap-2.5">
                    <div className="w-[22px] h-[22px] rounded-full bg-brand-blue/10 flex items-center justify-center shrink-0">
                      <CheckIcon className="w-4 h-4 text-brand-blue" />
                    </div>
                    <span className="font-[var(--font-body)] text-[14.5px] font-medium text-text-primary leading-snug">
                      {check}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Carousel dots */}
      {subtipos.length > 1 && (
        <div className="flex gap-1.5 pt-1">
          {subtipos.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              aria-label={`Ir a tipo ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === slide
                  ? "w-6 bg-brand-blue"
                  : "w-1.5 bg-border hover:bg-text-muted/50"
              }`}
            />
          ))}
        </div>
      )}
    </>
  );
}

export default function ServiciosExplorer() {
  const [active, setActive] = useState(0);
  const [slide, setSlide] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const [canHover, setCanHover] = useState(false);
  const { solicitarServicio } = usePropuesta();

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setCanHover(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!canHover || !panelRef.current) return;
      const rect = panelRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rx = (y - 0.5) * -6;
      const ry = (x - 0.5) * 6;
      panelRef.current.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      if (glareRef.current) {
        // Brillo azul suave que sigue al cursor (sobre fondo claro).
        glareRef.current.style.background = `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(0,122,254,0.10), transparent 55%)`;
        glareRef.current.style.opacity = "1";
      }
    },
    [canHover]
  );

  const handleMouseLeave = useCallback(() => {
    if (!panelRef.current) return;
    panelRef.current.style.transform =
      "perspective(900px) rotateX(0deg) rotateY(0deg)";
    if (glareRef.current) {
      glareRef.current.style.opacity = "0";
    }
  }, []);

  const seleccionarServicio = (i: number) => {
    setActive(i);
    setSlide(0);
  };

  const s = servicios[active];

  return (
    <section className="py-[var(--spacing-section-mobile)] md:py-[var(--spacing-section)] bg-white">
      <div className="max-w-[var(--container-max)] mx-auto px-4 md:px-16">
        <div className="mb-12 text-center lg:text-left">
          <span className="font-[var(--font-ui)] text-xs font-semibold uppercase tracking-[0.1em] text-brand-blue mb-3 block">
            Nuestros servicios
          </span>
          <h2 className="font-[var(--font-display)] text-3xl md:text-4xl font-extrabold text-brand-navy tracking-[-0.02em] mb-3">
            Cuatro formas de resolver tu operación
          </h2>
          <p className="font-[var(--font-body)] text-base md:text-lg text-text-secondary max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Selecciona un servicio para ver el detalle. Cada uno se adapta al
            sector y al volumen de tu operación.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Service list */}
          <div className="flex flex-col gap-2.5 lg:w-[400px] shrink-0">
            {servicios.map((svc, i) => (
              <button
                key={svc.num}
                onClick={() => seleccionarServicio(i)}
                aria-pressed={i === active}
                className={`flex gap-3.5 items-center text-left px-5 py-[18px] rounded-2xl border transition-all duration-300 ${
                  i === active
                    ? "border-brand-blue bg-brand-blue/[0.05] shadow-[0_10px_30px_-18px_rgba(0,122,254,0.55)]"
                    : "border-border bg-white hover:border-brand-blue/40 hover:bg-surface/60"
                }`}
              >
                <span
                  className={`font-[var(--font-display)] text-[15px] font-extrabold shrink-0 ${
                    i === active ? "text-brand-blue" : "text-text-muted"
                  }`}
                >
                  {svc.num}
                </span>
                <div className="min-w-0">
                  <p
                    className={`font-[var(--font-display)] text-[17px] font-semibold ${
                      i === active ? "text-brand-blue" : "text-brand-navy"
                    }`}
                  >
                    {svc.titulo}
                  </p>
                  <p className="font-[var(--font-body)] text-[13px] mt-0.5 text-text-muted">
                    {svc.shortDesc}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Detail panel — tarjeta clara con brillo de marca */}
          <div
            ref={panelRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative flex-1 rounded-3xl p-8 md:p-10 flex flex-col gap-5 border border-border overflow-hidden"
            style={{
              background:
                "radial-gradient(ellipse 70% 60% at 15% 0%, rgba(5,184,253,0.10), transparent 60%), radial-gradient(ellipse 60% 50% at 100% 100%, rgba(0,122,254,0.10), transparent 60%), #F6F8FB",
              boxShadow:
                "0 1px 2px rgba(0,18,51,0.04), 0 16px 40px -24px rgba(0,18,51,0.25)",
              transition: "transform 0.15s ease-out",
              willChange: "transform",
            }}
          >
            {/* Glare overlay */}
            <div
              ref={glareRef}
              className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-300"
            />

            {/* Service header (fixed) */}
            <div className="relative">
              <p className="font-[var(--font-ui)] text-xs font-semibold tracking-[1px] text-brand-blue mb-2.5">
                SERVICIO {s.num}
              </p>
              <h3 className="font-[var(--font-display)] text-2xl md:text-[30px] font-extrabold text-brand-navy tracking-[-0.6px]">
                {s.titulo}
              </h3>
            </div>

            {/* Carousel */}
            <ServiceDetailCarousel
              subtipos={s.subtipos}
              slide={slide}
              setSlide={setSlide}
            />

            {/* CTA — precarga el servicio en el formulario y sube a él */}
            <button
              type="button"
              onClick={() =>
                solicitarServicio(s.titulo, s.subtipos[slide]?.nombre)
              }
              className="relative inline-flex items-center gap-2 bg-brand-blue text-white font-[var(--font-ui)] text-[15px] font-semibold px-7 py-3.5 rounded-full shadow-[0_8px_20px_-6px_rgba(0,122,254,0.45)] hover:-translate-y-0.5 hover:shadow-[0_12px_26px_-8px_rgba(0,122,254,0.5)] transition-all duration-200 self-start"
            >
              Solicitar este servicio
              <ArrowRight className="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

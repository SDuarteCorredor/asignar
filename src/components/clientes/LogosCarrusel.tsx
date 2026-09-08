"use client";

import { useCallback, useEffect, useRef } from "react";
import type { LogoCliente } from "@/lib/clientes";

type IconProps = { className?: string };
const ChevronLeft = ({ className = "" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const ChevronRight = ({ className = "" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** Duración del desplazamiento que dispara una flecha. */
const DURACION_FLECHA = 620;
/** `--ease-out` de DESIGN.md, en JS: la flecha frena como frena todo el sitio. */
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

type Props = {
  logos: LogoCliente[];
  /** Velocidad del avance automático en px/s. */
  velocidad?: number;
  /** Si se pasa, cada logo se vuelve clickeable y llama a esto. */
  onLogoClick?: (logo: LogoCliente) => void;
  /** Texto accesible del carrusel completo. */
  etiqueta: string;
  /** Ayuda que se anuncia en las flechas ("logos de clientes"). */
  nombreItems?: string;
};

/**
 * Marquee de logos que además se puede empujar con flechas.
 *
 * El avance automático y las flechas comparten un solo `requestAnimationFrame`
 * sobre un `translate3d`: intentar combinar la animación CSS anterior con un
 * `scrollTo` daba saltos, porque las dos escribían la misma posición. Aquí hay
 * una única fuente de verdad (`offsetRef`, en px) que el loop normaliza contra
 * la mitad de la pista —la lista va duplicada— para que el ciclo sea infinito
 * en las dos direcciones sin costuras visibles.
 */
export default function LogosCarrusel({
  logos,
  velocidad = 330,
  onLogoClick,
  etiqueta,
  nombreItems = "logos",
}: Props) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const mitadRef = useRef(0);
  const pausaRef = useRef(false);
  const reduceRef = useRef(false);
  const tweenRef = useRef<{ desde: number; hasta: number; inicio: number } | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    const viewport = viewportRef.current;
    if (!track || !viewport) return;

    const medir = () => {
      mitadRef.current = track.scrollWidth / 2;
    };
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(track);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    reduceRef.current = reduce.matches;
    const onReduce = (e: MediaQueryListEvent) => (reduceRef.current = e.matches);
    reduce.addEventListener("change", onReduce);
    let raf = 0;
    let anterior = performance.now();

    const frame = (ahora: number) => {
      const dt = Math.min((ahora - anterior) / 1000, 0.05);
      anterior = ahora;
      const mitad = mitadRef.current;

      if (mitad > 0) {
        const tween = tweenRef.current;
        if (tween) {
          // Con reduced-motion la flecha salta al destino: es movimiento que
          // pidió la persona, pero no tiene por qué recorrerse en pantalla.
          const duracion = reduceRef.current ? 1 : DURACION_FLECHA;
          const t = Math.min((ahora - tween.inicio) / duracion, 1);
          offsetRef.current = tween.desde + (tween.hasta - tween.desde) * easeOut(t);
          if (t >= 1) tweenRef.current = null;
        } else if (!pausaRef.current && !reduceRef.current) {
          offsetRef.current += velocidad * dt;
        }
        // Módulo positivo: al retroceder con la flecha izquierda el offset se
        // vuelve negativo y debe reaparecer por el final de la pista.
        offsetRef.current = ((offsetRef.current % mitad) + mitad) % mitad;
        track.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      reduce.removeEventListener("change", onReduce);
    };
  }, [velocidad]);

  const empujar = useCallback((direccion: 1 | -1) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    // Casi una pantalla: se ve claro que hay logos nuevos y aun así queda un
    // borde en común que da continuidad.
    const paso = Math.max(viewport.clientWidth * 0.8, 240);
    tweenRef.current = {
      desde: offsetRef.current,
      hasta: offsetRef.current + direccion * paso,
      inicio: performance.now(),
    };
  }, []);

  const pista = [...logos, ...logos];
  const clickeable = Boolean(onLogoClick);

  return (
    <div
      className="relative"
      onMouseEnter={() => (pausaRef.current = true)}
      onMouseLeave={() => (pausaRef.current = false)}
      onFocus={() => (pausaRef.current = true)}
      onBlur={() => (pausaRef.current = false)}
    >
      <div ref={viewportRef} className="overflow-hidden" role="region" aria-label={etiqueta}>
        <div ref={trackRef} className="flex w-max items-center gap-6 md:gap-8 will-change-transform">
          {pista.map((logo, i) => {
            const duplicado = i >= logos.length;
            const contenido = (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={logo.src}
                alt={duplicado ? "" : logo.alt}
                loading="lazy"
                width={150}
                height={150}
                className="h-full w-full object-contain"
              />
            );
            /* Caja cuadrada fija, no `w-auto`: los logos van con `loading=lazy`
               y hasta que cargan miden 0px de ancho, así que el ancho de la
               pista —y con él el punto de repetición del ciclo— cambiaba a
               medida que entraban imágenes. Todos los logos son cuadrados
               (±7%), así que reservar el cuadrado no recorta nada. */
            const clases =
              "shrink-0 flex items-center justify-center h-[104px] w-[104px] md:h-[128px] md:w-[128px] lg:h-[150px] lg:w-[150px]";

            return clickeable ? (
              <button
                key={i}
                type="button"
                /* Fuera del tab: 124 paradas de teclado para abrir siempre el
                   mismo modal serían ruido. El acceso por teclado es el botón
                   "Ver todos los clientes" que acompaña al carrusel. */
                tabIndex={-1}
                aria-hidden={duplicado || undefined}
                onClick={() => onLogoClick?.(logo)}
                title={`${logo.alt} — ver todos los clientes`}
                className={`${clases} cursor-pointer transition-transform duration-[var(--duration-base)] ease-[var(--ease-out)] hover:scale-[1.06]`}
              >
                {contenido}
              </button>
            ) : (
              <div key={i} className={clases} aria-hidden={duplicado || undefined}>
                {contenido}
              </div>
            );
          })}
        </div>
      </div>

      {/* Desvanecidos laterales: los logos entran y salen en vez de cortarse. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white via-white/60 to-transparent md:w-28"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white via-white/60 to-transparent md:w-28"
      />

      <button
        type="button"
        onClick={() => empujar(-1)}
        aria-label={`Ver ${nombreItems} anteriores`}
        className="absolute left-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-brand-navy/15 bg-white/90 text-brand-navy/60 shadow-sm backdrop-blur-sm transition-all hover:border-brand-blue hover:text-brand-blue md:left-3"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => empujar(1)}
        aria-label={`Ver más ${nombreItems}`}
        className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-brand-navy/15 bg-white/90 text-brand-navy/60 shadow-sm backdrop-blur-sm transition-all hover:border-brand-blue hover:text-brand-blue md:right-3"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}

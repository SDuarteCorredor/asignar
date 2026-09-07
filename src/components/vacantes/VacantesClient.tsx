"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import type { FormEvent } from "react";
import { trackEvent } from "@/lib/analytics";
import type { Vacante } from "@/lib/vacantes";
import { ciudadDesdeParam, opcionesDeFiltro, slugCiudad } from "@/lib/vacantes";

const MARKETING_EMAIL = "marketingdigital@asignar.com.co";

/** Vacantes por página. Con cientos publicadas, una lista completa deja de
    ser navegable y pesa de más en el HTML. */
const POR_PAGINA = 10;

/* Alto y posición de las tres columnas en desktop. El 156 sale de sumar el
   navbar (80) y la barra de filtros (~68), más un respiro. */
const COLUMNA = "lg:sticky lg:top-[156px] lg:h-[calc(100vh-172px)]";

/* ---------- Estilos de formulario ---------- */
const labelCls = "font-[var(--font-ui)] text-[12.5px] font-semibold text-brand-navy block mb-[7px]";
const baseInput = "w-full bg-surface border rounded-xl px-3.5 py-[13px] font-[var(--font-body)] text-sm text-text-primary placeholder:text-text-muted outline-none transition-colors";
const inputCls = (err?: boolean) => `${baseInput} ${err ? "border-red-400 focus:border-red-500" : "border-border focus:border-brand-blue"}`;

/* ============================================================
   Chip de filtro (estilo Magneto: botón + popover)
   ============================================================ */
function FilterChip({
  label, value, opciones, onChange, open, onToggle,
}: {
  label: string; value: string; opciones: readonly string[];
  onChange: (v: string) => void; open: boolean; onToggle: () => void;
}) {
  const activo = value !== opciones[0];
  return (
    <div className="relative" data-chip>
      <button
        type="button"
        onClick={onToggle}
        className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 font-[var(--font-ui)] text-[13px] font-semibold transition-colors ${
          activo
            ? "border-brand-blue bg-brand-blue/[0.06] text-brand-blue"
            : "border-border bg-white text-brand-navy hover:border-brand-blue/40"
        }`}
      >
        {activo ? value : label}
        <span className={`material-symbols-outlined text-[18px] transition-transform ${open ? "rotate-180" : ""}`}>
          expand_more
        </span>
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-2 z-40 w-56 rounded-2xl border border-border bg-white p-1.5 shadow-[0_16px_40px_-16px_rgba(0,18,51,0.3)] animate-[fadeIn_0.15s_ease-out]">
          {opciones.map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => onChange(o)}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left font-[var(--font-body)] text-sm transition-colors ${
                value === o ? "bg-brand-blue/[0.06] text-brand-blue font-semibold" : "text-text-secondary hover:bg-surface"
              }`}
            >
              {o}
              {value === o && <span className="material-symbols-outlined text-[18px]">check</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   Selector de ciudad
   Era un <select> nativo: abría el menú del sistema, desalineado con el resto
   de la barra y sin forma de buscar. Con muchas ciudades publicadas eso se
   vuelve una lista larga imposible de recorrer.
   ============================================================ */
function CiudadSelector({
  valor, opciones, onChange, open, onToggle,
}: {
  valor: string; opciones: readonly string[];
  onChange: (v: string) => void; open: boolean; onToggle: () => void;
}) {
  const [busqueda, setBusqueda] = useState("");
  const activo = valor !== "Todas";
  const filtradas = opciones.filter((c) =>
    c.toLowerCase().includes(busqueda.trim().toLowerCase())
  );

  return (
    <div className="relative flex-1 sm:flex-none" data-chip>
      <button
        type="button"
        onClick={onToggle}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full items-center gap-2 rounded-full border border-border bg-surface px-4 py-2.5 text-left font-[var(--font-body)] text-sm transition-colors sm:min-w-[195px] sm:border-0 sm:bg-transparent sm:py-1.5"
      >
        <span className="material-symbols-outlined text-[20px] text-brand-blue">location_on</span>
        <span className={`flex-1 truncate ${activo ? "font-semibold text-brand-navy" : "text-text-primary"}`}>
          {activo ? valor : "Todas las ciudades"}
        </span>
        <span className={`material-symbols-outlined text-[18px] text-text-muted transition-transform ${open ? "rotate-180" : ""}`}>
          expand_more
        </span>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-40 mt-2 w-full min-w-[240px] rounded-2xl border border-border bg-white p-1.5 shadow-[0_16px_40px_-16px_rgba(0,18,51,0.3)] animate-[fadeIn_0.15s_ease-out]">
          {/* El buscador aparece solo cuando la lista lo amerita */}
          {opciones.length > 8 && (
            <div className="mb-1 flex items-center gap-2 rounded-xl bg-surface px-3 py-2">
              <span className="material-symbols-outlined text-[18px] text-text-muted">search</span>
              <input
                autoFocus
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar ciudad"
                aria-label="Buscar ciudad"
                className="w-full bg-transparent font-[var(--font-body)] text-sm outline-none placeholder:text-text-muted"
              />
            </div>
          )}
          <div className="max-h-64 overflow-y-auto">
            {filtradas.length === 0 && (
              <p className="px-3 py-2 font-[var(--font-body)] text-sm text-text-muted">Sin coincidencias</p>
            )}
            {filtradas.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => { onChange(c); setBusqueda(""); }}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left font-[var(--font-body)] text-sm transition-colors ${
                  valor === c ? "bg-brand-blue/[0.06] font-semibold text-brand-blue" : "text-text-secondary hover:bg-surface"
                }`}
              >
                {c === "Todas" ? "Todas las ciudades" : c}
                {valor === c && <span className="material-symbols-outlined text-[18px]">check</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   Compartir una vacante: enlace y QR
   ============================================================ */
function Compartir({ v }: { v: Vacante }) {
  const [abierto, setAbierto] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [url, setUrl] = useState("");

  // El origen real solo se conoce en el navegador: en el prerender no existe,
  // y así el enlace sirve igual en el preview de Vercel y en producción. Se
  // calcula al abrir, no en un efecto, para no encadenar un render de más.
  const alternar = () => {
    setAbierto((a) => {
      if (!a) setUrl(`${window.location.origin}/vacantes?v=${encodeURIComponent(v.id)}`);
      return !a;
    });
  };

  // Cerrar al hacer clic afuera, como los demás desplegables de la página.
  useEffect(() => {
    if (!abierto) return;
    const onDown = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest("[data-compartir]")) setAbierto(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [abierto]);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      trackEvent("vacante_compartida", { canal: "copiar_enlace", vacante_id: v.id });
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Sin permiso de portapapeles: el campo de texto queda para copiar a mano.
    }
  };

  return (
    <div className="relative" data-compartir>
      <button
        type="button"
        onClick={alternar}
        aria-expanded={abierto}
        className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 font-[var(--font-ui)] text-[12px] font-semibold text-white transition-colors hover:bg-white/25"
      >
        <span className="material-symbols-outlined text-[16px]">share</span>
        Compartir
      </button>

      {abierto && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[268px] rounded-2xl border border-border bg-white p-3 text-left shadow-[0_16px_40px_-16px_rgba(0,18,51,0.4)] animate-[fadeIn_0.15s_ease-out]">
          <p className="mb-2 font-[var(--font-ui)] text-[11px] font-semibold uppercase tracking-wide text-text-muted">
            Enlace de la vacante
          </p>
          <div className="flex items-center gap-1.5">
            <input
              readOnly
              value={url}
              onFocus={(e) => e.currentTarget.select()}
              className="w-full rounded-lg border border-border bg-surface px-2.5 py-2 font-[var(--font-body)] text-[12px] text-text-secondary outline-none"
            />
            <button
              type="button"
              onClick={copiar}
              aria-label="Copiar enlace"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-blue text-white transition-colors hover:bg-brand-deep-blue"
            >
              <span className="material-symbols-outlined text-[18px]">{copiado ? "check" : "content_copy"}</span>
            </button>
          </div>
          {copiado && <p className="mt-1 font-[var(--font-ui)] text-[11px] text-brand-blue">Enlace copiado</p>}

          <div className="mt-3 flex flex-col items-center rounded-xl border border-border bg-surface p-3">
            {/* eslint-disable-next-line @next/next/no-img-element -- SVG generado al vuelo, sin optimización de next/image */}
            <img
              src={`/api/qr?v=${encodeURIComponent(v.id)}`}
              alt={`Código QR de la vacante ${v.cargo}`}
              width={140}
              height={140}
              className="h-[140px] w-[140px]"
            />
            <a
              href={`/api/qr?v=${encodeURIComponent(v.id)}`}
              download={`vacante-${v.id}.svg`}
              className="mt-2 font-[var(--font-ui)] text-[12px] font-semibold text-brand-blue hover:underline"
            >
              Descargar QR
            </a>
          </div>

          <a
            href={`https://wa.me/?text=${encodeURIComponent(`${v.cargo} en ${v.ciudad} — ${url}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent("vacante_compartida", { canal: "whatsapp", vacante_id: v.id })}
            className="mt-2.5 flex items-center justify-center gap-1.5 rounded-full border border-border py-2 font-[var(--font-ui)] text-[13px] font-semibold text-brand-navy transition-colors hover:border-brand-blue/50 hover:text-brand-blue"
          >
            <span className="material-symbols-outlined text-[17px]">chat</span>
            Enviar por WhatsApp
          </a>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   Ítem de la lista (columna izquierda)
   ============================================================ */
function VacanteItem({ v, active, onClick }: { v: Vacante; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-2xl border p-4 transition-all ${
        active
          ? "border-brand-blue bg-brand-blue/[0.04] shadow-[0_10px_30px_-18px_rgba(0,122,254,0.5)]"
          : "border-border bg-white hover:border-brand-blue/40"
      }`}
    >
      <div className="flex items-start gap-3">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${active ? "bg-brand-blue text-white" : "bg-brand-blue/10 text-brand-blue"}`}>
          <span className="material-symbols-outlined text-[22px]">{v.icon}</span>
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h2 className="font-[var(--font-display)] text-[15px] font-bold text-brand-navy leading-snug">{v.cargo}</h2>
            {v.destacada && (
              <span className="shrink-0 inline-flex items-center rounded-full bg-brand-blue/10 px-2 py-0.5 font-[var(--font-ui)] text-[9px] font-semibold uppercase tracking-wide text-brand-blue">
                Destacada
              </span>
            )}
          </div>
          <p className="mt-0.5 flex items-center gap-1 font-[var(--font-body)] text-[12.5px] text-text-muted">
            <span className="material-symbols-outlined text-[14px]">location_on</span>
            {v.ciudad} · {v.sector}
          </p>
          <p className="mt-1.5 font-[var(--font-display)] text-sm font-extrabold text-brand-navy">
            {v.salario} <span className="font-[var(--font-body)] text-[11px] font-normal text-text-muted">/ mes</span>
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {[v.contrato, v.jornada].map((c) => (
              <span key={c} className="rounded-full bg-surface-gray px-2 py-0.5 font-[var(--font-ui)] text-[10.5px] font-medium text-text-secondary">{c}</span>
            ))}
          </div>
        </div>
      </div>
    </button>
  );
}

/* ============================================================
   Paginador — la lista se corta de a 10 para que siga siendo usable
   cuando haya cientos de vacantes publicadas.
   ============================================================ */
function Paginador({
  pagina, total, onCambiar,
}: { pagina: number; total: number; onCambiar: (p: number) => void }) {
  if (total <= 1) return null;

  // Con muchas páginas no se listan todas: se muestra una ventana alrededor
  // de la actual, más la primera y la última.
  const numeros: (number | "…")[] = [];
  for (let p = 1; p <= total; p++) {
    if (p === 1 || p === total || Math.abs(p - pagina) <= 2) numeros.push(p);
    else if (numeros.at(-1) !== "…") numeros.push("…");
  }

  const flecha = "flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-secondary transition-colors hover:border-brand-blue/50 hover:text-brand-blue disabled:opacity-35 disabled:hover:border-border disabled:hover:text-text-secondary";

  return (
    <nav aria-label="Paginación de vacantes" className="flex items-center justify-center gap-1 border-t border-border bg-white px-2 py-2.5">
      <button type="button" onClick={() => onCambiar(pagina - 1)} disabled={pagina === 1} aria-label="Página anterior" className={flecha}>
        <span className="material-symbols-outlined text-[18px]">chevron_left</span>
      </button>
      {numeros.map((n, i) =>
        n === "…" ? (
          <span key={`e${i}`} className="px-1 font-[var(--font-ui)] text-[13px] text-text-muted">…</span>
        ) : (
          <button
            key={n}
            type="button"
            onClick={() => onCambiar(n)}
            aria-current={n === pagina ? "page" : undefined}
            className={`h-8 min-w-8 rounded-lg px-2 font-[var(--font-ui)] text-[13px] font-semibold transition-colors ${
              n === pagina ? "bg-brand-blue text-white" : "text-text-secondary hover:bg-surface"
            }`}
          >
            {n}
          </button>
        )
      )}
      <button type="button" onClick={() => onCambiar(pagina + 1)} disabled={pagina === total} aria-label="Página siguiente" className={flecha}>
        <span className="material-symbols-outlined text-[18px]">chevron_right</span>
      </button>
    </nav>
  );
}

/* ============================================================
   Info de la vacante (bloque del medio)
   ============================================================ */
function InfoVacante({ v, onClose }: { v: Vacante; onClose?: () => void }) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-brand-gradient p-6 text-white">
      <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
      {onClose && (
        <button type="button" onClick={onClose} aria-label="Cerrar" className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white lg:hidden">
          <span className="material-symbols-outlined">close</span>
        </button>
      )}
      <div className="relative">
        {/* En el overlay móvil el botón de cerrar es absoluto (right-4 top-4),
            así que la fila reserva espacio a la derecha para que "Compartir"
            no le quede debajo. Compartir tiene que existir sobre todo aquí:
            una vacante se pasa a un amigo desde el celular, no desde el
            escritorio. */}
        <div className={`flex items-center justify-between gap-2 ${onClose ? "pr-10 lg:pr-0" : ""}`}>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 font-[var(--font-ui)] text-[11px] font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
            </span>
            Vacante activa
          </span>
          <Compartir v={v} />
        </div>
        <p className="mt-3 font-[var(--font-ui)] text-[11px] text-white/45">
          Ref. {v.id}
        </p>
        <h2 className="mt-1 font-[var(--font-display)] text-2xl font-extrabold leading-tight">{v.cargo}</h2>
        <p className="mt-1.5 flex items-center gap-1.5 font-[var(--font-body)] text-sm text-white/80">
          <span className="material-symbols-outlined text-[18px]">location_on</span>
          {v.ciudad}, {v.departamento}
        </p>

        <div className="mt-5 rounded-2xl border border-white/15 bg-white/10 p-4">
          <p className="font-[var(--font-ui)] text-[11px] font-semibold uppercase tracking-wide text-white/60">Salario mensual</p>
          <p className="font-[var(--font-display)] text-2xl font-extrabold">{v.salario}</p>
          <p className="mt-0.5 font-[var(--font-body)] text-[12px] text-white/70">{v.salarioDetalle}</p>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2.5">
          {[
            { i: "work_history", l: "Experiencia", val: v.experiencia },
            { i: "assignment", l: "Contrato", val: v.contrato },
            { i: "schedule", l: "Jornada", val: v.jornada },
            { i: "business", l: "Modalidad", val: v.modalidad },
          ].map((h) => (
            <div key={h.l} className="rounded-xl border border-white/10 bg-white/[0.07] p-3">
              <span className="material-symbols-outlined text-[19px] text-brand-light-blue">{h.i}</span>
              <p className="mt-1 font-[var(--font-ui)] text-[10px] font-semibold uppercase tracking-wide text-white/55">{h.l}</p>
              <p className="font-[var(--font-body)] text-[13px] font-medium leading-snug text-white">{h.val}</p>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <p className="mb-1.5 font-[var(--font-ui)] text-[11px] font-semibold uppercase tracking-wide text-white/55">Funciones principales</p>
          <p className="font-[var(--font-body)] text-[13px] leading-relaxed text-white/85">{v.funciones}</p>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Formulario de postulación (bloque derecho)
   Envía al endpoint; si falla, cae al correo.
   ============================================================ */
function FormPostulacion({ v }: { v: Vacante }) {
  const [form, setForm] = useState({ nombre: "", tipoDoc: "CC", documento: "", edad: "", telefono: "", whatsapp: "", hojaVida: "", consent: false });
  const [archivo, setArchivo] = useState<File | null>(null);
  /* Consentimiento SEPARADO y opcional para comunicaciones comerciales.
     El de tratamiento de datos cubre el proceso de selección; usar esos
     mismos datos para campañas requiere autorización expresa (Ley 1581). */
  const [autorizaMarketing, setAutorizaMarketing] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  /* "api" = quedó registrada y enrutada por n8n · "correo" = respaldo por mailto */
  const [via, setVia] = useState<"api" | "correo">("api");

  const set = (k: string, val: string | boolean) => {
    setForm((f) => ({ ...f, [k]: val }));
    setErrores((e) => ({ ...e, [k]: "" }));
  };

  const validar = () => {
    const e: Record<string, string> = {};
    if (!form.nombre.trim()) e.nombre = "Ingresa tus nombres completos.";
    if (!form.documento.trim()) e.documento = "Ingresa tu número de documento.";
    if (!form.edad.trim()) e.edad = "Ingresa tu edad.";
    if (!form.telefono.trim()) e.telefono = "Ingresa un teléfono.";
    if (!form.consent) e.consent = "Debes aceptar el tratamiento de datos.";
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!validar() || enviando) return;
    setEnviando(true);

    trackEvent("postulacion_enviada", {
      cargo: v.cargo,
      ciudad: v.ciudad,
      sector: v.sector,
      con_hoja_de_vida: Boolean(archivo),
    });

    // 1) Camino principal: el endpoint reenvía a n8n, que resuelve el
    //    reclutador según la vacante y sube la hoja de vida a Drive.
    try {
      const datos = new FormData();
      datos.set("vacanteId", String(v.id));
      datos.set("cargo", v.cargo);
      datos.set("ciudad", v.ciudad);
      datos.set("sector", v.sector);
      datos.set("nombre", form.nombre);
      datos.set("tipoDocumento", form.tipoDoc);
      datos.set("documento", form.documento);
      datos.set("edad", form.edad);
      datos.set("telefono", form.telefono);
      datos.set("whatsapp", form.whatsapp);
      datos.set("autorizaDatos", "true");
      datos.set("autorizaMarketing", String(autorizaMarketing));
      if (archivo) datos.set("hojaVida", archivo);

      const res = await fetch("/api/postulacion", { method: "POST", body: datos });
      if (res.ok) {
        setVia("api");
        setEnviado(true);
        setEnviando(false);
        return;
      }
    } catch {
      // Sin conexión o endpoint caído: seguimos al respaldo por correo.
    }

    // 2) Respaldo: abre el correo con la postulación diligenciada. El formato
    //    lo consume el flujo "Router Aspirantes" (clasifica y enruta por
    //    CIUDAD), por eso la ciudad va sola en su línea.
    const cuerpo = [
      `POSTULACIÓN A VACANTE`,
      `Ciudad: ${v.ciudad}`,
      `Cargo: ${v.cargo}`,
      `Sector: ${v.sector}`,
      "",
      `Nombres: ${form.nombre}`,
      `Documento: ${form.tipoDoc} ${form.documento}`,
      `Edad: ${form.edad}`,
      `Teléfono: ${form.telefono}`,
      `WhatsApp: ${form.whatsapp || "—"}`,
      `Hoja de vida: ${
        form.hojaVida
          ? `${form.hojaVida} (recuerda adjuntarla a este correo)`
          : "no adjunta"
      }`,
      "",
      "— Autorizo el tratamiento de mis datos personales (Ley 1581 de 2012).",
      autorizaMarketing
        ? "— Autorizo recibir información sobre nuevas vacantes y oportunidades."
        : "— NO autorizo comunicaciones comerciales.",
    ].join("\n");

    window.location.href = `mailto:${MARKETING_EMAIL}?subject=${encodeURIComponent(`Postulación — ${v.cargo} (${v.ciudad})`)}&body=${encodeURIComponent(cuerpo)}`;
    setVia("correo");
    setEnviado(true);
    setEnviando(false);
  };

  return (
    <div className="rounded-3xl border border-border bg-white">
      <div className="p-6 md:p-7">
        {enviado ? (
          <div className="flex flex-col items-center justify-center text-center py-8">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-blue/10">
              <span className="material-symbols-outlined text-brand-blue text-3xl">mark_email_read</span>
            </div>
            <h3 className="font-[var(--font-display)] text-xl font-bold text-brand-navy mb-2">
              {via === "api" ? "¡Postulación enviada!" : "¡Postulación lista!"}
            </h3>
            <p className="font-[var(--font-body)] text-sm text-text-secondary max-w-xs">
              {via === "api"
                ? "Recibimos tu postulación y la enviamos al equipo de selección de tu ciudad. Te contactaremos muy pronto."
                : "Se abrió tu correo con la postulación diligenciada. Si tienes hoja de vida, adjúntala antes de enviar. Nuestro equipo te contactará muy pronto."}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-5">
              <h3 className="font-[var(--font-display)] text-lg font-extrabold text-brand-navy">Postúlate a esta vacante</h3>
              <p className="flex items-center gap-1.5 font-[var(--font-body)] text-[13px] text-text-muted mt-1">
                <span className="material-symbols-outlined text-[16px]">schedule</span> Te toma menos de 2 minutos
              </p>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
              <div>
                <label htmlFor="ap-nombre" className={labelCls}>Nombres completos <span className="text-red-500">*</span></label>
                <input id="ap-nombre" type="text" value={form.nombre} onChange={(e) => set("nombre", e.target.value)} placeholder="Ej. María Camila López Restrepo" className={inputCls(!!errores.nombre)} />
                {errores.nombre && <p className="mt-1 text-[11px] text-red-500">{errores.nombre}</p>}
              </div>
              {/* En pantallas anchas los campos cortos van en fila: el panel es
                  ancho y campos de 900px para una edad se ven desproporcionados. */}
              <div className="grid grid-cols-[104px_1fr] gap-3 sm:grid-cols-[104px_1fr_130px]">
                <div>
                  <label htmlFor="ap-tipodoc" className={labelCls}>Tipo ID</label>
                  <select id="ap-tipodoc" value={form.tipoDoc} onChange={(e) => set("tipoDoc", e.target.value)} className={`${inputCls()} appearance-none`}>
                    {["CC", "CE", "PPT", "PA"].map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="ap-doc" className={labelCls}>Número de documento <span className="text-red-500">*</span></label>
                  <input id="ap-doc" type="text" inputMode="numeric" value={form.documento} onChange={(e) => set("documento", e.target.value)} placeholder="Sin puntos ni comas" className={inputCls(!!errores.documento)} />
                  {errores.documento && <p className="mt-1 text-[11px] text-red-500">{errores.documento}</p>}
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label htmlFor="ap-edad" className={labelCls}>Edad <span className="text-red-500">*</span></label>
                  <input id="ap-edad" type="number" inputMode="numeric" min={18} max={70} value={form.edad} onChange={(e) => set("edad", e.target.value)} placeholder="Años" className={inputCls(!!errores.edad)} />
                  {errores.edad && <p className="mt-1 text-[11px] text-red-500">{errores.edad}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="ap-tel" className={labelCls}>Teléfono <span className="text-red-500">*</span></label>
                  <input id="ap-tel" type="tel" inputMode="tel" value={form.telefono} onChange={(e) => set("telefono", e.target.value)} placeholder="Ej. 300 123 4567" className={inputCls(!!errores.telefono)} />
                  {errores.telefono && <p className="mt-1 text-[11px] text-red-500">{errores.telefono}</p>}
                </div>
                <div>
                  <label htmlFor="ap-wa" className={labelCls}>WhatsApp <span className="text-text-muted font-normal">(opcional)</span></label>
                  <input id="ap-wa" type="tel" inputMode="tel" value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="Ej. 300 123 4567" className={inputCls()} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Hoja de vida <span className="text-text-muted font-normal">(opcional)</span></label>
                <label htmlFor="ap-cv" className="flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border bg-surface px-4 py-5 cursor-pointer hover:border-brand-blue/50 transition-colors text-center">
                  <span className="material-symbols-outlined text-brand-blue text-2xl">upload_file</span>
                  <span className="font-[var(--font-body)] text-[13px] text-text-secondary">
                    {form.hojaVida ? <strong className="text-brand-navy">{form.hojaVida}</strong> : <>Adjunta tu HV — <strong className="text-brand-blue">selecciona</strong></>}
                  </span>
                  <span className="font-[var(--font-ui)] text-[11px] text-text-muted">PDF o Word · máx. 5 MB</span>
                  <input id="ap-cv" type="file" accept=".pdf,.doc,.docx" className="sr-only" onChange={(e) => {
                        const f = e.target.files?.[0] ?? null;
                        setArchivo(f);
                        set("hojaVida", f?.name || "");
                      }} />
                </label>
              </div>
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input type="checkbox" checked={form.consent} onChange={(e) => set("consent", e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-brand-blue" />
                <span className="font-[var(--font-body)] text-[12px] text-text-secondary leading-snug">
                  Autorizo el tratamiento de mis datos personales conforme a la{" "}
                  <a href="https://www.asignar.com.co/build/img/Politica_Tratamiento_Datos_Personales.pdf" target="_blank" rel="noopener noreferrer" className="text-brand-blue underline">política de datos</a>{" "}(Ley 1581 de 2012).
                </span>
              </label>
              {errores.consent && <p className="-mt-2 text-[11px] text-red-500">{errores.consent}</p>}

              <label className="-mt-1 flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autorizaMarketing}
                  onChange={(e) => setAutorizaMarketing(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-brand-blue"
                />
                <span className="font-[var(--font-body)] text-[12px] text-text-secondary leading-snug">
                  Quiero recibir información sobre nuevas vacantes y oportunidades
                  laborales. <span className="text-text-muted">(Opcional)</span>
                </span>
              </label>
              <button
                type="submit"
                disabled={enviando}
                className="mt-1 w-full inline-flex items-center justify-center gap-2 bg-brand-blue text-white font-[var(--font-ui)] text-[15px] font-semibold py-[15px] rounded-full shadow-[0_8px_20px_-6px_rgba(0,122,254,0.35)] hover:-translate-y-0.5 transition-transform disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {enviando ? "Enviando…" : "Postularme ahora"}
                {!enviando && <span className="material-symbols-outlined text-lg">arrow_forward</span>}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   Portal de vacantes
   ============================================================ */
export default function VacantesClient({ vacantes }: { vacantes: Vacante[] }) {
  // Los filtros se derivan de lo que realmente hay publicado en el Sheet,
  // así que al agregar una ciudad o un sector nuevo aparece solo.
  const opciones = useMemo(() => opcionesDeFiltro(vacantes), [vacantes]);
  const FILTROS = useMemo(
    () => [
      { key: "sector", label: "Sector", opciones: opciones.sectores },
      { key: "modalidad", label: "Modalidad", opciones: opciones.modalidades },
      { key: "experiencia", label: "Experiencia", opciones: opciones.experiencias },
      { key: "contrato", label: "Contrato", opciones: opciones.contratos },
    ],
    [opciones]
  );

  const [query, setQuery] = useState("");
  const [ciudad, setCiudad] = useState("Todas");
  const [sector, setSector] = useState("Todos");
  const [modalidad, setModalidad] = useState("Todas");
  const [experiencia, setExperiencia] = useState("Todas");
  const [contrato, setContrato] = useState("Todos");
  const [openChip, setOpenChip] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string>(vacantes[0]?.id ?? "");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pagina, setPagina] = useState(1);
  const listaRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const setters: Record<string, (v: string) => void> = {
    sector: setSector, modalidad: setModalidad, experiencia: setExperiencia, contrato: setContrato,
  };
  const valores: Record<string, string> = { sector, modalidad, experiencia, contrato };

  // Cerrar popover de filtros al hacer clic afuera
  useEffect(() => {
    if (!openChip) return;
    const onDown = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest("[data-chip]")) setOpenChip(null);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [openChip]);

  // Bloqueo de scroll + Escape para el overlay móvil
  useEffect(() => {
    if (!mobileOpen) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMobileOpen(false);
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = ""; document.removeEventListener("keydown", onKey); };
  }, [mobileOpen]);

  // Deep links: /vacantes?v=<id> abre esa vacante y /vacantes?ciudad=<slug>
  // deja el portal filtrado por esa ciudad (así se comparte «vacantes en
  // Medellín» sin que el otro lado tenga que tocar el filtro).
  //
  // Se lee de window y no con useSearchParams a propósito: useSearchParams
  // exige un <Suspense> alrededor del portal y entonces el HTML estático pasa
  // a ser el fallback, dejando las vacantes fuera del prerender (malo para SEO
  // en un portal de empleo). El costo es un render extra al montar, y solo
  // cuando el parámetro viene en la URL.
  //
  // Corre solo al montar (deps vacías) aunque lea `vacantes`: es la lectura
  // inicial del enlace, no algo que deba repetirse si la lista se revalida.
  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps -- la URL no existe durante el prerender y el deep link se lee una sola vez */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    /* Una ciudad que ya no tiene vacantes publicadas (o mal escrita) devuelve
       null y el portal abre sin filtrar, que es mejor que mostrar cero
       resultados por un enlace viejo. */
    const ciudadUrl = ciudadDesdeParam(params.get("ciudad") ?? "", opciones.ciudades);
    if (ciudadUrl) setCiudad(ciudadUrl);

    const id = (params.get("v") ?? "").trim();
    /* La página se calcula sobre la lista que se va a ver: con ?ciudad= la
       posición en la lista completa no corresponde. Sin esto, un enlace a la
       vacante 30 no mostraría nada. */
    const lista = ciudadUrl ? vacantes.filter((v) => v.ciudad === ciudadUrl) : vacantes;
    const indice = lista.findIndex((v) => v.id === id);
    if (!id || indice === -1) return;
    setSelectedId(id);
    setPagina(Math.floor(indice / POR_PAGINA) + 1);
    // En móvil el detalle vive en un overlay; en desktop basta con bajar a la lista.
    if (window.matchMedia("(max-width: 1023px)").matches) {
      setMobileOpen(true);
    } else {
      requestAnimationFrame(() =>
        listaRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      );
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return vacantes.filter((v) => {
      if (ciudad !== "Todas" && v.ciudad !== ciudad) return false;
      if (sector !== "Todos" && v.sector !== sector) return false;
      if (modalidad !== "Todas" && v.modalidad !== modalidad) return false;
      if (experiencia !== "Todas" && v.experiencia !== experiencia) return false;
      if (contrato !== "Todos" && v.contrato !== contrato) return false;
      if (q && !v.cargo.toLowerCase().includes(q) && !v.sector.toLowerCase().includes(q) && !v.funciones.toLowerCase().includes(q) && !v.ciudad.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [vacantes, query, ciudad, sector, modalidad, experiencia, contrato]);

  const totalPaginas = Math.max(1, Math.ceil(filtered.length / POR_PAGINA));
  // Al filtrar puede desaparecer la página en la que se estaba; se acota en
  // vez de dejar la lista vacía.
  const paginaActual = Math.min(pagina, totalPaginas);
  const visibles = useMemo(
    () => filtered.slice((paginaActual - 1) * POR_PAGINA, paginaActual * POR_PAGINA),
    [filtered, paginaActual]
  );

  // La vacante abierta debe ser una de las que se ven en la lista: si no,
  // los otros dos bloques mostrarían algo que el usuario no tiene enfrente.
  const selected = visibles.find((v) => v.id === selectedId) ?? visibles[0] ?? null;

  const hayFiltros = query !== "" || ciudad !== "Todas" || sector !== "Todos" || modalidad !== "Todas" || experiencia !== "Todas" || contrato !== "Todos";

  /* Cualquier cambio de filtro devuelve a la página 1: quedarse en la 7 con
     tres resultados no tiene sentido. Se hace en los manejadores y no en un
     efecto para no encadenar un render extra. */
  const filtrar = useCallback((aplicar: () => void) => {
    aplicar();
    setPagina(1);
  }, []);

  /* La barra de direcciones refleja lo que vale la pena compartir: la ciudad
     filtrada y la vacante abierta. Copiar la URL ya basta, no hace falta un
     botón aparte.

     Se usa replaceState y no pushState para no llenar el historial: recorrer
     diez vacantes dejaría diez pasos de «atrás» antes de salir de la página.

     Cada clave se toca solo si viene en `cambios`, así cambiar de vacante no
     borra la ciudad ni al revés. */
  const sincronizarUrl = useCallback(
    (cambios: { ciudad?: string; v?: string | null }) => {
      const url = new URL(window.location.href);
      if (cambios.ciudad !== undefined) {
        if (cambios.ciudad === "Todas") url.searchParams.delete("ciudad");
        else url.searchParams.set("ciudad", slugCiudad(cambios.ciudad));
      }
      if (cambios.v !== undefined) {
        if (cambios.v) url.searchParams.set("v", cambios.v);
        else url.searchParams.delete("v");
      }
      window.history.replaceState(null, "", url);
    },
    []
  );

  /* Cambiar de ciudad rearma la lista y con ella la vacante abierta, así que
     el `v` anterior deja de corresponder: se quita para que el enlace quede
     como `/vacantes?ciudad=medellin` y no apunte a una vacante de otra ciudad. */
  const cambiarCiudad = useCallback(
    (c: string) => {
      filtrar(() => setCiudad(c));
      sincronizarUrl({ ciudad: c, v: null });
    },
    [filtrar, sincronizarUrl]
  );

  const limpiar = useCallback(() => {
    filtrar(() => {
      setQuery(""); setCiudad("Todas"); setSector("Todos"); setModalidad("Todas"); setExperiencia("Todas"); setContrato("Todos");
    });
    sincronizarUrl({ ciudad: "Todas", v: null });
  }, [filtrar, sincronizarUrl]);

  const cambiarPagina = (p: number) => {
    setPagina(Math.min(Math.max(1, p), totalPaginas));
    // Volver arriba de la lista: si no, la página nueva empieza a media altura.
    listaRef.current?.querySelector("[data-lista]")?.scrollTo({ top: 0 });
  };

  const selectVacante = (id: string, abrirMovil = false) => {
    setSelectedId(id);

    sincronizarUrl({ v: id });

    if (abrirMovil && window.matchMedia("(max-width: 1023px)").matches) {
      setMobileOpen(true);
      return;
    }
    // Los bloques de la derecha conservan su scroll entre vacantes: si venías
    // de leer las funciones abajo, la siguiente arrancaría por la mitad.
    infoRef.current?.scrollTo({ top: 0 });
    formRef.current?.scrollTo({ top: 0 });
  };

  return (
    <>
      {/* El portal no lleva título visible —la barra de búsqueda ya dice qué es
          esta página—, pero el h1 debe existir para lectores de pantalla y
          para el buscador de Google. */}
      <h1 className="sr-only">Vacantes de empleo en Colombia</h1>

      {/* ---------- Buscador y filtros ----------
          Una sola barra clara pegada bajo el navbar (h-20). Los portales de
          empleo la mantienen a la vista porque buscar y filtrar es la acción
          principal y se repite todo el tiempo. */}
      {/* Fija solo en desktop: en móvil los chips ocupan dos filas y una barra
          fija de ~230px se comería un tercio de la pantalla. */}
      <section className="z-30 border-b border-border bg-white/95 backdrop-blur-md lg:sticky lg:top-20">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-2.5 px-4 py-3 md:px-8 lg:flex-row lg:items-center lg:gap-4">
          {/* Cargo + ciudad, unidos en una sola pastilla en pantallas medianas */}
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-0 sm:rounded-full sm:border sm:border-border sm:bg-surface sm:p-1 sm:transition-colors sm:focus-within:border-brand-blue/60 lg:min-w-[420px] lg:flex-1 lg:max-w-[620px]">
            <div className="flex flex-1 items-center gap-2 rounded-full border border-border bg-surface px-4 py-2.5 sm:border-0 sm:bg-transparent sm:py-1.5">
              <span className="material-symbols-outlined text-[20px] text-text-muted">search</span>
              <input
                type="text" value={query} onChange={(e) => filtrar(() => setQuery(e.target.value))}
                placeholder="Cargo, sector o palabra clave"
                aria-label="Buscar por cargo, sector o palabra clave"
                className="w-full bg-transparent font-[var(--font-body)] text-sm text-text-primary outline-none placeholder:text-text-muted"
              />
              {query && (
                <button
                  type="button" onClick={() => filtrar(() => setQuery(""))} aria-label="Limpiar búsqueda"
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-surface-gray hover:text-brand-navy"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>
            <div className="hidden sm:block h-6 w-px shrink-0 bg-border" />
            <CiudadSelector
              valor={ciudad}
              opciones={opciones.ciudades}
              open={openChip === "ciudad"}
              onToggle={() => setOpenChip(openChip === "ciudad" ? null : "ciudad")}
              onChange={(c) => { cambiarCiudad(c); setOpenChip(null); }}
            />
          </div>

          {/* Los chips envuelven en vez de tener scroll horizontal: un
              contenedor con overflow recortaría sus desplegables. */}
          <div className="flex flex-wrap items-center gap-2">
            {FILTROS.map((f) => (
              <FilterChip
                key={f.key}
                label={f.label}
                value={valores[f.key]}
                opciones={f.opciones}
                open={openChip === f.key}
                onToggle={() => setOpenChip(openChip === f.key ? null : f.key)}
                onChange={(v) => { filtrar(() => setters[f.key](v)); setOpenChip(null); }}
              />
            ))}
            {hayFiltros && (
              <button type="button" onClick={limpiar} className="inline-flex items-center gap-1 font-[var(--font-ui)] text-[13px] font-semibold text-text-muted transition-colors hover:text-brand-blue">
                <span className="material-symbols-outlined text-[16px]">close</span> Limpiar
              </button>
            )}
          </div>

          <p className="font-[var(--font-ui)] text-[13px] text-text-muted lg:ml-auto lg:shrink-0">
            <strong className="text-brand-navy">{filtered.length}</strong>{" "}
            {filtered.length === 1 ? "vacante" : "vacantes"}
          </p>
        </div>
      </section>

      {/* ---------- Tres bloques: lista · info · formulario ----------
          Cada uno se queda fijo en su sitio y desplaza su propio contenido.
          Es lo que hace que la página aguante cien vacantes: la lista puede
          crecer sin arrastrar consigo el detalle ni el formulario. */}
      <section className="bg-surface" ref={listaRef}>
        <div className="mx-auto max-w-[1600px] px-4 py-5 md:px-8 md:py-6">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <span className="material-symbols-outlined mb-3 block text-5xl text-text-muted/30">search_off</span>
              <p className="mb-2 font-[var(--font-display)] text-lg font-bold text-brand-navy">No hay vacantes con esos filtros</p>
              <p className="font-[var(--font-body)] text-sm text-text-secondary">
                Prueba con otros filtros o envía tu hoja de vida a{" "}
                <a href={`mailto:${MARKETING_EMAIL}`} className="text-brand-blue underline">{MARKETING_EMAIL}</a>
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr_2fr] lg:items-start xl:gap-5">
              {/* Lista + paginador. El paginador queda anclado abajo para que
                  no haya que recorrer las 10 tarjetas para cambiar de página. */}
              <div className={`${COLUMNA} flex flex-col overflow-hidden rounded-2xl border border-border bg-white lg:border`}>
                <div data-lista className="flex flex-col gap-2.5 overflow-y-auto p-2.5 lg:flex-1">
                  {visibles.map((v) => (
                    <VacanteItem
                      key={v.id}
                      v={v}
                      active={selected?.id === v.id}
                      onClick={() => selectVacante(v.id, true)}
                    />
                  ))}
                </div>
                <Paginador pagina={paginaActual} total={totalPaginas} onCambiar={cambiarPagina} />
              </div>

              {/* Info de la vacante */}
              <div ref={infoRef} className={`${COLUMNA} hidden overflow-y-auto lg:block`}>
                {selected && <InfoVacante v={selected} />}
              </div>

              {/* Formulario */}
              <div ref={formRef} className={`${COLUMNA} hidden overflow-y-auto lg:block`}>
                {selected && <FormPostulacion key={selected.id} v={selected} />}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ---------- Overlay móvil: info + formulario juntos ---------- */}
      {mobileOpen && selected && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-brand-navy/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out] lg:hidden" onClick={() => setMobileOpen(false)}>
          <div className="flex min-h-full items-start justify-center p-3 pt-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex w-full max-w-lg flex-col gap-3">
              <InfoVacante v={selected} onClose={() => setMobileOpen(false)} />
              <FormPostulacion key={selected.id} v={selected} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

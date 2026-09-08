"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";
import { enviarSolicitud, type ViaEnvio } from "@/lib/solicitud";

/* ---------- Datos ---------- */
const maps = (q: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

/* Comercial (cotizaciones y empresas) y talento (hojas de vida) son buzones
   distintos: el de comercial lo consume la automatización n8n de Paula. */
const COMERCIAL = "comercialbog@asignar.com.co";
const TALENTO = "marketingdigital@asignar.com.co";
const SQR_EMAIL = "sqr@asignar.com.co";
const TEL = "+576043220310";

const sedes = [
  {
    ciudad: "Medellín",
    nota: "Principal",
    dir: "Cra. 48 #10-45, El Poblado",
    q: "Cra. 48 #10-45, El Poblado, Medellín",
  },
  { ciudad: "Rionegro", dir: "Cra. 48 #49-05", q: "Cra. 48 #49-05, Rionegro, Antioquia" },
  { ciudad: "Bogotá", dir: "Cra 19 #44-61", q: "Cra 19 #44-61, Bogotá" },
  { ciudad: "Cali", dir: "Cl. 4 #34-18, El Sindicato", q: "Cl. 4 #34-18, El Sindicato, Cali" },
  {
    ciudad: "Cartagena",
    dir: "Cl. 35 #8B-05, Centro",
    q: "Calle 35 Avenida Venezuela #8B-05, Centro, Cartagena",
  },
  { ciudad: "Barranquilla", dir: "Cobertura Caribe", q: "Asignar SAS, Barranquilla, Colombia" },
  { ciudad: "Santa Marta", dir: "Cobertura Caribe", q: "Asignar SAS, Santa Marta, Colombia" },
  { ciudad: "Pereira", dir: "Eje Cafetero", q: "Asignar SAS, Pereira, Colombia" },
  { ciudad: "Manizales", dir: "Eje Cafetero", q: "Asignar SAS, Manizales, Colombia" },
];

const ciudadesForm = [
  "Medellín",
  "Rionegro",
  "Bogotá",
  "Cali",
  "Barranquilla",
  "Cartagena",
  "Santa Marta",
  "Pereira",
  "Manizales",
  "Otra",
];

const sectores = [
  "Hotelero",
  "Restaurantes",
  "Centros de eventos",
  "Clubes",
  "Industria / Producción",
  "Logística",
  "Retail / Servicios",
  "Otro",
];

/* ---------- Estilos de formulario ---------- */
const labelCls =
  "font-[var(--font-ui)] text-[12.5px] font-semibold text-brand-navy block mb-[7px]";
const inputCls =
  "w-full bg-surface border border-border rounded-xl px-3.5 py-[13px] font-[var(--font-body)] text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-brand-blue transition-colors";

/* ---------- Iconos inline ---------- */
function ArrowRight({ className = "" }: { className?: string }) {
  return (
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
}

export default function ContactoPage() {
  const [audiencia, setAudiencia] = useState<"empresa" | "candidato">("empresa");
  const [enviando, setEnviando] = useState(false);
  const [via, setVia] = useState<ViaEnvio | null>(null);

  /* La solicitud va a `/api/solicitud` → flujo n8n "Comercial - Solicitudes
     web": el cliente recibe el portafolio con el link para agendar y Paula el
     aviso. Si el webhook no responde, `enviarSolicitud` cae al correo. */
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (enviando) return;
    const fd = new FormData(e.currentTarget);
    const dato = (campo: string) => String(fd.get(campo) ?? "").trim();

    setEnviando(true);
    const resultado = await enviarSolicitud({
      origen: "contacto",
      empresa: dato("empresa"),
      nombre: dato("nombre"),
      email: dato("email"),
      telefono: dato("telefono"),
      ciudad: dato("ciudad"),
      servicio: dato("sector"),
      mensaje: dato("mensaje"),
    });

    trackEvent("solicitud_comercial", {
      origen: "contacto_empresa",
      sector: dato("sector"),
      ciudad: dato("ciudad"),
      via: resultado,
    });

    setEnviando(false);
    setVia(resultado);
  }

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="bg-surface py-14 md:py-[72px]">
        <div className="max-w-[1280px] mx-auto px-4 md:px-16 text-center">
          <span className="inline-block font-[var(--font-ui)] text-xs font-semibold uppercase tracking-[1px] text-brand-blue bg-brand-blue/[0.09] rounded-full px-3 py-1.5 mb-5">
            Contacto
          </span>
          <h1 className="font-[var(--font-display)] text-[32px] md:text-[44px] font-extrabold text-brand-navy leading-[1.06] tracking-[-0.8px] max-w-3xl mx-auto">
            ¿En qué te podemos ayudar?
          </h1>
          <p className="font-[var(--font-body)] text-base md:text-lg text-text-secondary leading-relaxed max-w-2xl mx-auto mt-4">
            Cuéntanos si tu empresa necesita personal o si estás buscando
            empleo, y te llevamos por el camino correcto.
          </p>
        </div>
      </section>

      {/* ---------- Selector de audiencia + contenido ---------- */}
      <section className="pb-14 md:pb-20 bg-surface">
        <div className="max-w-[880px] mx-auto px-4 md:px-6">
          {/* Toggle */}
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            <li>
              <button
                type="button"
                onClick={() => setAudiencia("empresa")}
                aria-pressed={audiencia === "empresa"}
                className={`w-full flex items-center gap-3.5 text-left p-5 rounded-2xl border transition-all ${
                  audiencia === "empresa"
                    ? "border-brand-blue bg-white shadow-[0_12px_30px_-16px_rgba(0,18,51,0.25)]"
                    : "border-border bg-white/60 hover:border-brand-blue/40"
                }`}
              >
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
                    audiencia === "empresa"
                      ? "bg-brand-blue text-white"
                      : "bg-brand-blue/10 text-brand-blue"
                  }`}
                >
                  <span className="material-symbols-outlined">apartment</span>
                </span>
                <span>
                  <span className="block font-[var(--font-display)] text-[15px] font-bold text-brand-navy">
                    Necesito personal
                  </span>
                  <span className="block font-[var(--font-body)] text-[13px] text-text-muted">
                    Soy una empresa
                  </span>
                </span>
              </button>
            </li>

            <li>
              <button
                type="button"
                onClick={() => setAudiencia("candidato")}
                aria-pressed={audiencia === "candidato"}
                className={`w-full flex items-center gap-3.5 text-left p-5 rounded-2xl border transition-all ${
                  audiencia === "candidato"
                    ? "border-brand-blue bg-white shadow-[0_12px_30px_-16px_rgba(0,18,51,0.25)]"
                    : "border-border bg-white/60 hover:border-brand-blue/40"
                }`}
              >
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
                    audiencia === "candidato"
                      ? "bg-brand-blue text-white"
                      : "bg-brand-blue/10 text-brand-blue"
                  }`}
                >
                  <span className="material-symbols-outlined">badge</span>
                </span>
                <span>
                  <span className="block font-[var(--font-display)] text-[15px] font-bold text-brand-navy">
                    Busco empleo
                  </span>
                  <span className="block font-[var(--font-body)] text-[13px] text-text-muted">
                    Soy candidato
                  </span>
                </span>
              </button>
            </li>
          </ul>

          {/* --- EMPRESA: formulario dominante --- */}
          {audiencia === "empresa" &&
            (via ? (
              <div className="bg-white border border-border rounded-3xl p-10 text-center shadow-[0_24px_56px_-20px_rgba(0,18,51,0.12)]">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-blue/10">
                  <span className="material-symbols-outlined text-brand-blue text-3xl">
                    mark_email_read
                  </span>
                </div>
                <h2 className="font-[var(--font-display)] text-2xl font-bold text-brand-navy mb-2">
                  {via === "api" ? "Recibimos tu solicitud" : "Tu solicitud está lista para enviar"}
                </h2>
                <p className="font-[var(--font-body)] text-sm text-text-secondary max-w-md mx-auto mb-6">
                  {via === "api"
                    ? "Te acabamos de enviar el portafolio a tu correo, con un enlace para agendar una llamada cuando te quede cómodo. Un asesor comercial te contacta en las próximas 24 horas hábiles."
                    : "Abrimos tu correo con la solicitud diligenciada. Al enviarlo, un asesor comercial te contactará en las próximas 24 horas hábiles."}
                </p>
                <button
                  type="button"
                  onClick={() => setVia(null)}
                  className="inline-flex items-center justify-center gap-2 border-[1.5px] border-border font-[var(--font-ui)] text-sm font-semibold text-brand-navy px-6 py-3 rounded-full hover:bg-surface transition-colors"
                >
                  Enviar otra solicitud
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="bg-white border border-border rounded-3xl p-6 md:p-8 shadow-[0_24px_56px_-20px_rgba(0,18,51,0.12)]"
              >
                <h2 className="font-[var(--font-display)] text-xl font-extrabold text-brand-navy mb-1">
                  Solicita tu propuesta
                </h2>
                <p className="font-[var(--font-body)] text-sm text-text-muted mb-6">
                  Sin compromiso · respuesta en menos de 24 h hábiles.
                </p>

                <div className="flex flex-col gap-[18px]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="nombre" className={labelCls}>
                        Nombre completo <span className="text-red-500">*</span>
                      </label>
                      <input id="nombre" name="nombre" type="text" required placeholder="Tu nombre" className={inputCls} />
                    </div>
                    <div>
                      <label htmlFor="empresa" className={labelCls}>
                        Empresa <span className="text-red-500">*</span>
                      </label>
                      <input id="empresa" name="empresa" type="text" required placeholder="Nombre de tu empresa" className={inputCls} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="email" className={labelCls}>
                        Correo corporativo <span className="text-red-500">*</span>
                      </label>
                      <input id="email" name="email" type="email" required placeholder="correo@empresa.com" className={inputCls} />
                    </div>
                    <div>
                      <label htmlFor="telefono" className={labelCls}>
                        Teléfono <span className="text-red-500">*</span>
                      </label>
                      <input id="telefono" name="telefono" type="tel" required placeholder="300 000 0000" className={inputCls} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="ciudad" className={labelCls}>
                        Ciudad
                      </label>
                      <select id="ciudad" name="ciudad" defaultValue="Medellín" className={`${inputCls} appearance-none`}>
                        {ciudadesForm.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="sector" className={labelCls}>
                        Sector
                      </label>
                      <select id="sector" name="sector" defaultValue="Hotelero" className={`${inputCls} appearance-none`}>
                        {sectores.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="mensaje" className={labelCls}>
                      ¿Qué necesitas?
                    </label>
                    <textarea
                      id="mensaje"
                      name="mensaje"
                      rows={4}
                      placeholder="Ej. 15 meseros para eventos de fin de año, turnos rotativos…"
                      className={`${inputCls} resize-none`}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={enviando}
                    className="w-full inline-flex items-center justify-center gap-2 bg-brand-blue text-white font-[var(--font-ui)] text-[15px] font-semibold py-[15px] rounded-full shadow-[0_8px_20px_-6px_rgba(0,122,254,0.35)] transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-70 disabled:hover:translate-y-0"
                  >
                    {enviando ? "Enviando…" : "Enviar solicitud"}
                    {!enviando && <ArrowRight className="w-4 h-4" />}
                  </button>
                  <p className="font-[var(--font-body)] text-xs text-text-muted text-center">
                    Tus datos están protegidos (Ley 1581 de 2012).
                  </p>
                </div>
              </form>
            ))}

          {/* --- CANDIDATO: rutas claras (no formulario largo) --- */}
          {audiencia === "candidato" && (
            <div className="bg-white border border-border rounded-3xl p-6 md:p-8 shadow-[0_24px_56px_-20px_rgba(0,18,51,0.12)]">
              <h2 className="font-[var(--font-display)] text-xl font-extrabold text-brand-navy mb-1">
                Encuentra tu próximo empleo
              </h2>
              <p className="font-[var(--font-body)] text-sm text-text-muted mb-6">
                Estos son los caminos más rápidos para postularte con nosotros.
              </p>

              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <li>
                  <Link
                    href="/vacantes"
                    className="group flex items-center gap-3.5 p-5 rounded-2xl border border-border hover:border-brand-blue/40 hover:bg-surface transition-all"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-colors">
                      <span className="material-symbols-outlined">work</span>
                    </span>
                    <span className="flex-1">
                      <span className="block font-[var(--font-display)] text-[15px] font-bold text-brand-navy">
                        Ver vacantes
                      </span>
                      <span className="block font-[var(--font-body)] text-[13px] text-text-muted">
                        Ofertas activas por ciudad
                      </span>
                    </span>
                    <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-brand-blue group-hover:translate-x-0.5 transition-all" />
                  </Link>
                </li>

                <li>
                  <a
                    href={`mailto:${TALENTO}?subject=${encodeURIComponent(
                      "Hoja de vida — Postulación"
                    )}`}
                    className="group flex items-center gap-3.5 p-5 rounded-2xl border border-border hover:border-brand-blue/40 hover:bg-surface transition-all"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-colors">
                      <span className="material-symbols-outlined">mail</span>
                    </span>
                    <span className="flex-1">
                      <span className="block font-[var(--font-display)] text-[15px] font-bold text-brand-navy">
                        Envía tu hoja de vida
                      </span>
                      <span className="block font-[var(--font-body)] text-[13px] text-text-muted">
                        A nuestro equipo de selección
                      </span>
                    </span>
                    <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-brand-blue group-hover:translate-x-0.5 transition-all" />
                  </a>
                </li>

                <li>
                  <a
                    href="https://www.asignar.com.co/_admin/usuario.php"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3.5 p-5 rounded-2xl border border-border hover:border-brand-blue/40 hover:bg-surface transition-all"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-colors">
                      <span className="material-symbols-outlined">lock_open</span>
                    </span>
                    <span className="flex-1">
                      <span className="block font-[var(--font-display)] text-[15px] font-bold text-brand-navy">
                        Ingreso empleados
                      </span>
                      <span className="block font-[var(--font-body)] text-[13px] text-text-muted">
                        Contrato, colilla y asistencia
                      </span>
                    </span>
                    <span className="material-symbols-outlined text-text-muted text-base group-hover:text-brand-blue transition-colors">
                      open_in_new
                    </span>
                  </a>
                </li>

                <li>
                  <Link
                    href="/faq"
                    className="group flex items-center gap-3.5 p-5 rounded-2xl border border-border hover:border-brand-blue/40 hover:bg-surface transition-all"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-colors">
                      <span className="material-symbols-outlined">edit_note</span>
                    </span>
                    <span className="flex-1">
                      <span className="block font-[var(--font-display)] text-[15px] font-bold text-brand-navy">
                        Radicar SQR
                      </span>
                      <span className="block font-[var(--font-body)] text-[13px] text-text-muted">
                        Solicitud, queja o reclamo
                      </span>
                    </span>
                    <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-brand-blue group-hover:translate-x-0.5 transition-all" />
                  </Link>
                </li>
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* ---------- Contacto directo (franja) ---------- */}
      <section aria-labelledby="contacto-directo-heading" className="py-10 md:py-12 bg-white border-y border-border">
        <div className="max-w-[1280px] mx-auto px-4 md:px-16">
          <h2 id="contacto-directo-heading" className="sr-only">
            Contacto directo
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <li>
              <a href={`tel:${TEL}`} className="group flex items-center justify-center gap-3 text-left">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue">
                  <span className="material-symbols-outlined">call</span>
                </span>
                <span>
                  <span className="block font-[var(--font-ui)] text-[13px] font-semibold text-brand-navy">
                    Línea nacional
                  </span>
                  <span className="font-[var(--font-body)] text-sm text-text-secondary group-hover:text-brand-blue transition-colors">
                    (57) 604 322 0310
                  </span>
                </span>
              </a>
            </li>
            <li>
              <a href={`mailto:${COMERCIAL}`} className="group flex items-center justify-center gap-3 text-left">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue">
                  <span className="material-symbols-outlined">mail</span>
                </span>
                <span>
                  <span className="block font-[var(--font-ui)] text-[13px] font-semibold text-brand-navy">
                    Correo comercial
                  </span>
                  <span className="font-[var(--font-body)] text-sm text-text-secondary group-hover:text-brand-blue transition-colors break-all">
                    {COMERCIAL}
                  </span>
                </span>
              </a>
            </li>
            <li>
              <a href={`mailto:${SQR_EMAIL}`} className="group flex items-center justify-center gap-3 text-left">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue">
                  <span className="material-symbols-outlined">shield</span>
                </span>
                <span>
                  <span className="block font-[var(--font-ui)] text-[13px] font-semibold text-brand-navy">
                    Línea ética (SQR)
                  </span>
                  <span className="font-[var(--font-body)] text-sm text-text-secondary group-hover:text-brand-blue transition-colors break-all">
                    {SQR_EMAIL}
                  </span>
                </span>
              </a>
            </li>
          </ul>
        </div>
      </section>

      {/* ---------- Sedes (sección propia) ---------- */}
      <section className="py-14 md:py-20 bg-surface">
        <div className="max-w-[1280px] mx-auto px-4 md:px-16">
          <div className="mb-9 text-center lg:text-left">
            <span className="font-[var(--font-ui)] text-xs font-semibold uppercase tracking-[0.1em] text-brand-blue mb-3 block">
              Cobertura nacional
            </span>
            <h2 className="font-[var(--font-display)] text-3xl md:text-4xl font-extrabold text-brand-navy tracking-[-0.02em]">
              Estamos en 9 ciudades
            </h2>
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sedes.map((s) => (
              <li key={s.ciudad}>
                <a
                  href={maps(s.q)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-3.5 bg-white border border-border rounded-2xl p-5 hover:border-brand-blue/40 hover:shadow-[0_12px_30px_-18px_rgba(0,18,51,0.25)] transition-all"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-xl">location_on</span>
                  </span>
                  <span className="flex-1">
                    <span className="flex items-center gap-2">
                      <h3 className="font-[var(--font-display)] text-base font-bold text-brand-navy">
                        {s.ciudad}
                      </h3>
                      {s.nota && (
                        <span className="rounded-full bg-brand-blue/10 px-2 py-0.5 font-[var(--font-ui)] text-[10px] font-semibold uppercase tracking-wide text-brand-blue">
                          {s.nota}
                        </span>
                      )}
                    </span>
                    <span className="block font-[var(--font-body)] text-[13px] text-text-muted mt-0.5">
                      {s.dir}
                    </span>
                  </span>
                  <span className="material-symbols-outlined text-text-muted text-base group-hover:text-brand-blue transition-colors">
                    arrow_outward
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}

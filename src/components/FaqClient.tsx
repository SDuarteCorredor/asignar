"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { trackEvent } from "@/lib/analytics";
import RespuestaFaq from "@/components/faq/RespuestaFaq";
import ResumenSqr from "@/components/faq/ResumenSqr";
import {
  CATEGORIAS_FAQ,
  PREGUNTAS,
  SLUG_A_CATEGORIA,
  textoBuscable,
} from "@/components/faq/preguntas";
import {
  SQR_EMAIL,
  SQR_PLAZO,
  SQR_TELEFONO,
  SQR_TELEFONO_HREF,
} from "@/components/faq/contacto";
import {
  radicarSqr,
  consultarSqr,
  type ResultadoRadicacion,
  type ResultadoConsulta,
} from "@/lib/sqr";

// Las preguntas viven en @/components/faq/preguntas para que el schema
// JSON-LD del server component y este acordeón lean la misma fuente.
const categorias = ["Todas", ...CATEGORIAS_FAQ];


// Tipos de SQR (Solicitud, Queja, Reclamo + Sugerencia/Felicitación)
const tiposSQR = [
  { valor: "Petición", desc: "Solicitud de información o de una gestión." },
  { valor: "Queja", desc: "Inconformidad con la atención o el servicio." },
  { valor: "Reclamo", desc: "Exigencia por una falla o incumplimiento." },
  { valor: "Sugerencia", desc: "Propuesta para mejorar nuestro servicio." },
  { valor: "Felicitación", desc: "Reconocimiento a una buena experiencia." },
];

const tiposDocumento = ["CC", "CE", "PPT", "Pasaporte", "NIT"];

const sedesSQR = [
  "Medellín",
  "Rionegro",
  "Bogotá",
  "Cali",
  "Barranquilla",
  "Cartagena",
  "Santa Marta",
  "Pereira",
  "Manizales",
  "Otra / No aplica",
];

const vinculos = [
  "Trabajador en misión",
  "Empresa cliente",
  "Aspirante / candidato",
  "Proveedor",
  "Otro",
];

/* ---------- Estilos reutilizables de formulario ---------- */
const labelCls =
  "font-[var(--font-ui)] text-[12.5px] font-semibold text-brand-navy block mb-[7px]";
const baseInput =
  "w-full bg-surface border rounded-xl px-3.5 py-[13px] font-[var(--font-body)] text-sm text-text-primary placeholder:text-text-muted outline-none transition-colors";
const inputCls = (err?: boolean) =>
  `${baseInput} ${err ? "border-red-400 focus:border-red-500" : "border-border focus:border-brand-blue"}`;
const errorCls = "mt-1 font-[var(--font-ui)] text-[11px] text-red-500";

type FormState = {
  tipo: string;
  nombre: string;
  tipoDoc: string;
  documento: string;
  email: string;
  telefono: string;
  sede: string;
  vinculo: string;
  asunto: string;
  mensaje: string;
  consent: boolean;
};

const emptyForm: FormState = {
  tipo: "Petición",
  nombre: "",
  tipoDoc: "CC",
  documento: "",
  email: "",
  telefono: "",
  sede: "Medellín",
  vinculo: "Trabajador en misión",
  asunto: "",
  mensaje: "",
  consent: false,
};

export default function FaqClient() {
  /* ---------- Estado del formulario SQR ---------- */
  const [modo, setModo] = useState<"radicar" | "seguimiento">("radicar");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errores, setErrores] = useState<Partial<Record<keyof FormState, string>>>({});
  const [enviando, setEnviando] = useState(false);
  const [radicacion, setRadicacion] = useState<ResultadoRadicacion | null>(null);

  // Seguimiento
  const [radicado, setRadicado] = useState("");
  const [docSeguimiento, setDocSeguimiento] = useState("");
  const [consultando, setConsultando] = useState(false);
  const [consulta, setConsulta] = useState<ResultadoConsulta | null>(null);

  /* ---------- Estado de las preguntas frecuentes ---------- */
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("Todas");
  const [openId, setOpenId] = useState<number | null>(null);
  const contenidoRef = useRef<HTMLElement>(null);

  // Si llegamos con un hash (#nomina, #sst…), preselecciona la categoría
  // y baja hasta el listado de preguntas.
  useEffect(() => {
    const aplicarHash = () => {
      const slug = window.location.hash.replace("#", "");
      const categoria = SLUG_A_CATEGORIA[slug];
      if (!categoria) return;
      setCat(categoria);
      requestAnimationFrame(() =>
        contenidoRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      );
    };
    aplicarHash();
    window.addEventListener("hashchange", aplicarHash);
    return () => window.removeEventListener("hashchange", aplicarHash);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PREGUNTAS.map((f, i) => ({ ...f, id: i, buscable: textoBuscable(f) }))
      .filter((f) => cat === "Todas" || f.cat === cat)
      .filter((f) => !q || f.buscable.includes(q));
  }, [query, cat]);

  /* ---------- Handlers del formulario ---------- */
  const setCampo = (campo: keyof FormState, valor: string | boolean) => {
    setForm((f) => ({ ...f, [campo]: valor }));
    setErrores((e) => ({ ...e, [campo]: undefined }));
  };

  const validar = (): boolean => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.nombre.trim()) e.nombre = "Ingresa tu nombre completo.";
    if (!form.documento.trim()) e.documento = "Ingresa tu número de documento.";
    if (!form.email.trim()) e.email = "Ingresa tu correo.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Correo no válido.";
    if (!form.telefono.trim()) e.telefono = "Ingresa tu teléfono.";
    if (!form.asunto.trim()) e.asunto = "Escribe un asunto.";
    if (!form.mensaje.trim()) e.mensaje = "Describe tu solicitud.";
    if (!form.consent) e.consent = "Debes autorizar el tratamiento de datos.";
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  /* Radica en el sistema de SQR y muestra el número que devuelve. Si ese
     sistema no está configurado o no responde, `radicarSqr` abre el correo
     con la SQR diligenciada y la pantalla de éxito lo dice. */
  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validar() || enviando) return;

    setEnviando(true);
    const resultado = await radicarSqr({
      tipo: form.tipo,
      nombre: form.nombre,
      tipoDocumento: form.tipoDoc,
      documento: form.documento,
      email: form.email,
      telefono: form.telefono,
      sede: form.sede,
      vinculo: form.vinculo,
      asunto: form.asunto,
      mensaje: form.mensaje,
    });

    trackEvent("sqr_radicada", {
      tipo: form.tipo,
      sede: form.sede,
      vinculo: form.vinculo,
      via: resultado.via,
    });

    setEnviando(false);
    setRadicacion(resultado);
  };

  const handleSeguimiento = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!radicado.trim() || !docSeguimiento.trim() || consultando) return;

    setConsultando(true);
    setConsulta(null);
    const resultado = await consultarSqr(radicado.trim(), docSeguimiento.trim());
    trackEvent("sqr_seguimiento", { via: resultado.via });
    setConsultando(false);
    setConsulta(resultado);
  };

  const resetForm = () => {
    setForm(emptyForm);
    setErrores({});
    setRadicacion(null);
  };

  return (
    <>
      {/* ---------- Hero (claro) ---------- */}
      <section className="bg-surface py-14 md:py-[72px]">
        <div className="max-w-[1280px] mx-auto px-4 md:px-16 text-center">
          <span className="inline-block font-[var(--font-ui)] text-xs font-semibold uppercase tracking-[1px] text-brand-blue bg-brand-blue/[0.09] rounded-full px-3 py-1.5 mb-5">
            Atención al usuario
          </span>
          <h1 className="font-[var(--font-display)] text-[32px] md:text-[44px] font-extrabold text-brand-navy leading-[1.06] tracking-[-0.8px] max-w-3xl mx-auto">
            Radica y haz seguimiento a tu{" "}
            <span className="text-brand-blue">SQR</span>
          </h1>
          <p className="font-[var(--font-body)] text-base md:text-lg text-text-secondary leading-relaxed max-w-2xl mx-auto mt-4">
            Solicitudes, quejas, reclamos, sugerencias y felicitaciones.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white border border-border px-4 py-2">
            <span className="material-symbols-outlined text-brand-blue text-[18px]">
              schedule
            </span>
            <span className="font-[var(--font-ui)] text-[13px] font-semibold text-brand-navy">
              Respondemos en máximo 15 días hábiles · de forma confidencial
            </span>
          </div>

          {/* Resumen en corto — lo esencial antes del formulario */}
          <ResumenSqr />
        </div>
      </section>

      {/* ---------- Formulario SQR ---------- */}
      <section className="pb-14 md:pb-[72px] bg-surface">
        <div className="max-w-[1280px] mx-auto px-4 md:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(0,500px)] gap-8 lg:gap-14 items-start">
            {/* Izquierda — contexto */}
            <div className="lg:pt-2">
              <h2 className="font-[var(--font-display)] text-2xl font-extrabold text-brand-navy mb-5">
                ¿Qué puedes radicar?
              </h2>
              <ul className="flex flex-col gap-3 mb-9">
                {tiposSQR.map((t) => (
                  <li key={t.valor} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-blue/10">
                      <span className="material-symbols-outlined text-brand-blue text-[15px]">
                        check
                      </span>
                    </span>
                    <span>
                      <span className="font-[var(--font-ui)] text-sm font-semibold text-brand-navy">
                        {t.valor}.
                      </span>{" "}
                      <span className="font-[var(--font-body)] text-sm text-text-secondary">
                        {t.desc}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>

              {/* Canales de atención */}
              <div className="rounded-2xl border border-border bg-white p-5">
                <h3 className="font-[var(--font-ui)] text-[11px] font-semibold uppercase tracking-[0.1em] text-text-muted mb-3">
                  Otros canales
                </h3>
                <div className="flex flex-col gap-3">
                  <a
                    href={`mailto:${SQR_EMAIL}`}
                    className="group flex items-center gap-3"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue">
                      <span className="material-symbols-outlined text-lg">
                        mail
                      </span>
                    </span>
                    <span className="font-[var(--font-body)] text-sm text-text-secondary group-hover:text-brand-blue transition-colors">
                      {SQR_EMAIL}
                    </span>
                  </a>
                  <a href={SQR_TELEFONO_HREF} className="group flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue">
                      <span className="material-symbols-outlined text-lg">
                        call
                      </span>
                    </span>
                    <span className="font-[var(--font-body)] text-sm text-text-secondary group-hover:text-brand-blue transition-colors">
                      {SQR_TELEFONO}
                    </span>
                  </a>
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue">
                      <span className="material-symbols-outlined text-lg">
                        shield
                      </span>
                    </span>
                    <span className="font-[var(--font-body)] text-sm text-text-secondary">
                      Tus datos se tratan de forma confidencial (Ley 1581 de
                      2012).
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Derecha — tarjeta con formulario */}
            <div className="w-full bg-white border border-border rounded-3xl p-6 md:p-8 shadow-[0_24px_56px_-20px_rgba(0,18,51,0.12)]">
              <h2 className="sr-only">
                Radicar una SQR o consultar el estado de tu radicado
              </h2>

              {/* Tabs */}
              <div className="flex gap-1 p-1 bg-surface-gray rounded-full mb-6">
                {(
                  [
                    ["radicar", "Radicar SQR"],
                    ["seguimiento", "Hacer seguimiento"],
                  ] as const
                ).map(([valor, texto]) => (
                  <button
                    key={valor}
                    type="button"
                    onClick={() => setModo(valor)}
                    className={`flex-1 font-[var(--font-ui)] text-[13.5px] font-semibold py-2.5 rounded-full transition-colors ${
                      modo === valor
                        ? "bg-white text-brand-blue shadow-sm"
                        : "text-text-muted hover:text-brand-navy"
                    }`}
                  >
                    {texto}
                  </button>
                ))}
              </div>

              {/* --- Radicar --- */}
              {modo === "radicar" &&
                (radicacion ? (
                  <div className="text-center py-6">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-blue/10">
                      <span className="material-symbols-outlined text-brand-blue text-3xl">
                        {radicacion.via === "api" ? "task_alt" : "mark_email_read"}
                      </span>
                    </div>
                    <h3 className="font-[var(--font-display)] text-xl font-bold text-brand-navy mb-2">
                      {radicacion.via === "api"
                        ? "Tu SQR quedó radicada"
                        : "Tu solicitud está lista para enviar"}
                    </h3>
                    {radicacion.via === "api" && (
                      <div className="mx-auto mb-4 max-w-sm rounded-2xl border border-border bg-surface px-5 py-4">
                        <p className="font-[var(--font-ui)] text-[11px] font-semibold uppercase tracking-[0.1em] text-text-muted">
                          Número de radicado
                        </p>
                        <p className="mt-1 font-[var(--font-display)] text-xl font-extrabold tracking-[-0.01em] text-brand-navy">
                          {radicacion.radicado}
                        </p>
                        <p className="mt-2 font-[var(--font-body)] text-[12.5px] text-text-muted">
                          Guárdalo: con él y tu documento consultas el estado en
                          «Hacer seguimiento».
                        </p>
                      </div>
                    )}
                    <p className="font-[var(--font-body)] text-sm text-text-secondary max-w-sm mx-auto mb-6">
                      {radicacion.via === "api"
                        ? `Respondemos en un máximo de ${SQR_PLAZO} al correo ${form.email}. Si necesitas ampliar la información, escríbenos citando tu radicado.`
                        : "Abrimos tu correo con la SQR diligenciada. Al enviarlo, nuestro equipo te asignará un número de radicado y responderá en un máximo de 15 días hábiles."}
                    </p>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="inline-flex items-center justify-center gap-2 border-[1.5px] border-border font-[var(--font-ui)] text-sm font-semibold text-brand-navy px-6 py-3 rounded-full hover:bg-surface transition-colors"
                    >
                      Radicar otra solicitud
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-[18px]" noValidate>
                    {/* Tipo */}
                    <div>
                      <label htmlFor="sqr-tipo" className={labelCls}>
                        Tipo de solicitud
                      </label>
                      <select
                        id="sqr-tipo"
                        value={form.tipo}
                        onChange={(e) => setCampo("tipo", e.target.value)}
                        className={`${inputCls()} appearance-none`}
                      >
                        {tiposSQR.map((t) => (
                          <option key={t.valor} value={t.valor}>
                            {t.valor}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Nombre */}
                    <div>
                      <label htmlFor="sqr-nombre" className={labelCls}>
                        Nombres y apellidos <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="sqr-nombre"
                        type="text"
                        value={form.nombre}
                        onChange={(e) => setCampo("nombre", e.target.value)}
                        aria-invalid={!!errores.nombre}
                        placeholder="Tu nombre completo"
                        className={inputCls(!!errores.nombre)}
                      />
                      {errores.nombre && <p className={errorCls}>{errores.nombre}</p>}
                    </div>

                    {/* Documento */}
                    <div className="grid grid-cols-[110px_1fr] gap-3">
                      <div>
                        <label htmlFor="sqr-tipodoc" className={labelCls}>
                          Tipo
                        </label>
                        <select
                          id="sqr-tipodoc"
                          value={form.tipoDoc}
                          onChange={(e) => setCampo("tipoDoc", e.target.value)}
                          className={`${inputCls()} appearance-none`}
                        >
                          {tiposDocumento.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="sqr-doc" className={labelCls}>
                          Número de documento <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="sqr-doc"
                          type="text"
                          inputMode="numeric"
                          value={form.documento}
                          onChange={(e) => setCampo("documento", e.target.value)}
                          aria-invalid={!!errores.documento}
                          placeholder="Sin puntos ni comas"
                          className={inputCls(!!errores.documento)}
                        />
                        {errores.documento && (
                          <p className={errorCls}>{errores.documento}</p>
                        )}
                      </div>
                    </div>

                    {/* Correo + Teléfono */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="sqr-email" className={labelCls}>
                          Correo electrónico <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="sqr-email"
                          type="email"
                          value={form.email}
                          onChange={(e) => setCampo("email", e.target.value)}
                          aria-invalid={!!errores.email}
                          placeholder="tucorreo@ejemplo.com"
                          className={inputCls(!!errores.email)}
                        />
                        {errores.email && <p className={errorCls}>{errores.email}</p>}
                      </div>
                      <div>
                        <label htmlFor="sqr-tel" className={labelCls}>
                          Teléfono <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="sqr-tel"
                          type="tel"
                          inputMode="tel"
                          value={form.telefono}
                          onChange={(e) => setCampo("telefono", e.target.value)}
                          aria-invalid={!!errores.telefono}
                          placeholder="300 000 0000"
                          className={inputCls(!!errores.telefono)}
                        />
                        {errores.telefono && (
                          <p className={errorCls}>{errores.telefono}</p>
                        )}
                      </div>
                    </div>

                    {/* Sede + Vínculo */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="sqr-sede" className={labelCls}>
                          Ciudad / sede
                        </label>
                        <select
                          id="sqr-sede"
                          value={form.sede}
                          onChange={(e) => setCampo("sede", e.target.value)}
                          className={`${inputCls()} appearance-none`}
                        >
                          {sedesSQR.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="sqr-vinculo" className={labelCls}>
                          ¿Cómo te relacionas con Asignar?
                        </label>
                        <select
                          id="sqr-vinculo"
                          value={form.vinculo}
                          onChange={(e) => setCampo("vinculo", e.target.value)}
                          className={`${inputCls()} appearance-none`}
                        >
                          {vinculos.map((v) => (
                            <option key={v} value={v}>
                              {v}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Asunto */}
                    <div>
                      <label htmlFor="sqr-asunto" className={labelCls}>
                        Asunto <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="sqr-asunto"
                        type="text"
                        value={form.asunto}
                        onChange={(e) => setCampo("asunto", e.target.value)}
                        aria-invalid={!!errores.asunto}
                        placeholder="Resume tu solicitud en una frase"
                        className={inputCls(!!errores.asunto)}
                      />
                      {errores.asunto && <p className={errorCls}>{errores.asunto}</p>}
                    </div>

                    {/* Mensaje */}
                    <div>
                      <label htmlFor="sqr-msg" className={labelCls}>
                        Descripción <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="sqr-msg"
                        rows={4}
                        value={form.mensaje}
                        onChange={(e) => setCampo("mensaje", e.target.value)}
                        aria-invalid={!!errores.mensaje}
                        placeholder="Cuéntanos con el mayor detalle posible: fechas, sede, empresa cliente, personas involucradas…"
                        className={`${inputCls(!!errores.mensaje)} resize-none`}
                      />
                      {errores.mensaje && <p className={errorCls}>{errores.mensaje}</p>}
                    </div>

                    {/* Consentimiento */}
                    <div>
                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.consent}
                          onChange={(e) => setCampo("consent", e.target.checked)}
                          aria-invalid={!!errores.consent}
                          className="mt-0.5 h-4 w-4 shrink-0 accent-brand-blue"
                        />
                        <span className="font-[var(--font-body)] text-[12.5px] text-text-secondary leading-snug">
                          Autorizo el tratamiento de mis datos personales conforme
                          a la{" "}
                          <a
                            href="https://www.asignar.com.co/build/img/Politica_Tratamiento_Datos_Personales.pdf"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-blue underline"
                          >
                            política de datos
                          </a>{" "}
                          (Ley 1581 de 2012).
                        </span>
                      </label>
                      {errores.consent && <p className={errorCls}>{errores.consent}</p>}
                    </div>

                    <button
                      type="submit"
                      disabled={enviando}
                      className="w-full inline-flex items-center justify-center gap-2 bg-brand-blue text-white font-[var(--font-ui)] text-[15px] font-semibold py-[15px] rounded-full shadow-[0_8px_20px_-6px_rgba(0,122,254,0.35)] transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-70 disabled:hover:translate-y-0"
                    >
                      {enviando ? "Radicando…" : "Radicar solicitud"}
                      {!enviando && (
                        <span className="material-symbols-outlined text-lg">send</span>
                      )}
                    </button>
                  </form>
                ))}

              {/* --- Seguimiento --- */}
              {modo === "seguimiento" && (
                <form onSubmit={handleSeguimiento} className="flex flex-col gap-[18px]">
                  <p className="font-[var(--font-body)] text-sm text-text-secondary">
                    Ingresa el número de radicado que recibiste y tu documento
                    para consultar el estado de tu SQR.
                  </p>
                  <div>
                    <label htmlFor="seg-radicado" className={labelCls}>
                      Número de radicado
                    </label>
                    <input
                      id="seg-radicado"
                      type="text"
                      value={radicado}
                      onChange={(e) => setRadicado(e.target.value)}
                      placeholder="Ej. SQR-2026-00123"
                      className={inputCls()}
                    />
                  </div>
                  <div>
                    <label htmlFor="seg-doc" className={labelCls}>
                      Número de documento
                    </label>
                    <input
                      id="seg-doc"
                      type="text"
                      inputMode="numeric"
                      value={docSeguimiento}
                      onChange={(e) => setDocSeguimiento(e.target.value)}
                      placeholder="Sin puntos ni comas"
                      className={inputCls()}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={consultando}
                    className="w-full inline-flex items-center justify-center gap-2 bg-brand-blue text-white font-[var(--font-ui)] text-[15px] font-semibold py-[15px] rounded-full shadow-[0_8px_20px_-6px_rgba(0,122,254,0.35)] transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-70 disabled:hover:translate-y-0"
                  >
                    {consultando ? "Consultando…" : "Consultar estado"}
                    {!consultando && (
                      <span className="material-symbols-outlined text-lg">search</span>
                    )}
                  </button>

                  {/* Resultado de la consulta. Solo aparece cuando el sistema
                      de SQR contestó: si tocó caer al correo, la persona ya
                      salió hacia su bandeja y no hay nada que mostrar. */}
                  {consulta?.via === "api" && (
                    consulta.encontrado ? (
                      <div className="rounded-2xl border border-border bg-surface p-5">
                        <p className="font-[var(--font-ui)] text-[11px] font-semibold uppercase tracking-[0.1em] text-text-muted">
                          Radicado {radicado.trim()}
                        </p>
                        <p className="mt-1.5 font-[var(--font-display)] text-lg font-extrabold text-brand-navy">
                          {consulta.estado}
                        </p>
                        <dl className="mt-3 flex flex-col gap-1.5">
                          {consulta.tipo && (
                            <div className="flex gap-2 font-[var(--font-body)] text-[13px]">
                              <dt className="text-text-muted">Tipo:</dt>
                              <dd className="text-text-secondary">{consulta.tipo}</dd>
                            </div>
                          )}
                          {consulta.fecha && (
                            <div className="flex gap-2 font-[var(--font-body)] text-[13px]">
                              <dt className="text-text-muted">Radicada:</dt>
                              <dd className="text-text-secondary">{consulta.fecha}</dd>
                            </div>
                          )}
                        </dl>
                        {consulta.respuesta && (
                          <p className="mt-3 border-t border-border pt-3 font-[var(--font-body)] text-[13px] leading-relaxed text-text-secondary">
                            {consulta.respuesta}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-border bg-surface p-5">
                        <p className="font-[var(--font-body)] text-sm text-text-secondary">
                          No encontramos una SQR con ese radicado y ese
                          documento. Revisa que ambos estén como en el correo de
                          confirmación, o escríbenos a{" "}
                          <a href={`mailto:${SQR_EMAIL}`} className="text-brand-blue font-medium">
                            {SQR_EMAIL}
                          </a>
                          .
                        </p>
                      </div>
                    )
                  )}
                  <p className="font-[var(--font-body)] text-xs text-text-muted text-center">
                    ¿Aún no tienes radicado?{" "}
                    <button
                      type="button"
                      onClick={() => setModo("radicar")}
                      className="text-brand-blue font-semibold"
                    >
                      Radica tu SQR
                    </button>
                    .
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Preguntas frecuentes (dropdowns, abajo) ---------- */}
      <section
        ref={contenidoRef}
        className="scroll-mt-24 py-14 md:py-20 bg-white"
      >
        <div className="max-w-[860px] mx-auto px-4 md:px-6">
          <div className="text-center mb-9">
            <span className="font-[var(--font-ui)] text-xs font-semibold uppercase tracking-[0.1em] text-brand-blue mb-3 block">
              Antes de radicar
            </span>
            <h2 className="font-[var(--font-display)] text-3xl md:text-4xl font-extrabold text-brand-navy tracking-[-0.02em]">
              Preguntas frecuentes
            </h2>
            <p className="font-[var(--font-body)] text-sm text-text-secondary mt-3 max-w-lg mx-auto">
              Muchas dudas del trabajador misional ya tienen respuesta aquí.
              Busca la tuya antes de radicar una solicitud.
            </p>
          </div>

          {/* Buscador */}
          <div className="relative mb-5">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
              search
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar pregunta…"
              aria-label="Buscar pregunta frecuente"
              className="w-full bg-surface rounded-full pl-12 pr-4 py-3.5 font-[var(--font-body)] text-sm text-text-primary border border-border focus-visible:outline-brand-blue"
            />
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categorias.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`font-[var(--font-ui)] text-sm font-medium px-4 py-2 rounded-full transition-colors ${
                  cat === c
                    ? "bg-brand-blue text-white"
                    : "bg-surface text-text-secondary hover:bg-brand-blue/[0.06] hover:text-brand-blue"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Lista */}
          <div className="flex flex-col gap-3">
            {filtered.length === 0 && (
              <p className="text-center text-text-muted py-12 font-[var(--font-body)]">
                No encontramos preguntas para «{query}».
              </p>
            )}
            {filtered.map((f) => {
              const open = openId === f.id;
              return (
                <div
                  key={f.id}
                  className="bg-white rounded-2xl border border-border overflow-hidden"
                >
                  <h3>
                    <button
                      onClick={() => setOpenId(open ? null : f.id)}
                      aria-expanded={open}
                      aria-controls={`faq-respuesta-${f.id}`}
                      className="w-full flex items-center justify-between gap-4 text-left px-5 md:px-6 py-4"
                    >
                      <span className="font-[var(--font-display)] text-base font-bold text-brand-navy">
                        {f.q}
                      </span>
                      <span
                        className={`material-symbols-outlined text-brand-blue shrink-0 transition-transform duration-200 ${
                          open ? "rotate-180" : ""
                        }`}
                      >
                        expand_more
                      </span>
                    </button>
                  </h3>
                  {open && (
                    <div
                      id={`faq-respuesta-${f.id}`}
                      className="px-5 md:px-6 pb-5 -mt-1"
                    >
                      <RespuestaFaq bloques={f.bloques} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* CTA final → sube al formulario */}
          <div className="mt-12 rounded-2xl border border-border bg-surface p-8 text-center">
            <h3 className="font-[var(--font-display)] text-xl md:text-2xl font-bold text-brand-navy mb-2">
              ¿No encuentras tu respuesta?
            </h3>
            <p className="font-[var(--font-body)] text-sm text-text-secondary max-w-md mx-auto mb-6">
              Radica tu solicitud, queja, reclamo o sugerencia y nuestro equipo
              te responderá en un máximo de 15 días hábiles.
            </p>
            <a
              href="#top-sqr"
              onClick={(e) => {
                e.preventDefault();
                setModo("radicar");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="inline-flex items-center justify-center gap-2 bg-brand-blue text-white font-[var(--font-ui)] text-sm font-semibold px-7 py-3.5 rounded-full shadow-[0_4px_14px_0_rgba(0,122,254,0.39)] hover:-translate-y-0.5 transition-all"
            >
              <span className="material-symbols-outlined text-lg">edit_note</span>
              Radicar mi SQR
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

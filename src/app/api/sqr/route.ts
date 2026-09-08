import { NextResponse } from "next/server";
import { encabezadosSqr, leerRadicado } from "@/lib/sqr-servidor";

/**
 * Radica una SQR en el sistema de SQR (el de Juan) y devuelve el radicado.
 *
 * El sistema de SQR es la fuente de verdad: genera el consecutivo, guarda el
 * caso y lleva los plazos de ley. Esta ruta solo traduce el formulario de la
 * web a su API y normaliza la respuesta.
 *
 * Configuración (variables de servidor):
 *  · SQR_API_RADICAR — URL del endpoint que radica
 *  · SQR_API_TOKEN   — opcional, se envía como X-API-Key y Authorization
 *
 * Sin SQR_API_RADICAR responde 503 y el formulario cae al correo, que es como
 * funciona hoy: se puede desplegar antes de que el endpoint exista.
 *
 * El contrato está en docs/integraciones/SQR-API.md.
 */

const REQUERIDOS = ["nombre", "documento", "email", "telefono", "asunto", "mensaje"] as const;
const MAX_LARGO = 5000;

export async function POST(request: Request) {
  const endpoint = process.env.SQR_API_RADICAR;
  if (!endpoint) {
    return NextResponse.json(
      { ok: false, motivo: "sqr_no_configurado" },
      { status: 503 }
    );
  }

  let datos: Record<string, unknown>;
  try {
    datos = await request.json();
  } catch {
    return NextResponse.json({ ok: false, motivo: "json_invalido" }, { status: 400 });
  }

  const texto = (campo: string) => String(datos[campo] ?? "").trim().slice(0, MAX_LARGO);

  const faltantes = REQUERIDOS.filter((c) => !texto(c));
  if (faltantes.length) {
    return NextResponse.json(
      { ok: false, motivo: "campos_faltantes", campos: faltantes },
      { status: 400 }
    );
  }

  const email = texto("email").toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, motivo: "email_invalido" }, { status: 400 });
  }

  const cuerpo = {
    tipo: texto("tipo") || "Petición",
    nombre: texto("nombre"),
    tipoDocumento: texto("tipoDocumento") || "CC",
    documento: texto("documento").replace(/[.\s]/g, ""),
    email,
    telefono: texto("telefono").replace(/[\s()-]/g, ""),
    sede: texto("sede"),
    vinculo: texto("vinculo"),
    asunto: texto("asunto"),
    mensaje: texto("mensaje"),
    // El consentimiento es obligatorio en el formulario; se manda explícito
    // porque del lado del sistema queda como evidencia (Ley 1581 de 2012).
    autorizaDatos: true,
    origen: "web",
    fecha: new Date().toISOString(),
  };

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: encabezadosSqr(),
      body: JSON.stringify(cuerpo),
      signal: AbortSignal.timeout(12_000),
    });

    const respuesta = await res.json().catch(() => null);
    if (!res.ok) throw new Error(`SQR respondió ${res.status}`);

    const radicado = leerRadicado(respuesta);
    if (!radicado) {
      // El caso pudo haber quedado radicado, pero sin número no podemos
      // prometerle seguimiento a nadie: mejor que el formulario caiga al
      // correo y quede el rastro por ahí.
      console.error("[sqr] Radicación sin número de radicado:", respuesta);
      throw new Error("respuesta sin radicado");
    }

    return NextResponse.json({ ok: true, radicado });
  } catch (error) {
    console.error("[sqr] No se pudo radicar:", error);
    return NextResponse.json({ ok: false, motivo: "sqr_no_disponible" }, { status: 502 });
  }
}

import { NextResponse } from "next/server";

/**
 * Recibe una solicitud comercial de `/servicios` o `/contacto` y se la pasa al
 * flujo de n8n "Comercial - Solicitudes web (página nueva)".
 *
 * Por qué pasa por aquí y no directo del navegador a n8n:
 *  · La URL del webhook queda del lado del servidor (no se expone ni se puede
 *    inundar desde afuera con la URL a la vista).
 *  · Se validan los campos mínimos antes de gastar una ejecución del flujo.
 *
 * Configuración: N8N_SOLICITUD_WEBHOOK (variable de servidor).
 * Si no está definida, responde 503 y el formulario cae automáticamente al
 * envío por correo, que es como funcionaba antes.
 */

const CAMPOS_REQUERIDOS = ["empresa", "nombre", "email", "telefono"] as const;
const MAX_LARGO = 2000;

export async function POST(request: Request) {
  const webhook = process.env.N8N_SOLICITUD_WEBHOOK;
  if (!webhook) {
    return NextResponse.json(
      { ok: false, motivo: "webhook_no_configurado" },
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

  const faltantes = CAMPOS_REQUERIDOS.filter((c) => !texto(c));
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

  const origen = texto("origen") === "contacto" ? "contacto" : "servicios";

  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        origen,
        empresa: texto("empresa"),
        nombre: texto("nombre"),
        email,
        telefono: texto("telefono"),
        ciudad: texto("ciudad"),
        servicio: texto("servicio"),
        mensaje: texto("mensaje"),
        pagina: texto("pagina"),
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) throw new Error(`n8n respondió ${res.status}`);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[solicitud] No se pudo enviar a n8n:", error);
    return NextResponse.json({ ok: false, motivo: "n8n_no_disponible" }, { status: 502 });
  }
}

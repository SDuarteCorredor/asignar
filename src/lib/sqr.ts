/**
 * Canal SQR de la web: radicación y consulta de estado.
 *
 * El sistema de SQR (el de Juan, en `developer.asignar.com.co/sqr`) es la
 * fuente de verdad: es el que genera el radicado, guarda el caso y lleva los
 * plazos de ley. Esta página es solo la cara pública, así que todo pasa por
 * `/api/sqr` y `/api/sqr/seguimiento`, que hablan con ese sistema desde el
 * servidor.
 *
 * Mientras esos endpoints no estén configurados, se cae al correo —que es
 * como funciona hoy— y la interfaz lo dice, para que nadie se quede esperando
 * un radicado que nunca llegó.
 *
 * El contrato con el sistema de Juan está en `docs/integraciones/SQR-API.md`.
 */

export type SqrRadicacion = {
  tipo: string;
  nombre: string;
  tipoDocumento: string;
  documento: string;
  email: string;
  telefono: string;
  sede: string;
  vinculo: string;
  asunto: string;
  mensaje: string;
};

/** Cómo salió: por el sistema de SQR o por el correo de respaldo. */
export type ResultadoRadicacion =
  | { via: "api"; radicado: string }
  | { via: "correo" };

export type ResultadoConsulta =
  | {
      via: "api";
      encontrado: true;
      estado: string;
      fecha?: string;
      tipo?: string;
      respuesta?: string;
    }
  | { via: "api"; encontrado: false }
  | { via: "correo" };

const SQR_EMAIL = "sqr@asignar.com.co";

function cuerpoCorreo(d: SqrRadicacion): string {
  return [
    `Tipo de solicitud: ${d.tipo}`,
    `Nombre: ${d.nombre}`,
    `Documento: ${d.tipoDocumento} ${d.documento}`,
    `Correo: ${d.email}`,
    `Teléfono: ${d.telefono}`,
    `Ciudad / sede: ${d.sede}`,
    `Vínculo con Asignar: ${d.vinculo}`,
    "",
    `Asunto: ${d.asunto}`,
    "",
    "Descripción:",
    d.mensaje,
    "",
    "— Autorizo el tratamiento de mis datos personales (Ley 1581 de 2012).",
  ].join("\n");
}

export async function radicarSqr(d: SqrRadicacion): Promise<ResultadoRadicacion> {
  try {
    const res = await fetch("/api/sqr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(d),
      signal: AbortSignal.timeout(15_000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.ok && data.radicado) return { via: "api", radicado: String(data.radicado) };
    }
  } catch {
    // Sistema caído, timeout o endpoint sin configurar: sigue el respaldo.
  }

  window.location.href =
    `mailto:${SQR_EMAIL}` +
    `?subject=${encodeURIComponent(`SQR ${d.tipo} — ${d.asunto}`)}` +
    `&body=${encodeURIComponent(cuerpoCorreo(d))}`;
  return { via: "correo" };
}

export async function consultarSqr(
  radicado: string,
  documento: string
): Promise<ResultadoConsulta> {
  try {
    const res = await fetch("/api/sqr/seguimiento", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ radicado, documento }),
      signal: AbortSignal.timeout(15_000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.ok && data.estado) {
        return {
          via: "api",
          encontrado: true,
          estado: String(data.estado),
          fecha: data.fecha ? String(data.fecha) : undefined,
          tipo: data.tipo ? String(data.tipo) : undefined,
          respuesta: data.respuesta ? String(data.respuesta) : undefined,
        };
      }
      // El sistema respondió, pero no hay caso con ese radicado y documento.
      if (data && data.ok === false && data.motivo === "no_encontrado") {
        return { via: "api", encontrado: false };
      }
    }
    if (res.status === 404) return { via: "api", encontrado: false };
  } catch {
    // Cae al correo.
  }

  window.location.href =
    `mailto:${SQR_EMAIL}` +
    `?subject=${encodeURIComponent(`Seguimiento SQR — Radicado ${radicado}`)}` +
    `&body=${encodeURIComponent(
      [
        "Solicito el estado de mi radicado.",
        `Número de radicado: ${radicado}`,
        `Documento: ${documento}`,
      ].join("\n")
    )}`;
  return { via: "correo" };
}

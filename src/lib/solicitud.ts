/**
 * Envío de las solicitudes comerciales de la web (`/servicios` y `/contacto`).
 *
 * Camino normal: POST a `/api/solicitud`, que se lo pasa al webhook de n8n
 * ("Comercial - Solicitudes web"). Ese flujo responde el portafolio con el
 * link para agendar y le avisa a Paula.
 *
 * Respaldo: si el webhook no está configurado o no responde, se abre el
 * cliente de correo con la solicitud diligenciada —que es como funcionaba
 * antes— para no perder el contacto. El cuerpo conserva las etiquetas exactas
 * que parsea el flujo viejo de Gmail ("Cotizaciones - Solicitudes Comercial"),
 * así que un envío por respaldo sigue entrando por esa vía.
 *
 * Por qué el respaldo no puede ser el camino principal: `mailto:` depende de
 * que el visitante tenga un cliente de correo configurado y de que además le
 * dé enviar. En móvil y en equipos con webmail eso no pasa, y la solicitud se
 * perdía en silencio mientras el formulario decía "enviado".
 */

export type SolicitudComercial = {
  /** Formulario del que salió, para saber qué convierte. */
  origen: "servicios" | "contacto";
  empresa: string;
  nombre: string;
  email: string;
  telefono: string;
  ciudad: string;
  servicio: string;
  mensaje: string;
};

/** Cómo salió la solicitud: por el flujo automático o por el correo de respaldo. */
export type ViaEnvio = "api" | "correo";

const COMERCIAL_EMAIL = "comercialbog@asignar.com.co";
const COMERCIAL_CC = ["gerenciaop@asignar.com.co", "coorantioquia@asignar.com.co"];
const ASUNTO_AUTOMATIZACION = "Nuevo Contacto empresarial";

/** Etiquetas y orden que espera el parser del flujo viejo. "Mensaje" va al
 *  final porque su regex captura multilínea hasta el final del correo. */
function cuerpoCorreo(d: SolicitudComercial): string {
  return [
    `Empresa: ${d.empresa}`,
    `Nombre del contacto: ${d.nombre}`,
    `Email de contacto: ${d.email}`,
    `Teléfono: ${d.telefono}`,
    `Ciudad: ${d.ciudad}`,
    `Servicio de interés: ${d.servicio || "Por definir"}`,
    "",
    `Mensaje: ${d.mensaje || "Solicito una propuesta comercial."}`,
  ].join("\n");
}

function abrirCorreoDeRespaldo(d: SolicitudComercial) {
  window.location.href =
    `mailto:${COMERCIAL_EMAIL}` +
    `?cc=${encodeURIComponent(COMERCIAL_CC.join(","))}` +
    `&subject=${encodeURIComponent(`${ASUNTO_AUTOMATIZACION} — ${d.empresa}`)}` +
    `&body=${encodeURIComponent(cuerpoCorreo(d))}`;
}

export async function enviarSolicitud(d: SolicitudComercial): Promise<ViaEnvio> {
  try {
    const res = await fetch("/api/solicitud", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...d,
        pagina: typeof window !== "undefined" ? window.location.href : "",
      }),
      // Si n8n se demora, no dejamos al usuario esperando: cae al respaldo.
      signal: AbortSignal.timeout(12_000),
    });
    if (res.ok) return "api";
  } catch {
    // Sin conexión, timeout o error del endpoint: sigue el respaldo.
  }
  abrirCorreoDeRespaldo(d);
  return "correo";
}

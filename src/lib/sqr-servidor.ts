/**
 * Traducción entre la web y el sistema de SQR (el de Juan).
 *
 * Solo del lado del servidor: aquí vive el token y aquí se absorben las
 * diferencias de nombres de campo.
 *
 * Por qué los lectores son tolerantes: el contrato pedido está en
 * `docs/integraciones/SQR-API.md`, pero si el sistema devuelve
 * `numero_radicado` en vez de `radicado`, o anida todo bajo `data`, la
 * integración funciona igual. Es la diferencia entre conectar el mismo día y
 * quedar esperando un ajuste por un nombre de campo.
 */

/** Autenticación opcional: se manda en los dos formatos habituales para no
 *  tener que preguntar cuál usa el sistema. */
export function encabezadosSqr(): Record<string, string> {
  const cabeceras: Record<string, string> = { "Content-Type": "application/json" };
  const token = process.env.SQR_API_TOKEN;
  if (token) {
    cabeceras["X-API-Key"] = token;
    cabeceras["Authorization"] = `Bearer ${token}`;
  }
  return cabeceras;
}

/** Desenvuelve respuestas del tipo `{data: {...}}` o `{resultado: {...}}`. */
function contenido(respuesta: unknown): Record<string, unknown> {
  if (!respuesta || typeof respuesta !== "object") return {};
  const raiz = respuesta as Record<string, unknown>;
  for (const llave of ["data", "resultado", "result", "sqr", "caso", "registro"]) {
    const dentro = raiz[llave];
    if (dentro && typeof dentro === "object" && !Array.isArray(dentro)) {
      return { ...raiz, ...(dentro as Record<string, unknown>) };
    }
  }
  return raiz;
}

function primerValor(objeto: Record<string, unknown>, llaves: string[]): string {
  for (const llave of llaves) {
    const valor = objeto[llave];
    if (typeof valor === "string" && valor.trim()) return valor.trim();
    if (typeof valor === "number" && Number.isFinite(valor)) return String(valor);
  }
  return "";
}

/** Número de radicado de una respuesta de radicación. */
export function leerRadicado(respuesta: unknown): string {
  return primerValor(contenido(respuesta), [
    "radicado",
    "numeroRadicado",
    "numero_radicado",
    "nroRadicado",
    "consecutivo",
    "codigo",
    "ticket",
    "id",
  ]);
}

export type EstadoSqr = {
  estado: string;
  fecha?: string;
  tipo?: string;
  respuesta?: string;
};

/** Estado de una consulta de seguimiento. Sin `estado` no hay nada que mostrar. */
export function leerEstado(respuesta: unknown): EstadoSqr | null {
  const datos = contenido(respuesta);

  const estado = primerValor(datos, ["estado", "status", "estadoActual", "estado_actual"]);
  if (!estado) return null;

  const fecha = primerValor(datos, [
    "fecha",
    "fechaRadicacion",
    "fecha_radicacion",
    "fechaCreacion",
    "createdAt",
    "created_at",
  ]);
  const tipo = primerValor(datos, ["tipo", "tipoSolicitud", "tipo_solicitud", "categoria"]);
  const texto = primerValor(datos, [
    "respuesta",
    "respuestaFinal",
    "respuesta_final",
    "observacion",
    "observaciones",
    "detalle",
  ]);

  return {
    estado,
    ...(fecha ? { fecha } : {}),
    ...(tipo ? { tipo } : {}),
    ...(texto ? { respuesta: texto } : {}),
  };
}

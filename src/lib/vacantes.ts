/**
 * Fuente de datos de vacantes: Google Sheets.
 *
 * ── Cómo funciona ───────────────────────────────────────────────
 * El equipo de vinculación registra cada vacante como una fila del Sheet.
 * Este módulo la lee **solo en el servidor** y la página se revalida cada
 * pocos minutos, así que publicar una vacante no requiere desplegar nada.
 *
 * ── Privacidad (importante) ─────────────────────────────────────
 * Este módulo lee ÚNICAMENTE las columnas publicables: pide los rangos A:M
 * y O:O en una sola llamada, saltándose a propósito la N. Ahí vive el correo
 * del reclutador y no se lee ni siquiera en el servidor: el enrutamiento de
 * la postulación lo resuelve n8n con sus propias credenciales, a partir del
 * `id` de la vacante.
 *
 * NO conectar aquí el Sheet de control operativo de solicitudes: contiene
 * nombres de clientes y datos personales de candidatos (cédulas y nombres).
 * Debe usarse una hoja aparte solo con las columnas de abajo.
 *
 * ── Configuración ───────────────────────────────────────────────
 * Variables de entorno (sin NEXT_PUBLIC_: son de servidor):
 *   VACANTES_SHEET_ID    — id del documento
 *   VACANTES_SHEET_RANGE — rango publicable, por defecto "Vacantes!A:M".
 *                          El id se lee siempre de la columna O.
 *
 * Y para autenticar, una de dos (se prefiere la cuenta de servicio):
 *   GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_SERVICE_ACCOUNT_KEY
 *   GOOGLE_SHEETS_API_KEY — API key de solo lectura
 *
 * Si falta configuración o el Sheet falla, se usan las vacantes de respaldo
 * para que la página nunca quede vacía.
 */

import { hayCuentaDeServicio, tokenDeCuentaDeServicio } from "./google-auth";

export type Vacante = {
  /** Id estable de la columna `id` del Sheet. Es lo que viaja en la URL
      (`/vacantes?v=<id>`) y en la postulación, así que no debe cambiar nunca
      una vez publicada la vacante. */
  id: string;
  cargo: string;
  ciudad: string;
  departamento: string;
  sector: string;
  contrato: string;
  salario: string;
  salarioDetalle: string;
  experiencia: string;
  jornada: string;
  modalidad: string;
  funciones: string;
  icon: string;
  destacada?: boolean;
};

/* Orden de columnas esperado en la hoja (fila 1 = encabezados).
   La columna N (correo del reclutador) existe en el Sheet pero
   deliberadamente NO se lee aquí. */
const COLUMNAS = [
  "activa",
  "cargo",
  "ciudad",
  "departamento",
  "sector",
  "contrato",
  "salario",
  "salario_detalle",
  "experiencia",
  "jornada",
  "modalidad",
  "funciones",
  "destacada",
] as const;

/** Ícono de Material Symbols según el sector o el cargo. */
function iconoPara(cargo: string, sector: string): string {
  const t = `${cargo} ${sector}`.toLowerCase();
  if (/mesero|servicio a mesa|bar|bebida/.test(t)) return "room_service";
  if (/cocina|chef|cocinero/.test(t)) return "restaurant";
  if (/recepcion|concierge|huesped/.test(t)) return "concierge";
  if (/bodega|almacen|inventario/.test(t)) return "warehouse";
  if (/camarer|habitacion|pisos|lavanderia/.test(t)) return "bed";
  if (/aseo|limpieza|servicios generales/.test(t)) return "cleaning_services";
  if (/produccion|operario|planta|industrial/.test(t)) return "factory";
  if (/logistic|transporte|despacho|conductor/.test(t)) return "local_shipping";
  if (/supervisor|coordinador|jefe/.test(t)) return "restaurant_menu";
  if (/administrativ|auxiliar de oficina|documental/.test(t)) return "description";
  if (/lavaplatos|steward/.test(t)) return "countertops";
  return "work";
}

/* La columna con el id estable. Va después del correo del reclutador para no
   tener que mover ninguna columna existente. */
const COLUMNA_ID = "O:O";

const esSi = (v: string) => /^(s[ií]|true|1|x)$/i.test(v.trim());

function filaAVacante(fila: string[], id: string): Vacante | null {
  const get = (col: (typeof COLUMNAS)[number]) =>
    (fila[COLUMNAS.indexOf(col)] ?? "").trim();

  // Una fila sin cargo o marcada como no activa no se publica.
  const cargo = get("cargo");
  if (!cargo || !esSi(get("activa"))) return null;

  const ciudad = get("ciudad");
  const sector = get("sector");

  return {
    id,
    cargo,
    ciudad,
    departamento: get("departamento"),
    sector,
    contrato: get("contrato") || "Obra o labor",
    salario: get("salario"),
    salarioDetalle: get("salario_detalle"),
    experiencia: get("experiencia") || "Sin experiencia",
    jornada: get("jornada"),
    modalidad: get("modalidad") || "Presencial",
    funciones: get("funciones"),
    icon: iconoPara(cargo, sector),
    destacada: esSi(get("destacada")) || undefined,
  };
}

/**
 * Lee las vacantes activas del Sheet. Solo debe llamarse desde el servidor
 * (Server Components o route handlers).
 */
export async function getVacantes(): Promise<{
  vacantes: Vacante[];
  fuente: "sheet" | "respaldo";
  /** Solo cuando `fuente` es "respaldo": por qué no se pudo leer el Sheet. */
  motivo?: string;
}> {
  const sheetId = process.env.VACANTES_SHEET_ID;
  const apiKey = process.env.GOOGLE_SHEETS_API_KEY;
  const rango = process.env.VACANTES_SHEET_RANGE || "Vacantes!A:M";

  if (!sheetId || (!apiKey && !hayCuentaDeServicio())) {
    // Distinguir cuál falta ahorra mucho tiempo al configurar el despliegue.
    const faltan = [
      !sheetId && "VACANTES_SHEET_ID",
      !apiKey && !hayCuentaDeServicio() && "credenciales de Google",
    ].filter(Boolean);
    return {
      vacantes: VACANTES_RESPALDO,
      fuente: "respaldo",
      motivo: `falta configurar: ${faltan.join(" y ")}`,
    };
  }

  try {
    // La base es configurable para poder apuntar a un simulador en pruebas
    // sin depender de Google.
    const base =
      process.env.GOOGLE_SHEETS_API_BASE || "https://sheets.googleapis.com";

    // La cuenta de servicio tiene prioridad: es una identidad real, así que el
    // Sheet se comparte solo con ella en vez de quedar público con enlace.
    const token = await tokenDeCuentaDeServicio();

    /* Se piden DOS rangos en una sola llamada, saltándose la columna N a
       propósito: ahí vive el correo del reclutador y el sitio no debe leerlo
       ni siquiera en el servidor. El id vive en la O. */
    const pedir = (r: string, rId: string) => {
      const params = new URLSearchParams();
      params.append("ranges", r);
      params.append("ranges", rId);
      if (!token) params.set("key", apiKey!);
      // La página se revalida cada 5 minutos: publicar una vacante en el Sheet
      // la muestra en el sitio sin desplegar.
      return fetch(
        `${base}/v4/spreadsheets/${sheetId}/values:batchGet?${params}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          next: { revalidate: 300 },
        }
      );
    };

    const pestana = rango.includes("!") ? `${rango.split("!")[0]}!` : "";
    let res = await pedir(rango, `${pestana}${COLUMNA_ID}`);
    // Si la pestaña se llama distinto, se reintenta sin nombre: Sheets
    // devuelve entonces la primera hoja del documento.
    if (!res.ok && pestana) {
      res = await pedir(rango.split("!")[1], COLUMNA_ID);
    }
    if (!res.ok) throw new Error(`Sheets respondió ${res.status}`);

    const data: { valueRanges?: { values?: string[][] }[] } = await res.json();
    const filas = data.valueRanges?.[0]?.values ?? [];
    const columnaId = data.valueRanges?.[1]?.values ?? [];
    if (filas.length < 2) throw new Error("El Sheet no tiene filas de datos");

    const vacantes = filas
      .slice(1) // fila 1 = encabezados
      .map((fila, i) => {
        /* Mientras la columna `id` no esté llena se usa el número de fila,
           igual que antes, para que la publicación no dependa de haberla
           completado. Un id propio es mejor porque sobrevive a reordenar. */
        const propio = (columnaId[i + 1]?.[0] ?? "").trim();
        return filaAVacante(fila, propio || String(i + 1));
      })
      .filter((v): v is Vacante => v !== null);

    if (vacantes.length === 0) throw new Error("Sin vacantes activas");
    // Dos vacantes con el mismo id romperían los enlaces y el enrutamiento de
    // la postulación, así que se avisa en los logs en vez de pasar de largo.
    const repetidos = vacantes.map((v) => v.id).filter((id, i, t) => t.indexOf(id) !== i);
    if (repetidos.length) {
      console.error("[vacantes] Ids repetidos en el Sheet:", [...new Set(repetidos)]);
    }
    return { vacantes, fuente: "sheet" };
  } catch (error) {
    console.error("[vacantes] No se pudo leer el Sheet:", error);
    // El mensaje es de nuestro propio `throw` (código de estado o motivo), no
    // trae credenciales ni datos del Sheet.
    const motivo = error instanceof Error ? error.message : "error desconocido";
    return { vacantes: VACANTES_RESPALDO, fuente: "respaldo", motivo };
  }
}

/**
 * Vacantes de respaldo — se usan mientras el Sheet no esté configurado o si
 * la lectura falla, para que la página nunca quede vacía.
 */
export const VACANTES_RESPALDO: Vacante[] = [
  { id: "1", cargo: "Mesero/a de Servicio", ciudad: "Medellín", departamento: "Antioquia", sector: "Hotelería", contrato: "Obra o labor", salario: "$1.550.000", salarioDetalle: "+ Auxilio de transporte · + Prestaciones de ley · + Propinas", experiencia: "Mínimo 6 meses", jornada: "Turnos rotativos", modalidad: "Presencial", funciones: "Atención y servicio a mesa en restaurante de hotel, montaje de estaciones, toma de pedidos y apoyo al equipo de A&B.", icon: "room_service", destacada: true },
  { id: "2", cargo: "Auxiliar de Cocina", ciudad: "Bogotá", departamento: "Cundinamarca", sector: "Restaurantes", contrato: "Obra o labor", salario: "$1.500.000", salarioDetalle: "+ Auxilio de transporte · + Prestaciones de ley", experiencia: "Mínimo 6 meses", jornada: "Turnos rotativos", modalidad: "Presencial", funciones: "Preparación de alimentos, mise en place, control de inventario de insumos y apoyo directo al chef principal.", icon: "restaurant" },
  { id: "3", cargo: "Recepcionista de Hotel", ciudad: "Cartagena", departamento: "Bolívar", sector: "Hotelería", contrato: "Obra o labor", salario: "$1.750.905", salarioDetalle: "+ Auxilio de transporte · + Prestaciones de ley", experiencia: "Mínimo 1 año", jornada: "Turnos rotativos", modalidad: "Presencial", funciones: "Check-in / check-out, atención a huéspedes, manejo de reservas y apoyo administrativo. Inglés intermedio requerido.", icon: "concierge", destacada: true },
  { id: "4", cargo: "Auxiliar de Bodega", ciudad: "Cali", departamento: "Valle del Cauca", sector: "Logística", contrato: "Obra o labor", salario: "$1.423.500", salarioDetalle: "+ Auxilio de transporte · + Prestaciones de ley", experiencia: "Sin experiencia", jornada: "Diurna", modalidad: "Presencial", funciones: "Recepción, almacenamiento y despacho de mercancía, manejo de inventarios y organización de bodega.", icon: "warehouse" },
  { id: "5", cargo: "Camarero/a de Pisos", ciudad: "Barranquilla", departamento: "Atlántico", sector: "Hotelería", contrato: "Obra o labor", salario: "$1.423.500", salarioDetalle: "+ Auxilio de transporte · + Prestaciones de ley", experiencia: "Mínimo 6 meses", jornada: "Turnos rotativos", modalidad: "Presencial", funciones: "Limpieza y acondicionamiento de habitaciones según estándares de calidad y reposición de amenidades.", icon: "bed" },
  { id: "6", cargo: "Auxiliar de Servicios Generales", ciudad: "Medellín", departamento: "Antioquia", sector: "Servicios", contrato: "Obra o labor", salario: "$1.423.500", salarioDetalle: "+ Auxilio de transporte · + Prestaciones de ley", experiencia: "Sin experiencia", jornada: "Diurna", modalidad: "Presencial", funciones: "Mantenimiento y aseo de áreas comunes, manejo de insumos de limpieza y apoyo logístico general.", icon: "cleaning_services" },
  { id: "7", cargo: "Bartender", ciudad: "Cartagena", departamento: "Bolívar", sector: "Hotelería", contrato: "Obra o labor", salario: "$1.600.000", salarioDetalle: "+ Auxilio de transporte · + Prestaciones de ley · + Propinas", experiencia: "Mínimo 1 año", jornada: "Nocturna / rotativa", modalidad: "Presencial", funciones: "Preparación de cócteles y bebidas, atención en barra y manejo de inventario de licores. Experiencia en hotel o restaurante.", icon: "local_bar" },
  { id: "8", cargo: "Operario de Producción", ciudad: "Bogotá", departamento: "Cundinamarca", sector: "Industrial", contrato: "Obra o labor", salario: "$1.500.000", salarioDetalle: "+ Auxilio de transporte · + Prestaciones de ley", experiencia: "Mínimo 6 meses", jornada: "Turnos rotativos", modalidad: "Presencial", funciones: "Operación de líneas de producción, control de calidad, empaque y registro de indicadores del proceso.", icon: "factory" },
  { id: "9", cargo: "Supervisor de Alimentos y Bebidas", ciudad: "Medellín", departamento: "Antioquia", sector: "Restaurantes", contrato: "Obra o labor", salario: "$2.200.000", salarioDetalle: "+ Auxilio de transporte · + Prestaciones de ley", experiencia: "Mínimo 2 años", jornada: "Turnos rotativos", modalidad: "Presencial", funciones: "Coordinación del equipo de servicio y cocina, control de estándares, manejo de inventarios y reportes de gestión.", icon: "restaurant_menu" },
  { id: "10", cargo: "Auxiliar Administrativo", ciudad: "Rionegro", departamento: "Antioquia", sector: "Servicios", contrato: "Obra o labor", salario: "$1.600.000", salarioDetalle: "+ Auxilio de transporte · + Prestaciones de ley", experiencia: "Mínimo 1 año", jornada: "Diurna", modalidad: "Presencial", funciones: "Gestión documental, archivo, atención de requerimientos y apoyo a las áreas administrativas.", icon: "description" },
  { id: "11", cargo: "Steward / Lavaplatos", ciudad: "Bogotá", departamento: "Cundinamarca", sector: "Restaurantes", contrato: "Obra o labor", salario: "$1.423.500", salarioDetalle: "+ Auxilio de transporte · + Prestaciones de ley", experiencia: "Sin experiencia", jornada: "Turnos rotativos", modalidad: "Presencial", funciones: "Lavado de loza y utensilios, aseo del área de cocina y apoyo en la recepción de insumos.", icon: "countertops" },
  { id: "12", cargo: "Auxiliar de Logística", ciudad: "Cali", departamento: "Valle del Cauca", sector: "Logística", contrato: "Obra o labor", salario: "$1.550.000", salarioDetalle: "+ Auxilio de transporte · + Prestaciones de ley", experiencia: "Mínimo 6 meses", jornada: "Diurna", modalidad: "Presencial", funciones: "Coordinación de entregas, control de rutas, documentación de transporte y seguimiento de despachos.", icon: "local_shipping" },
];

/** Opciones de filtro derivadas de las vacantes publicadas. */
export function opcionesDeFiltro(vacantes: Vacante[]) {
  const unicos = (valores: string[]) =>
    [...new Set(valores.filter(Boolean))].sort((a, b) => a.localeCompare(b, "es"));
  return {
    ciudades: ["Todas", ...unicos(vacantes.map((v) => v.ciudad))],
    sectores: ["Todos", ...unicos(vacantes.map((v) => v.sector))],
    modalidades: ["Todas", ...unicos(vacantes.map((v) => v.modalidad))],
    experiencias: ["Todas", ...unicos(vacantes.map((v) => v.experiencia))],
    contratos: ["Todos", ...unicos(vacantes.map((v) => v.contrato))],
  };
}

/**
 * Ciudad tal como viaja en la URL: sin tildes, en minúsculas y con guiones.
 * «Bogotá» → «bogota», «Santa Marta» → «santa-marta».
 *
 * Se usa un slug y no el nombre crudo porque `/vacantes?ciudad=Bogot%C3%A1`
 * es lo que se pega en WhatsApp o en una publicación, y ahí el porcentaje
 * escapado se ve roto.
 */
export function slugCiudad(ciudad: string): string {
  return ciudad
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // marcas diacríticas sueltas del NFD
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Ciudad publicada que corresponde al valor de `?ciudad=`, o `null` si no hay
 * ninguna. Acepta tanto el slug («medellin») como el nombre tal cual
 * («Medellín»), así que un enlace escrito a mano también funciona.
 */
export function ciudadDesdeParam(
  valor: string,
  ciudades: readonly string[]
): string | null {
  const slug = slugCiudad(valor);
  if (!slug) return null;
  return ciudades.find((c) => c !== "Todas" && slugCiudad(c) === slug) ?? null;
}

/* Tabla comparativa de los servicios. Los datos son los mismos que muestra
   ServiciosExplorer (shortDesc, descripciones y checks de cada subtipo);
   aquí se ordenan en filas para que sean legibles de un vistazo y
   extraíbles por motores de respuesta con IA. */
interface FilaServicio {
  servicio: string;
  paraQue: string;
  cuandoConviene: string;
  incluye: string[];
}

const filas: FilaServicio[] = [
  {
    servicio: "Servicios Temporales",
    paraQue:
      "Personal calificado en misión para picos de demanda, reemplazos y proyectos, con Asignar como empleador.",
    cuandoConviene:
      "Eventos, temporadas y picos puntuales (personal eventual) u operaciones continuas que necesitan un equipo a tiempo completo (personal temporal fijo).",
    incluye: [
      "Cobertura ágil",
      "Gestión completa de nómina",
      "Prestaciones y seguridad social",
      "Póliza de cumplimiento vigente",
    ],
  },
  {
    servicio: "Outsourcing de Procesos",
    paraQue:
      "Tercerización de áreas operativas y administrativas completas, no solo del personal.",
    cuandoConviene:
      "Cuando quieres delegar un área entera —limpieza y mantenimiento, cocina y servicio, producción, recepción o back-office— con supervisión incluida.",
    incluye: [
      "Supervisión permanente en sitio",
      "Indicadores y reportes mensuales",
      "Personal capacitado y evaluado",
      "Flexibilidad para escalar",
    ],
  },
  {
    servicio: "Selección de Personal",
    paraQue:
      "Reclutamiento y evaluación de candidatos para vacantes que contrata directamente tu empresa.",
    cuandoConviene:
      "Perfiles directivos y especializados (headhunting ejecutivo) o vacantes operativas de alto volumen que hay que cubrir rápido.",
    incluye: [
      "Evaluación por competencias",
      "Pruebas psicotécnicas incluidas",
      "Verificación de antecedentes",
      "Garantía de permanencia",
    ],
  },
  {
    servicio: "Gestión de SST",
    paraQue:
      "Diseño, implementación y seguimiento del Sistema de Gestión de Seguridad y Salud en el Trabajo.",
    cuandoConviene:
      "Cuando necesitas cumplir la Resolución 0312 y sostener la cultura de prevención con inspecciones y auditorías.",
    incluye: [
      "Diseño del SG-SST a medida",
      "Capacitaciones iniciales y continuas",
      "Inspecciones periódicas en sitio",
      "Acompañamiento en auditorías",
    ],
  },
];

const thBase =
  "font-[var(--font-ui)] text-[13px] font-semibold text-brand-navy text-left align-top px-5 py-4 border-b border-border";
const tdBase =
  "font-[var(--font-body)] text-sm text-text-secondary align-top px-5 py-5";
const thRowBase =
  "font-[var(--font-display)] text-[15px] font-bold text-brand-navy text-left align-top px-5 py-5";

export default function ComparativaServicios() {
  return (
    <section className="py-[var(--spacing-section-mobile)] md:py-[var(--spacing-section)] bg-surface">
      <div className="max-w-[var(--container-max)] mx-auto px-4 md:px-16">
        <div className="mb-8 text-center lg:text-left">
          <h2 className="font-[var(--font-display)] text-3xl md:text-4xl font-extrabold text-brand-navy tracking-[-0.02em] mb-3">
            Qué servicio conviene a tu operación
          </h2>
          <p className="font-[var(--font-body)] text-base md:text-lg text-text-secondary max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Compara para qué sirve cada servicio, cuándo conviene y qué incluye.
          </p>
        </div>

        <p className="md:hidden font-[var(--font-ui)] text-xs text-text-muted mb-3">
          Desliza la tabla para ver todas las columnas.
        </p>

        {/* La tabla scrollea dentro de su contenedor: nunca desborda el layout. */}
        <div
          className="overflow-x-auto rounded-2xl border border-border bg-white"
          tabIndex={0}
          role="region"
          aria-label="Tabla comparativa de servicios"
        >
          <table className="w-full min-w-[760px] border-collapse">
            <caption className="sr-only">
              Comparación de los servicios de Asignar: para qué sirve cada uno,
              cuándo conviene y qué incluye.
            </caption>
            <thead className="bg-surface-gray">
              <tr>
                <th scope="col" className={`${thBase} w-[200px]`}>
                  Servicio
                </th>
                <th scope="col" className={thBase}>
                  Para qué sirve
                </th>
                <th scope="col" className={thBase}>
                  Cuándo conviene
                </th>
                <th scope="col" className={thBase}>
                  Qué incluye
                </th>
              </tr>
            </thead>
            <tbody>
              {filas.map((fila, i) => {
                // Sin línea inferior en la última fila: el borde del contenedor cierra la tabla.
                const linea = i < filas.length - 1 ? " border-b border-border" : "";
                return (
                <tr key={fila.servicio}>
                  <th scope="row" className={thRowBase + linea}>
                    {fila.servicio}
                  </th>
                  <td className={tdBase + linea}>{fila.paraQue}</td>
                  <td className={tdBase + linea}>{fila.cuandoConviene}</td>
                  <td className={tdBase + linea}>
                    <ul className="list-disc pl-4 space-y-1 marker:text-brand-blue">
                      {fila.incluye.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

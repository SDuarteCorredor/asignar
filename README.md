# Asignar SAS — Sitio web

Sitio institucional y portal de empleo de **Asignar SAS**, empresa de servicios temporales (Ley 50 de 1990) con más de 20 años en Colombia y presencia en 9 ciudades.

> Construido por el equipo de Marketing Digital. **No reemplaza ni toca el software administrativo existente** (`asignar.com.co/_admin`, el panel de SQR de Desarrollo): son sistemas separados que se comunican por HTTP, cada uno con su propio hosting y su propia base de datos.

---

## Stack

| | |
|---|---|
| Framework | Next.js **16.3.1** (App Router) |
| UI | React 19.2.4 · TypeScript 5 |
| Estilos | Tailwind CSS v4 (configuración CSS-first en `src/app/globals.css`) |
| Fuentes | Plus Jakarta Sans (display) · DM Sans (cuerpo) · Inter (UI) |
| Íconos | Material Symbols Outlined + SVG inline |
| Node | 22.x · gestor **npm** |
| Deploy | Vercel (integración nativa con GitHub; preview por PR) |

## Puesta en marcha

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # build de producción
npm run lint       # eslint
npx tsc --noEmit   # typecheck
```

Sin ningún `.env.local` el sitio **arranca y funciona igual**: las vacantes salen de una lista de respaldo y los formularios caen al correo. Ver *Variables de entorno* para activar cada integración.

## Estructura

```
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Layout raíz: fuentes, metadata, Navbar + Footer
│   │   ├── globals.css         # Tokens del design system (Tailwind v4)
│   │   ├── page.tsx            # Home
│   │   ├── vacantes/           # Portal de empleo (lista + detalle + postulación)
│   │   ├── servicios/          # Oferta B2B
│   │   ├── nosotros/           # Institucional
│   │   ├── faq/                # SQR (radicación y seguimiento) + preguntas frecuentes
│   │   ├── contacto/           # Contacto dual (empresa / candidato)
│   │   └── api/                # Endpoints propios (ver tabla de rutas)
│   ├── components/
│   │   ├── Navbar · Footer · WhatsAppFAB · GoogleTagManager · ScrollRevealInit
│   │   ├── home/               # Secciones del home
│   │   ├── vacantes/           # VacantesClient (portal completo)
│   │   ├── servicios/          # PropuestaForm, ComparativaServicios, ResumenClave
│   │   ├── soluciones/         # ServiciosExplorer
│   │   ├── clientes/           # Carrusel de logos + modal del directorio
│   │   ├── faq/                # Preguntas, resumen SQR y datos de contacto
│   │   ├── nosotros/           # StatsBar
│   │   └── ui/                 # Componentes reutilizables
│   └── lib/                    # Lógica compartida (ver abajo)
├── automation/                 # Flujos de n8n versionados (JSON + README por flujo)
├── docs/
│   ├── design/                 # Contexto de Figma, prompts, handoff
│   └── integraciones/          # Contratos con sistemas de terceros (SQR)
├── .agents/skills/             # Skills de diseño del proyecto
├── public/
│   ├── clientes-brand/         # 63 logos de clientes (WebP)
│   └── images/ · home/ · testimonios/
├── PRODUCT.md · DESIGN.md      # Producto y design system (fuentes de verdad)
└── AGENTS.md · CLAUDE.md       # Instrucciones para agentes de IA
```

### `src/lib`

| Archivo | Para qué |
|---|---|
| `vacantes.ts` | Lee el Sheet de vacantes (solo servidor) y cae a la lista de respaldo |
| `google-auth.ts` | Firma el JWT de la cuenta de servicio de Google |
| `solicitud.ts` | Envío de solicitudes comerciales desde el navegador + respaldo por correo |
| `sqr.ts` / `sqr-servidor.ts` | Radicación y consulta de SQR; el `-servidor` guarda el token y traduce campos |
| `clientes.ts` | Los 63 logos con su nombre de marca y la agrupación por sector |
| `analytics.ts` | Eventos al `dataLayer` de GTM |
| `schema.ts` | JSON-LD (Organization, FAQPage, JobPosting) |
| `site.ts` | `SITE_URL`, `GTM_ID`, número de WhatsApp |

## Rutas

### Páginas

| Ruta | Descripción | Público |
|---|---|---|
| `/` | Home | Mixto |
| `/vacantes` | Portal de empleo: búsqueda, filtros, detalle y postulación | Candidato |
| `/servicios` | Catálogo de servicios, diferenciales, proceso y clientes | Empresa |
| `/nosotros` | Historia, DOCA, cobertura nacional | Mixto |
| `/faq` | **SQR** — radicar y hacer seguimiento + preguntas frecuentes | Trabajador / usuario |
| `/contacto` | Selector empresa/candidato + formulario y sedes | Mixto |

> `/faq` conserva la URL por compatibilidad, pero en la interfaz **siempre se llama SQR**.
> Acepta anclas para preseleccionar categoría: `/faq#nomina`, `/faq#sst`, `/faq#vinculacion`, `/faq#seguridad-social`, `/faq#terminaciones`, `/faq#marcacion`.
> `/vacantes?v=<id>` abre directamente el detalle de una vacante — es la URL que llevan los QR.

### Endpoints

Todos viven en `src/app/api/`. Ninguno guarda datos: validan, reenvían al sistema que corresponde y normalizan la respuesta.

| Endpoint | Método | Qué hace | Si no está configurado |
|---|---|---|---|
| `/api/vacantes` | GET | Vacantes publicadas; el campo `fuente` dice si vinieron del `sheet` o del `respaldo` | Devuelve la lista de respaldo |
| `/api/postulacion` | POST (multipart) | Postulación + hoja de vida → webhook de n8n | 503 → el formulario usa correo |
| `/api/solicitud` | POST (JSON) | Solicitud comercial de `/servicios` y `/contacto` → webhook de n8n | 503 → el formulario usa correo |
| `/api/sqr` | POST (JSON) | Radica una SQR en el sistema de Desarrollo y devuelve el radicado | 503 → el formulario usa correo |
| `/api/sqr/seguimiento` | POST (JSON) | Consulta el estado de una SQR por radicado + documento | 503 → el formulario usa correo |
| `/api/qr` | GET | `?v=<id>` → QR en SVG que apunta a `/vacantes?v=<id>` | — |
| `/llms.txt` · `/sitemap.xml` · `/robots.txt` | GET | Generados desde `SITE_URL` | — |

## Design system

Fuente de verdad: **`DESIGN.md`** (espejo con `src/app/globals.css` y Figma). Reglas:

- **Nunca** hex crudos en componentes nuevos — usar tokens.
- Marca: `brand-blue #007AFE` · `brand-light-blue #05B8FD` · `brand-deep-blue #0056B3` · `brand-navy #001233`.
- Superficies: `surface #F6F8FB` · `surface-gray #EDF1F6` · `border #E2E8F0`.
- Gold eliminado del sistema (decisión 2026-07-08).
- Títulos: centrados en móvil, alineados a la izquierda en desktop (`text-center lg:text-left`).
- `prefers-reduced-motion` se respeta en todo el motion nuevo.

Antes de trabajo de UI leer en orden: `PRODUCT.md` → `DESIGN.md` → `docs/design/FIGMA-CONTEXT.md`.

---

## Formularios e integraciones

Los cinco formularios del sitio siguen **el mismo patrón**, y entenderlo ahorra la mayor parte de las preguntas:

```
navegador → /api/<lo-que-sea> (servidor) → sistema externo (n8n o el panel de SQR)
                     ↓ si no responde o no está configurado
              respaldo: abre el correo con los datos diligenciados
```

**Por qué pasa por un endpoint propio y no directo del navegador:** la URL del webhook y los tokens quedan del lado del servidor, no se pueden inundar desde afuera, y no hay que configurar CORS.

**Por qué existe el respaldo por correo:** permite desplegar antes de que exista el otro lado. Ninguna integración necesita ventana de mantenimiento — se enciende poniendo una variable de entorno y se apaga borrándola.

> ⚠️ El respaldo **no puede ser el camino principal**. `mailto:` depende de que el visitante tenga un cliente de correo configurado *y* de que además le dé enviar. En móvil y en equipos con webmail eso no ocurre: la solicitud se pierde en silencio mientras el formulario dice "enviado". Fue exactamente el bug que tenían los formularios comerciales y el de SQR hasta septiembre de 2026.

| Formulario | Ruta de la UI | Endpoint | Sistema destino | Estado |
|---|---|---|---|---|
| Postulación a vacante | `/vacantes` | `/api/postulacion` | n8n · *Postulaciones Web* | Listo; requiere `N8N_POSTULACION_WEBHOOK` |
| Solicitud de propuesta | `/servicios` | `/api/solicitud` | n8n · *Solicitudes web* | Listo; requiere `N8N_SOLICITUD_WEBHOOK` |
| Contacto empresarial | `/contacto` | `/api/solicitud` | n8n · *Solicitudes web* | Igual que el anterior (mismo endpoint) |
| Radicación de SQR | `/faq` | `/api/sqr` | Panel de SQR (Desarrollo) | Listo; **faltan las URLs del panel** |
| Seguimiento de SQR | `/faq` | `/api/sqr/seguimiento` | Panel de SQR (Desarrollo) | Listo; **faltan las URLs del panel** |

### SQR ↔ panel de Desarrollo

El panel de SQR es **la fuente de verdad**: genera el radicado, guarda el caso y lleva los plazos de ley. La web es solo la cara pública.

Para conectarlo se necesitan **dos endpoints del lado del panel** (radicar y consultar estado). El contrato completo —payloads, respuestas, autenticación, `curl` de prueba y la nota de privacidad— está en **[`docs/integraciones/SQR-API.md`](docs/integraciones/SQR-API.md)**, escrito para pasárselo tal cual a Desarrollo.

Dos detalles que importan al implementarlo:

- **Los lectores de respuesta son tolerantes a propósito** (`src/lib/sqr-servidor.ts`): funcionan igual si el panel devuelve `numero_radicado`, `consecutivo` o `ticket`, y si anida bajo `data` o `resultado`. Nadie tiene que renombrar campos para que conecte.
- **La validación de que el radicado y el documento correspondan al mismo caso es del panel.** El radicado es adivinable (son consecutivos) y el estado trae datos personales; la web exige ambos campos pero no puede verificar que sean del mismo caso.

---

## Vacantes desde Google Sheets

El equipo de vinculación publica vacantes registrando filas en un Sheet; el sitio las muestra sin necesidad de desplegar (la página se revalida cada 5 minutos).

**Hoja `Vacantes`** — fila 1 son encabezados, y el orden de columnas importa:

| Col | Campo | Notas |
|---|---|---|
| A | `activa` | `SI` publica la vacante; cualquier otro valor la oculta |
| B | `cargo` | Obligatorio; si está vacío la fila se ignora |
| C | `ciudad` | Alimenta el buscador y el enrutamiento de la postulación |
| D | `departamento` | |
| E | `sector` | |
| F | `contrato` | Por defecto "Obra o labor" |
| G | `salario` | Texto libre, ej. `$1.550.000` |
| H | `salario_detalle` | ej. `+ Auxilio de transporte · + Prestaciones de ley` |
| I | `experiencia` | |
| J | `jornada` | |
| K | `modalidad` | Por defecto "Presencial" |
| L | `funciones` | |
| M | `destacada` | `SI` le pone la etiqueta "Destacada" |
| N | `correo_reclutador` | **Oculto: el sitio no lee esta columna** (ver abajo) |
| O | `id` | Identificador estable y **único**. Es lo que viaja en la URL, el QR y la postulación |

Para dar de alta una vacante sin entrar al Sheet existe un formulario de n8n — ver *Automatizaciones*.

### Por qué el `id` va en una columna propia

Antes el identificador era el **número de fila**, lo que obligaba a no ordenar, no insertar y no borrar filas: cualquiera de las tres reasignaba los ids y las postulaciones empezaban a llegarle al reclutador equivocado.

Con la columna `id` esa restricción desaparece. Lo único que hay que respetar es que **un id no se reutilice ni cambie** una vez publicada la vacante: hay enlaces y códigos QR circulando con él. El formulario de alta lo genera solo (mayor id + 1), así que en la práctica nadie lo escribe a mano.

Mientras la columna esté vacía, el sitio y el flujo de postulaciones siguen usando el número de fila, así que la migración no rompe nada a mitad de camino.

Los filtros del portal (ciudad, sector, modalidad, experiencia, contrato) se derivan de lo que haya publicado: agregar una ciudad o un sector nuevo en el Sheet lo hace aparecer solo, sin tocar código.

### Privacidad

- La lectura ocurre **solo en el servidor**: las credenciales nunca llegan al navegador.
- Se autentica con una **cuenta de servicio** (`src/lib/google-auth.ts`), no con una API key. Una API key no es una identidad: obliga a dejar el Sheet accesible para cualquiera con el enlace. La cuenta de servicio sí lo es, así que el documento se comparte **solo con ella**, en modo lector.
- El sitio pide los rangos **A:M y O:O en una sola llamada**, saltándose la N a propósito. **El correo del reclutador (col. N) no se lee ni siquiera en el servidor**: la postulación viaja con el `id` de la vacante y es n8n —con sus propias credenciales— quien resuelve a quién enrutarla.
- ⚠️ **No conectar aquí el Sheet de control operativo de solicitudes**: ese contiene nombres de clientes y datos personales de candidatos (cédulas y nombres completos). Debe usarse una hoja aparte solo con las columnas de arriba.

### Postulaciones

`POST /api/postulacion` (multipart) valida los campos mínimos, limita la hoja de vida a 5 MB en PDF/Word y reenvía todo a `N8N_POSTULACION_WEBHOOK`.

| Campo | Notas |
|---|---|
| `vacanteId` | El `id` estable de la columna O. **Con este se resuelve el `correo_reclutador`** |
| `cargo`, `ciudad`, `sector` | Copia de la vacante, para el asunto y el registro |
| `nombre`, `tipoDocumento`, `documento`, `edad`, `telefono`, `whatsapp` | Datos del candidato |
| `hojaVida` | Archivo binario (PDF/Word, máx. 5 MB). Puede no venir |
| `autorizaDatos` | Siempre `true`: es obligatorio para enviar |
| `autorizaMarketing` | `true`/`false` — **consentimiento separado y opcional** |

El flujo n8n busca la fila cuyo `id` coincide con `vacanteId`, lee su `correo_reclutador`, sube la hoja de vida a Drive, notifica al reclutador y registra la postulación.

### Consentimiento y comunicaciones comerciales

El formulario tiene **dos casillas independientes**:

1. **Obligatoria** — tratamiento de datos para el proceso de selección (Ley 1581 de 2012).
2. **Opcional** — recibir información sobre nuevas vacantes.

Solo los candidatos con `autorizaMarketing = true` pueden entrar a campañas de email marketing o remarketing. El consentimiento del punto 1 **no** habilita usos comerciales, y mezclarlos expondría a la empresa. Además, una lista construida así rinde más: son personas que pidieron recibir.

---

## Automatizaciones (n8n)

Los flujos viven versionados en `automation/`, uno por carpeta, cada uno con su JSON importable y su README (puesta en marcha, credenciales que hay que revisar y `curl` de prueba).

| Flujo | Carpeta | Disparador | Qué hace |
|---|---|---|---|
| **Postulaciones Web** | `postulaciones-web/` | Webhook desde `/api/postulacion` | Resuelve el reclutador por `vacanteId`, sube la HV a Drive, notifica y registra |
| **Solicitudes Comerciales Web** | `solicitudes-comercial-web/` | Webhook desde `/api/solicitud` | Avisa a comercial, envía el portafolio con el link de agenda y registra la solicitud |
| **Cotizaciones — Solicitudes Comercial** | *(no versionado)* | Correo con asunto `Nuevo Contacto empresarial` | El flujo original, para la **página vieja**. Sigue vivo y **no se toca** |
| **Router de Aspirantes** | `router-aspirantes/` | Correo a `marketingdigital@` | Clasifica con IA y reenvía a selección **según la ciudad** |
| **Nueva vacante** | `nueva-vacante/` | Formulario de n8n | Publica una vacante agregando la fila al Sheet |
| **Archivo de Afiliaciones** | `archivo-afiliaciones/` | Correo a `archivobog@` | Archiva afiliaciones en Dropbox. Independiente del sitio |

Notas al conectar o depurar:

- **Al importar un flujo, revisar credencial por credencial.** Es lo que más se rompe: n8n no siempre respeta la credencial del archivo y engancha la primera del mismo tipo que encuentre, que puede ser la de otra cuenta.
- El flujo de la página vieja y el nuevo **escriben en el mismo Sheet**, así que *Seguimiento — Detectar reunión agendada* sigue funcionando para ambos (cruza por `EMAIL`). Las filas del webhook se distinguen por un `id` que empieza en `web-`.
- ⚠️ El *Router de Aspirantes* mapea 7 ciudades (Bogotá, Medellín, Rionegro, Cali, Barranquilla, Cartagena, Pereira). **Santa Marta y Manizales no están**, así que esas postulaciones caen en el buzón de revisión manual.

## Medición

Google Tag Manager (`GTM-PMHJBNJC`) se carga desde `src/components/GoogleTagManager.tsx` con `next/script` en estrategia `afterInteractive`, más el `<noscript>` de respaldo.

Píxeles y etiquetas nuevas (Meta, Google Ads) **se agregan desde el contenedor de GTM, sin tocar código ni pedirle nada a Desarrollo**.

Los formularios empujan estos eventos al `dataLayer` (`src/lib/analytics.ts`). En GTM cada uno se configura como disparador personalizado con el mismo nombre:

| Evento | Se dispara en | Parámetros |
|---|---|---|
| `solicitud_comercial` | Formulario de cotización (`/servicios` y `/contacto`) | `origen`, `servicio`/`sector`, `ciudad`, `via` |
| `postulacion_enviada` | Postulación a una vacante | `cargo`, `ciudad`, `sector`, `con_hoja_de_vida` |
| `sqr_radicada` | Radicación de SQR | `tipo`, `sede`, `vinculo`, `via` |
| `sqr_seguimiento` | Consulta de estado de SQR | `via` |
| `vacante_compartida` | Copiar enlace o compartir una vacante por WhatsApp | `canal`, `vacante_id` |
| `whatsapp_click` | Botón flotante de WhatsApp | `origen` (la ruta desde donde se hizo clic) |

Los nombres válidos están tipados en `ConversionEvent` (`src/lib/analytics.ts`): agregar un evento nuevo pasa por ahí, así no se cuelan nombres que GTM no espera.

> `via` distingue si el envío entró por la integración (`api`) o cayó al respaldo por correo (`correo`). **Un pico de `via = correo` significa que la integración está caída**, y es la forma más rápida de detectarlo.

## Variables de entorno

Todas se configuran en Vercel (*Settings → Environment Variables*) y **solo aplican en el siguiente deploy**: después de crearlas hay que hacer *Redeploy*, y marcarlas para el entorno donde se quieran probar (Production / Preview / Development).

### Sitio

| Variable | Por defecto | Para qué |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://www.asignar.com.co` | Base de `metadataBase`, `sitemap.xml` y `robots.txt`. **Mientras el sitio viva en el preview de Vercel debe apuntar allí**, si no el sitemap anunciará URLs que aún no existen |
| `NEXT_PUBLIC_GTM_ID` | `GTM-PMHJBNJC` | Contenedor de GTM. Vacío = no se carga el script (útil en desarrollo) |
| `NEXT_PUBLIC_WHATSAPP_NUMERO` | `573143348744` | Línea del botón flotante, en E.164 sin `+`. Vacío = el botón no se muestra |

### Vacantes (Google Sheets)

| Variable | Por defecto | Para qué |
|---|---|---|
| `VACANTES_SHEET_ID` | — | Id del Sheet de vacantes. Sin él se usa la lista de respaldo |
| `VACANTES_SHEET_RANGE` | `Vacantes!A:M` | Rango publicable. Deliberadamente **no incluye la columna N** (correo del reclutador). El `id` se lee siempre de la O |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | — | `client_email` de la cuenta de servicio. **Forma recomendada de autenticar** |
| `GOOGLE_SERVICE_ACCOUNT_KEY` | — | `private_key` del JSON de la cuenta de servicio, completa. **Sin `NEXT_PUBLIC_`** |
| `GOOGLE_SHEETS_API_KEY` | — | Alternativa a la cuenta de servicio. La organización tiene bloqueada la creación de API keys, así que normalmente no aplica |
| `GOOGLE_SHEETS_API_BASE` | API de Google | Solo para pruebas: permite apuntar a un simulador |

### Integraciones

| Variable | Para qué |
|---|---|
| `N8N_POSTULACION_WEBHOOK` | Production URL del webhook de *Postulaciones Web* |
| `N8N_SOLICITUD_WEBHOOK` | Production URL del webhook de *Solicitudes Comerciales Web* |
| `SQR_API_RADICAR` | Endpoint del panel de SQR que radica y devuelve el radicado |
| `SQR_API_SEGUIMIENTO` | Endpoint del panel de SQR que consulta el estado |
| `SQR_API_TOKEN` | Token compartido con el panel de SQR. Se envía como `X-API-Key` **y** `Authorization: Bearer` |

Ninguna es obligatoria: **sin ellas el sitio funciona con los respaldos**.

---

## Dominio y despliegue

Vercel despliega `main` automáticamente y genera un preview por cada PR.

### Al mover `asignar.com.co` a este sitio

Hoy el dominio apunta al servidor donde vive la página vieja, y **ese mismo servidor responde también el software administrativo**. Si el dominio se mueve sin preparar nada, dejan de existir:

- `www.asignar.com.co/_admin/usuario.php` — ingreso de empleados y colillas de pago
- `www.asignar.com.co/_admin/` — ingreso de clientes
- `www.asignar.com.co/build/img/*.pdf` — políticas y portafolio

Esas URLs están enlazadas desde el navbar, el footer, el FAQ y `/contacto` de este sitio.

**El orden correcto es:**

1. Crear un nombre propio para el software (por ejemplo `sistema.asignar.com.co`) apuntando **al mismo servidor de hoy** — un registro `A` más un alias en el servidor web y su certificado. No se mueve ningún archivo ni cambia una línea de su código.
2. Verificar que el ingreso funciona por el nombre nuevo.
3. Bajar el TTL a 5 minutos y **solo entonces** apuntar `asignar.com.co` y `www` a Vercel (los valores exactos los da el panel de Vercel al agregar el dominio).
4. Actualizar en este repo los enlaces a `/_admin/` y `/build/img/` al nombre nuevo, y dejar redirecciones para que los links viejos (correos, colillas, marcadores) sigan funcionando.

Nunca se tocan los registros **MX ni TXT**: el correo no pasa por la web.

---

## Reglas de contenido

Decisiones tomadas que **no deben revertirse sin hablarlo**:

- **No prometer plazos de vinculación.** Se retiró "personal listo en menos de 48 horas" de todo el sitio (septiembre 2026): los procesos administrativos —afiliaciones, contratación, ARL— no dependen solo de Asignar, así que era una promesa que en algunos casos no se cumplía. En su lugar se usa lenguaje de velocidad sin cifra ("tiempo récord", "ágil"). El único plazo que sí se comunica es **respuesta comercial en menos de 24 horas hábiles**, que es contacto inicial y sí es controlable.
- **En el portal de empleo no se muestran nombres de empresas cliente como empleadores** — pendiente de permiso comercial. El empleador visible es Asignar.
- Los logos de clientes y su agrupación por sector viven en `src/lib/clientes.ts`, no dentro de los componentes: los consumen el carrusel del home, el de `/servicios` y el modal del directorio.
- Las políticas en PDF se enlazan desde el sitio de la empresa, no se duplican en este repo.

## Pendientes

| Pendiente | De quién depende | Notas |
|---|---|---|
| URLs del panel de SQR | Desarrollo | Con `SQR_API_RADICAR` y `SQR_API_SEGUIMIENTO` la integración queda andando; el contrato ya está escrito |
| Apuntar el dominio | Desarrollo / IT | Ver *Dominio y despliegue*. Requiere el subdominio del software primero |
| Píxel de Meta | Marketing | Se carga desde GTM, sin tocar código |
| Migrar fotos restantes a `next/image` | Front | Sectores, beneficios, testimonios y DOCA aún usan `background-image` con rutas dinámicas |
| Proteger la rama `main` | Quien administre el repo | Hoy no exige PR ni checks para mergear |

## Convenciones

- Ramas de trabajo: `claude/<tema>`; PR contra `main`; Vercel genera preview por PR.
- Commits descriptivos en español, con alcance (`feat(vacantes):`, `style:`, `fix:`).
- Antes de un PR: `npm run lint`, `npx tsc --noEmit` y `npm run build`.
- **Toda integración nueva lleva respaldo**: si el sistema externo no está configurado o no responde, la funcionalidad debe degradar a algo que funcione, no fallar.
- Al cerrar una sesión de diseño, actualizar `docs/design/FIGMA-CONTEXT.md`.

## Contacto

| Área | Correo |
|---|---|
| Comercial (cotizaciones y empresas) | **comercialbog@asignar.com.co** — con copia a gerencia y coordinación |
| Talento (hojas de vida, postulaciones) y contacto general | **marketingdigital@asignar.com.co** |
| Línea ética (SQR) | **sqr@asignar.com.co** |
| Desarrollo (panel de SQR y software administrativo) | **desarrollo2@asignar.com.co** |
| Línea nacional | **(57) 604 322 0310** |

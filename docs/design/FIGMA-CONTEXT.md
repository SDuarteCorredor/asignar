# FIGMA-CONTEXT.md — Estado y protocolo del design system

> **Léeme primero** si eres una sesión de Claude Code trabajando diseño en este proyecto.
> Última actualización: 2026-07-11 (sesión: Servicios v2 implementado en código).

## 1. El archivo de Figma

- **Archivo**: "Asignar — Design System"
- **fileKey**: `wSbfWleY46HpbOiL31go7O`
- **URL**: https://www.figma.com/design/wSbfWleY46HpbOiL31go7O
- **Cuenta**: Asignar SAS (marketingdigital@asignar.com.co) · plan Pro · `planKey: team::1653854165367381859`

## 2. Registro de nodos (NO regenerar — reutilizar por ID)

Todo lo creado está etiquetado con `setSharedPluginData('dsb', 'key', …)` y `run_id: asignar-ds-2026-07-01`. **Idempotencia**: antes de crear algo, busca por su clave `dsb`.

### Colecciones de variables (46 vars, modo claro)
| Colección | ID | Claves |
|---|---|---|
| Primitives | `VariableCollectionId:2:2` | `primitive/brand/*`, `surface/*`, `ink/*` (scopes vacíos, ocultas) |
| Color | `VariableCollectionId:2:3` | `color/bg/*`, `color/text/*`, `color/border/*`, `color/accent/*`, `color/icon/*` (aliasadas a primitivas, code syntax `var(--…)`) |
| Spacing | `VariableCollectionId:2:4` | `spacing/xs…4xl`, `spacing/section*`, `size/container-max` |
| Radius | `VariableCollectionId:2:5` | `radius/sm…full` |

### Estilos
- **Texto (15)**: Display/Hero·XL, Heading/H1–H5, Body/Large·Base·Base Medium·Small, Label/Large·Base·Small·Eyebrow. Clave dsb: `text-style/<nombre>`.
- **Efecto (5)**: Card/Elevated (+Hover), Shadow/sm·md·lg. Clave dsb: `effect-style/<slug>`.
- Fuentes en Figma: Plus Jakarta Sans (`ExtraBold`,`SemiBold` sin espacio) · DM Sans · Inter (`Semi Bold` CON espacio).

### Componentes
| Set | Node ID | Detalle |
|---|---|---|
| Button | `10:179` | 36 variantes (Primary/Secondary/Ghost/Gradient × S/M/L × Default/Hover/Disabled). Props: `Label#10:0`, `Show Icon#10:37`, `Icon#10:74` (INSTANCE_SWAP) |
| Badge | `8:15` | Brand/Soft/Neutral/Gold. Props: Label (TEXT), Show dot (BOOLEAN) |
| Card | `11:24` | Elevated/Bordered. Props: Title, Body, CTA |
| Icons | página `7:2` | arrow-right `7:6`, check `7:9`, chevron-right `7:12`, close `7:16`, menu `7:21`, mail `7:25`, phone `7:28`, star `7:31`, briefcase `7:35`, users `7:41`, award `95:2`, document `114:7`, search `114:11`, clipboard `114:17`, chat `114:22`, clipboard-check `114:27`, user-check `114:32`, link `114:36`, **shield-check `339:4`**, **map-pin `339:8`**, **building `339:12`**, **monitor `339:16`** |
| Navbar | `324:2` | Layout/Navbar — 1440×80, white bg, bottom border. Logo + 6 nav links (Inter Medium 14) + Ingreso (outline pill) + Cotizar (solid blue pill). Fiel al código `Navbar.tsx`. |
| Footer | `325:2` | Layout/Footer — 1440×auto, bg #12151B. CTA row + divider + 4 columnas (Brand/Candidatos/Empresas/Sedes) + divider + Contact row (teléfono/email/sede) + divider + Bottom bar (copyright + legal). Fiel al código `Footer.tsx`. |

### Páginas del archivo
Cover → Getting Started → 🎨 Foundations (root `6:2`) → ——— Components ——— → 🔘 Button (`9:2`) → 🏷️ Badge → ✦ Icons (`7:2`) → 🃏 Card → 🧱 Layout (`322:2`) → 📄 Home (`14:2`) → 📄 Servicios (`204:2`)

### Composiciones full-page (Navbar + contenido + Footer)
- **Servicios — Full Page** `327:2` (en página 📄 Servicios): instancia Navbar + clone wrapper Servicios + instancia Footer.
- **Home — Full Page** `328:92` (en página 📄 Home): instancia Navbar + clone wrapper Home + instancia Footer.

### Home v1 (wrapper `14:3`) — 13 secciones construidas
Hero `15:2` · Vacantes `17:22` · Stats `17:218` · Logos `17:232` · Beneficios `17:255` · DOCA `18:69` · Proceso `19:77` · SGSST `20:89` · B2B `21:98` · Sectores `22:107` · Confianza `23:119` · Testimonios `24:124` · Respaldo `24:189`.
Estado JSON completo: `docs/design/figma-state.json`.

### 🎯 Dirección v2 (página `50:2`, run_id `asignar-ds-2026-07-01-2`)
Tres conceptos de Hero para el rediseño, construidos con instancias del DS:
- **A — Editorial Humano** `50:4`: split asimétrico, display 96px con itálica azul en "talento", foto full-bleed derecha, banda editorial de stats abajo.
- **B — Navy Premium** `50:6`: fondo navy, display blanco con "experiencias" en itálica dorada, foto en arco con borde dorado punteado, CTAs blanco/outline, línea de confianza.
- **C — Bento Dinámico** `50:8`: grid bento 5 celdas (headline+CTA, foto, contador navy, ticker de vacantes, CTA empresa en gradiente).
Design Read aplicado: rediseño-overhaul, VARIANCE 8 / MOTION 6 / DENSITY 4. Correcciones vs v1: sin eyebrow, hero ≤4 elementos de texto, énfasis itálico misma familia, anti-centrado.

### 🚀 Home v2 EN CÓDIGO (rama `claude/home-v2-sections`, 2026-07-06)
Secciones rediseñadas en Figma y ya llevadas a React/Next (fieles al Figma aprobado):
- **B2B** (`21:98` → `B2BSection.tsx`): split, imagen izq con glass stats flotantes (+20 / 7+ / 500+), checklist 6 items con círculos azules, CTAs. Sin fondo azul ni dorado.
- **Sectores** (`22:107` → `SectoresSection.tsx`): bento `lg:grid-cols-7` (spans 3-2-2 / 2-3-2), hover zoom 1.06, overlay slide, flecha CTA. Íconos SVG inline.
- **Testimonios** (`24:124` → `TestimonialsSection.tsx`, client): scroll reel 3 columnas contra-rotatorias (`reel-up`/`reel-down`) + card destacada central + cita con rise por palabra (`testi-rise`) + nav prev/next/dots.
- **Políticas y Sostenibilidad** (`24:189` → `PoliticasSostenibilidad.tsx`): reemplaza Respaldo. Split, grid de 11 PDFs REALES (`asignar.com.co/build/img/`, mismos del dropdown del Navbar) + imagen.
- **Eliminadas**: Confianza (`ConfianzaSectores.tsx`) y Respaldo (`RespaldoStrip.tsx`).
- **CSS**: nuevos keyframes en `globals.css` (`reel-up`/`reel-down`/`testi-rise`) con soporte `prefers-reduced-motion`.
- **Header/Footer**: intactos por pedido del cliente.
- **Imágenes EXTRAÍDAS de Figma** (vía `download_assets` → `rawImages`, optimizadas a JPG con `sharp`, en `public/home/`): `hero.jpg`, `ben-1..6.jpg`, `b2b.jpg`, `sst.jpg`, `sec-{hotelero,restaurantes,industrial,logistica,servicios,inmobiliario}.jpg` (~1.4MB total). Truco: el nodo con nombre "image" o la foto base viven en `rawImages[0]`; el `export` compuesto trae texto/overlay fusionado. `curl` a assets de Figma SÍ funciona en este entorno (nota vieja del §5 obsoleta).
- **Secciones ya fieles al Figma en código**: Hero (foto full-bleed + 3 glass cards), Beneficios (6 photo-cards), Vacantes (split + 4 filas), SG-SST (foto + card "100%"), B2B, Sectores, Testimonios, Políticas. Header/Footer intactos.
- **Pendiente menor**: imagen de Políticas (`152:54` es placeholder vacío en Figma → en código cae a degradado; el label "Operación responsable y certificada" lo hace ver intencional). Retratos reales de Testimonios (hoy iniciales, igual que Figma).

### 🧩 Servicios v2 EN FIGMA (página `📄 Servicios` `204:2`, run_id `asignar-servicios-2026-07-07` + `asignar-ds-2026-07-10`)
Rediseño de la página `/soluciones` (nav "Servicios"). Wrapper `204:3` (1440, auto-layout vertical). 7 secciones (2 nuevas vs v1):
- **01 Hero** `204:4` (surface): split — izquierda badge "Para empresas" + H1 54 navy con acento azul en "menos de 48 horas" + subcopy + CTAs (Solicitar propuesta / Ver portafolio) + chips de respaldo (Ley 50/1990 · SG-SST · ARL SURA) + **Awards badge** `318:270` ("Business Management Awards 2023"). Derecha: tarjeta blanca elevada **"Solicita tu propuesta"** (`225:2`) = mini-formulario.
- **02 Servicios** `204:5` (white): patrón "explorador" = lista de 4 servicios a la izquierda (activo en navy) + panel de detalle a la derecha (`212:2`: título, descripción, checklist 2×2, CTA). Servicios: Temporales / Outsourcing / Selección / Gestión SST. Énfasis en Personal eventual + Personal temporal fijo (sub-páginas futuras).
- **02b ¿Por qué Asignar?** `317:2` (white, NUEVA): 4 differentiator cards en grid 2×2 — Cumplimos la normatividad legal, Cobertura a nivel nacional, Especialistas en sector HORECA, Software propio. Cada card con ícono circular azul + título + descripción.
- **03 Proceso** `204:6` (surface): stepper horizontal 7 pasos — 01 Reclutamiento/Hojas de vida, 02 Antecedentes/Consulta y verificación, 03 Pruebas/Psicotécnicas, 04 Entrevistas/Grupal o individual, 05 Informe final/Selección de candidatos, 06 Envío/Candidatos presentados, 07 Vinculación/Listo para trabajar. Último paso resaltado en azul.
- **04 Cumplimiento** `204:7` (**surface**, cambiado de navy → sin fondos oscuros): copy + stats (+20 años / 7 sedes / **+5.000 colaboradores en misión**) a la izquierda con textos navy/brand-blue; grid 2×2 de tarjetas blancas con borde y sombra (Ley 50, SG-SST, ARL SURA, Póliza) a la derecha.
- **04b Clientes por sector** `318:2` (white, NUEVA): 6 bloques con placeholders exactos para logos — Hotelero (35), Centros de eventos (7), Clubes (5), Restaurantes (8), Inmobiliario (3), Industria (6) = 64 total. Cada bloque con badge de sector + grid de rectángulos placeholder.
- **05 CTA Marquee** `336:176` (surface, REDISEÑADO 2026-07-10): split — izquierda H2 "¿Listo para optimizar tu operación?" + subcopy + dual CTAs (Solicitar propuesta azul pill + Ver servicios outline pill). Derecha: marquee vertical de sectores (Hotelería, Restaurantes, Logística, Industria, Centros de Eventos, Inmobiliario) en Plus Jakarta Sans ExtraLight 64px con opacidades graduadas (0.15→1.0→0.35) simulando scroll. Reemplaza el panel centrado con gradiente (`327:354` eliminado). Corresponde al componente `cta-with-text-marquee.tsx` en código.
- Construido con frames/auto-layout + fuentes del DS. Fotos = placeholders de gradiente (pendiente imágenes reales).
- **Estado**: ✅ diseño implementado en código (commit `1f92d9f`, rama `claude/home-stats-styling-msdlw0`, PR #31). Página `src/app/soluciones/page.tsx` reescrita con las 7 secciones. Componente interactivo `src/components/soluciones/ServiciosExplorer.tsx` creado (tab selector + dark tilt card panel `#1E1E24` con efecto 3D y glare). Reutiliza `<CTAWithVerticalMarquee />` para sección CTA. Reutiliza `<ProcesoSeleccion />` del Home (mismos estilos). Deploy en Vercel OK.

### 🔧 Iconos como componentes (2026-07-10, run_id `asignar-ds-2026-07-10`)
Nuevos icon components en página Icons (`7:2`): **shield-check** `339:4`, **map-pin** `339:8`, **building** `339:12`, **monitor** `339:16`. Usados en las tarjetas ¿Por qué Asignar? de Servicios (reemplazan ellipses placeholder). Además, limpieza de íconos crudos (texto `✓` y `→`) en AMBAS páginas: Servicios (4 checks en checklist + 4 checks en Cumplimiento + 1 arrow en CTA) y Home (6 checks en B2B + 6 arrows en action-btn + 1 arrow en CTA + 6 arrows en sector cards) — todos reemplazados por instancias de `Icon/check` o `Icon/arrow-right`. **Regla**: todo ícono debe ser componente en la página Icons y usarse como instancia.

### ⛔ Gold eliminado del DS (2026-07-08)
Decisión del cliente: fuera el gold de la marca web (nada de amarillo/dorado, y menos como texto sobre fondo oscuro). Eliminado en Figma: variante **Style=Gold** del Badge (`8:12`), variables **`brand/gold`** (`2:10`) y **`color/accent/gold`** (`2:32`), y sus **swatches** en Foundations (`6:10`, `6:92`). En código: quitado `--color-brand-gold` de `globals.css` y reemplazados los usos (`text-brand-gold` → `text-brand-light-blue` en eyebrows de soluciones/FAQ/nosotros/postulate). Acento sobre oscuro = `brand-light-blue`; acento general = `brand-blue`.

### 🎠 Clientes: de grilla a carrusel (2026-09-08, solo código)
La sección **04b Clientes por sector** de `/servicios` ya no es la grilla de 62 logos que está en Figma (`318:2`): ahora es el **mismo carrusel del Home** (`components/clientes/LogosCarrusel.tsx`) con flechas, y cada logo abre un **modal a pantalla completa** (`ClientesModal.tsx`, velo `bg-brand-navy/70` + blur, mismo patrón que el overlay de vacantes) con los 62 clientes agrupados por sector. El Home mantiene su marquee, ahora más rápido (330 px/s) y con las mismas flechas. Los datos por sector se movieron de la página a `src/lib/clientes.ts` (`SECTORES_CLIENTES`), única fuente para carrusel y modal. **Figma quedó desactualizado en esa sección** — pendiente reflejar el carrusel + modal cuando se retome el archivo.

## 3. Pendientes conocidos

- [ ] Subir imágenes reales (`public/hero-asignar.jpg`, `foto-sst.jpg`, logos de clientes) con `upload_assets` y reemplazar placeholders.
- [ ] **REDISEÑO Home v2** (prioridad): v1 es traducción fiel del código = plana. Aplicar dirección de `DESIGN.md → Dirección de evolución` usando los skills de `.agents/skills/`.
- [x] Íconos como componentes: shield-check, map-pin, building, monitor creados; raw text icons (`✓`/`→`) reemplazados con instancias en Home y Servicios.
- [ ] Íconos Material Symbols adicionales (hotel, handshake, payments…) al set de Icons si se necesitan.
- [ ] Explorar librerías de comunidad: `get_libraries(fileKey)` lista UI kits añadibles (motion, hero patterns).
- [x] Servicios v2 (`/soluciones`): implementado en código — 7 secciones, ServiciosExplorer interactivo con dark tilt card, deploy OK (PR #31).
- [ ] Reflejar en Figma el carrusel de clientes con flechas y el modal "todos los clientes" (hoy `318:2` sigue siendo la grilla estática).
- [ ] Páginas restantes (Vacantes, Nosotros, Contacto…) — construir DESPUÉS de validar la dirección v2 en el Home.
- [ ] Code Connect al final (mapear Button/Badge/Card de Figma ↔ componentes React cuando existan como componentes reutilizables en código).

## 4. Protocolo entre sesiones/cuentas de Claude Code

Dos cuentas trabajan este proyecto (personal + empresa). Reglas para no pisarse:

1. **Git es la memoria compartida.** Todo cambio de contexto (este archivo, DESIGN.md, PRODUCT.md, figma-state.json) se commitea y pushea. Al iniciar sesión: `git pull` y leer este archivo antes de tocar Figma.
2. **Figma es estado vivo compartido.** Antes de crear, verifica existencia (claves `dsb`). Nunca dupliques colecciones/estilos/componentes. Nunca borres por nombre — solo por clave `dsb` + run_id propio.
3. **Cada sesión nueva usa un run_id nuevo** (`asignar-ds-YYYY-MM-DD[-n]`) para sus nodos, y registra aquí qué creó (IDs importantes) al terminar.
4. **Convención de ramas**: trabajo de diseño/frontend en ramas `claude/*`.
5. **Skills**: viven en `.agents/skills/` (versionados). Cualquier agente los tiene al clonar. Flujo de diseño: leer PRODUCT.md + DESIGN.md → skill pertinente (`impeccable` para dirección/critique, `design-taste-frontend` para landings, `figma-implement-design` para Figma→código, `web-design-guidelines` + `baseline-ui` para auditar, `emil-design-eng` + `review-animations` + `animation-vocabulary` para motion).
6. **División sugerida**: la cuenta que trabaje FIGMA actualiza este archivo; la que trabaje CÓDIGO actualiza DESIGN.md si cambia tokens. Si ambas van a tocar lo mismo, coordinar por commits pequeños y frecuentes.

## 5. Recetas rápidas (aprendidas, no repetir errores)

- `use_figma`: cargar skill `figma-use` antes; `return` siempre con IDs; una página por script (`setCurrentPageAsync` 1×); fuentes con `loadFontAsync` verificando estilo exacto; colores 0–1; tras `resize()` en auto-layout vertical, re-poner `primaryAxisSizingMode='AUTO'` o la altura queda fija (bug Card resuelto así).
- `combineAsVariants` apila en (0,0): posicionar en grilla después y `resizeWithoutConstraints`.
- Swatches/docs siempre ligados a variables (`setBoundVariableForPaint`), nunca hex.
- En este entorno el `curl` a assets de Figma falla por proxy → usar `enableBase64Response: true` en `get_screenshot`.

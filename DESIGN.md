# DESIGN.md — Asignar SAS

> Fuente de verdad visual. Espejo 1:1 con las variables de Figma (`docs/design/FIGMA-CONTEXT.md`) y con `src/app/globals.css`. Si cambias un token aquí, cámbialo en los tres lados.

## Color

### Marca (primitivas)
| Token | Valor | Uso |
|---|---|---|
| `brand-blue` | `#007AFE` | Acción principal, acentos |
| `brand-light-blue` | `#05B8FD` | Acentos secundarios, gradientes |
| `brand-deep-blue` | `#0056B3` | Hover de primario, extremo de gradiente |
| `brand-navy` | `#001233` | Titulares, footer, fondos de peso |

> ⛔ **Gold eliminado del sistema** (decisión 2026-07-08). Ya no existe `brand-gold`/`--color-brand-gold` ni la variante Gold del Badge. El acento sobre fondos oscuros es `brand-light-blue`; el acento general es `brand-blue`. No usar amarillo/dorado en la marca web.

### Superficies y tinta
| Token | Valor |
|---|---|
| `surface` | `#F6F8FB` (fondo de página) |
| `surface-gray` | `#EDF1F6` (bloques suaves) |
| `surface-elevated` | `#FFFFFF` (cards) |
| `border` | `#E2E8F0` |
| `text-primary` | `#0F1419` · `text-secondary` `#3D4551` · `text-muted` `#6B7280` |

### Gradientes
- `bg-brand-gradient`: 135° `brand-blue → brand-deep-blue` (bloques feature grandes)
- `text-gradient`: 135° `deep-blue → blue` (palabras destacadas)

Regla: los semánticos de Figma (`color/bg/*`, `color/text/*`, `color/border/*`) mandan sobre los hex crudos. Nunca hex directo en componentes nuevos.

## Tipografía

| Rol | Familia | Pesos | Uso |
|---|---|---|---|
| Display | Plus Jakarta Sans | 700/800 | Hero, H1–H3, números stats |
| Body | DM Sans | 400/500/700 | Párrafos |
| UI | Inter | 400/500/600 | Labels, botones, meta, nav |

Rampa (= estilos de texto en Figma): Display/Hero 64/68 · Display/XL 56/60 · H1 48/56 · H2 36/44 · H3 30/38 · H4 24/32 · H5 20/28 · Body Large 18/28 · Base 16/26 · Small 14/22 · Label 16/14/12 · Eyebrow 12 +1.0 tracking.

## Espaciado y radios

- Espaciado: 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64. Sección: 80px desktop / 48px móvil. Contenedor máx 1280px.
- Radios: sm 8 · md 12 · lg 16 · xl 32 · full (pills/botones).

## Elevación

- `card-elevated`: sombra multicapa con tinte navy (0 0 0 1px 4% + 1px 3px 6% + 6px 16px 4%). Hover: anillo azul 8% + capas más profundas.
- `glass-panel`: blanco 70% + blur 12px.
- Escala shadow sm/md/lg estándar para lo demás.

## Motion

- Easings: `--ease-soft` cubic-bezier(0.32,0.72,0,1) · `--ease-spring` (0.34,1.56,0.64,1) · `--ease-out` (0.16,1,0.3,1).
- Duraciones: fast 180ms · base 240ms · slow 400ms.
- Patrones existentes: scroll-reveal (fade+24px up), word-swap en hero, carrusel de logos.
- **Carrusel de logos** (`components/clientes/LogosCarrusel.tsx`, Home y Servicios): avance automático de 180 px/s en un solo `requestAnimationFrame` sobre `translate3d`, con flechas que empujan ~0.8 de pantalla en 620ms con `--ease-out`. Pausa al hover/foco. Con `prefers-reduced-motion` no hay avance automático y la flecha salta sin recorrido.
- Regla: micro-interacciones sobrias; `prefers-reduced-motion` siempre respetado. Revisar todo motion nuevo con el skill `review-animations`.

## Componentes canónicos (Figma + código)

- **Button**: Primary (azul sólido) · Secondary (contorno) · Ghost · Gradient × S/M/L × Default/Hover/Disabled. Pill (radius full), Inter Semi Bold, ícono opcional.
- **Badge**: Brand / Soft / Neutral / Gold, pill, texto 12 Semi Bold, punto opcional.
- **Card**: Elevated (card-elevated) / Bordered, padding 24, radio lg, slots icono+título+cuerpo+CTA.
- **Icons**: set base en Figma; en código Material Symbols Outlined.

## Dirección de evolución (rediseño en curso)

Diagnóstico del diseño actual: correcto pero plano — grid de cards idénticas repetido 6+ veces, eyebrow sobre cada sección, todo centrado, cero fotografía real integrada.

Objetivos del rediseño:
1. **Ritmo editorial**: alternar layouts (split asimétrico, full-bleed, bento, banda angosta) — máximo 2 secciones seguidas con el mismo patrón.
2. **Escala tipográfica valiente**: display más grande y con más contraste de peso; números de stats como protagonistas.
3. **Fotografía real** de personas/operaciones con tratamiento de marca (overlay navy/azul, recortes con radio xl).
4. **Profundidad**: capas, glass, sombras con intención — no cards planas flotando en gris.
5. **Motion con propósito**: entrada escalonada, hover que revela, contadores; nada decorativo porque sí.
6. Eliminar el eyebrow-en-cada-sección; usar jerarquía tipográfica real para abrir secciones.

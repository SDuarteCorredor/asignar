# PRODUCT.md — Asignar SAS

## Register

brand — sitio de marketing/institucional (home, soluciones, vacantes, nosotros, contacto, postúlate, FAQ). No es un dashboard de producto.

## Qué es

Asignar SAS es una Empresa de Servicios Temporales (EST) colombiana con más de 20 años de operación, licencia del Ministerio de Trabajo y 7+ sedes. Conecta talento humano operativo con empresas de hotelería, restaurantes, logística, industria, servicios generales e inmobiliario. El sitio tiene doble audiencia y doble conversión.

## Usuarios objetivo

1. **Candidatos** (prioridad visual #1 en el hero): personas buscando empleo operativo (meseros, auxiliares de cocina, camareros, bodega, aseo). Móvil-primero, lenguaje cercano, cero fricción hacia "Postúlate" / portal `postulate.asignar.cloud`.
2. **Empresas B2B** (prioridad de negocio): gerentes de operaciones y RRHH de hoteles 4-5★, cadenas de restaurantes, centros de eventos, industria. Buscan velocidad (personal listo en tiempo récord —sin comprometer una cifra de horas: los procesos administrativos de vinculación no lo permiten—), cumplimiento legal (Ley 50/1990, SG-SST, ARL SURA) y respaldo. Conversión: "Solicitar propuesta".

## Propósito del sitio

Generar confianza inmediata y convertir: candidatos → postulación, empresas → contacto comercial. La confianza es el activo central: licencias, premios, clientes reales, 20+ años.

## Personalidad de marca

- **Humana y cercana**: "Creemos en ti y en tu talento". Habla de personas, no de "recursos".
- **Confiable e institucional**: cumplimiento, respaldo, seriedad — sin volverse acartonada.
- **Moderna y premium**: debe verse al nivel de las marcas que atiende (hoteles 5 estrellas, restaurantes de alta gama). El diseño ES la prueba de calidad del servicio.
- Orgullosamente colombiana (Medellín, Bogotá, Cartagena, Cali, Barranquilla).

## Anti-referencias (lo que NO debe parecer)

- Plantilla corporativa genérica de agencia de empleo (grids infinitos de cards idénticas, iconitos en cajita azul).
- "AI slop": eyebrow uppercase sobre CADA sección, tres columnas de cards planas repetidas 6 veces, gradiente azul en todo, hero centrado genérico.
- Sitio gubernamental/burocrático frío.
- Startup tech agresiva con dark mode y neones — no es la audiencia.

## Referencias de nivel (aspiración)

- Staffing global premium: randstad.com, sthree.com (jerarquía editorial, fotografía real con intención).
- Marcas de servicio con calidez premium: sitios de cadenas hoteleras 5★.
- Craft web moderno: tipografía display grande con contraste real, ritmo de secciones variado (no todo centrado), micro-interacciones sobrias, fotografía de personas reales > ilustraciones.

## Principios estratégicos de diseño

1. **Doble puerta clara**: candidato y empresa se auto-segmentan en los primeros 800px sin confusión.
2. **La confianza se muestra, no se declara**: logos reales, números reales, sellos reales — integrados con jerarquía, no en franjas de relleno.
3. **Ritmo editorial**: alternar densidad, alineación, fondo y escala entre secciones. Ninguna sección debe parecer clon de la anterior.
4. **Personas primero**: fotografía real de trabajadores y operaciones supera cualquier icono o ilustración.
5. **Accesible**: contraste AA, targets táctiles, foco visible (ya existe base en globals.css), reduced-motion respetado.

## Stack

Next.js 16 · React 19 · Tailwind v4 · tokens en `globals.css` (`@theme`). Design system espejo en Figma (ver `docs/design/FIGMA-CONTEXT.md`).

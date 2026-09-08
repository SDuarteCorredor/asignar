# Integración SQR — web nueva ↔ sistema de SQR

Contrato entre la página pública (`asignar.com.co/faq`) y el sistema de SQR que mantiene Juan (`developer.asignar.com.co/sqr`).

**La web ya está lista.** Todo lo de este documento está implementado y desplegado del lado de la página: en cuanto existan los dos endpoints, se configuran dos variables de entorno y funciona. No hay que tocar código.

## La decisión de fondo: quién es dueño de qué

| | Sistema de SQR (Juan) | Página web |
|---|---|---|
| Genera el radicado | ✅ | ❌ |
| Guarda el caso y su historial | ✅ | ❌ |
| Lleva los plazos de ley y las notificaciones | ✅ | ❌ |
| Formulario público y consulta de estado | ❌ | ✅ |

**El sistema de SQR sigue siendo la fuente de verdad y no cambia de dueño.** La página solo es la cara pública: recoge los datos, se los entrega y muestra lo que responda.

Esto responde de una vez la pregunta de "y a mí me toca actualizar la mía visualmente": **no**. Si la radicación pública pasa por la web, la interfaz de `developer.asignar.com.co/sqr` deja de ser la puerta del ciudadano y queda como lo que de verdad aporta —la consola interna donde se gestionan los casos—. Nada que rediseñar, ni dos formularios que mantener parejos.

## Lo que se necesita: dos endpoints

Autenticación (opcional pero recomendada): un token fijo que la web manda en **ambos** encabezados, para no depender de cuál espera el sistema:

```
X-API-Key: <token>
Authorization: Bearer <token>
```

Las llamadas son **servidor a servidor** (salen de Vercel, no del navegador): **no hace falta configurar CORS**. Si el sistema puede restringir por IP o por token, mejor.

---

### 1. Radicar una SQR

```
POST <URL que definas>
Content-Type: application/json
```

**Lo que envía la web** (todos los campos son `string` salvo `autorizaDatos`):

```json
{
  "tipo": "Petición",
  "nombre": "María Restrepo Gómez",
  "tipoDocumento": "CC",
  "documento": "1020304050",
  "email": "maria@ejemplo.com",
  "telefono": "3001112233",
  "sede": "Medellín",
  "vinculo": "Trabajador en misión",
  "asunto": "Diferencia en el pago de horas extras",
  "mensaje": "Texto libre con la descripción del caso.",
  "autorizaDatos": true,
  "origen": "web",
  "fecha": "2026-09-08T21:40:00.000Z"
}
```

Valores posibles:

| Campo | Valores |
|---|---|
| `tipo` | `Petición` · `Queja` · `Reclamo` · `Sugerencia` · `Felicitación` |
| `tipoDocumento` | `CC` · `CE` · `TI` · `PPT` · `Pasaporte` |
| `sede` | Medellín · Rionegro · Bogotá · Cali · Barranquilla · Cartagena · Santa Marta · Pereira · Manizales · Otra |
| `vinculo` | Trabajador en misión · Candidato · Empresa cliente · Proveedor · Otro |

`documento` y `telefono` van sin puntos ni espacios. `autorizaDatos` siempre viene en `true` (el formulario no deja enviar sin marcar el consentimiento) y se manda explícito para que quede como evidencia del consentimiento (Ley 1581 de 2012).

**Lo que debe responder** (HTTP 200):

```json
{ "ok": true, "radicado": "SQR-2026-00123" }
```

Lo único imprescindible es **el número de radicado**. El lector es tolerante: sirve igual si el campo se llama `radicado`, `numeroRadicado`, `numero_radicado`, `nroRadicado`, `consecutivo`, `codigo`, `ticket` o `id`, y si viene anidado bajo `data`, `resultado`, `result`, `sqr`, `caso` o `registro`. **No hace falta cambiar la API para que encaje.**

Si la respuesta no trae ningún número, la web asume que la radicación falló y cae al correo: es preferible a prometerle un seguimiento a alguien que no lo va a tener.

Cualquier código distinto de 2xx cuenta como error y también cae al correo.

**Recomendado:** que el sistema envíe al ciudadano un correo de confirmación con su radicado. La web muestra el número en pantalla, pero un correo es lo que la gente conserva —y es lo que después le permite hacer seguimiento—. La web no envía ese correo a propósito: si lo mandaran los dos, llegarían duplicados.

---

### 2. Consultar el estado

```
POST <URL que definas>
Content-Type: application/json
```

```json
{ "radicado": "SQR-2026-00123", "documento": "1020304050" }
```

**Lo que debe responder** (HTTP 200):

```json
{
  "ok": true,
  "estado": "En trámite",
  "tipo": "Queja",
  "fecha": "2026-09-01",
  "respuesta": "Texto de la respuesta, si el caso ya fue cerrado."
}
```

Solo `estado` es obligatorio; el resto se muestra si viene. Igual de tolerante con los nombres: `estado`/`status`/`estadoActual`, `fecha`/`fechaRadicacion`/`fechaCreacion`/`createdAt`, `tipo`/`tipoSolicitud`/`categoria`, `respuesta`/`respuestaFinal`/`observacion`/`detalle`.

**Si no existe el caso, o el documento no corresponde a ese radicado:** responder `404`, o `200` con `{"ok": false}`. La web muestra "no encontramos esa SQR" sin filtrar nada más.

> **Importante para la privacidad:** el radicado es adivinable (son consecutivos), y el estado trae datos personales. **La pareja radicado + documento debe validarse del lado del sistema**: si el documento no corresponde, no devolver el caso. La web exige ambos campos, pero no puede verificar que correspondan.

---

## Lo que hay que entregar para conectar

Con estas tres cosas queda andando el mismo día:

1. La URL del endpoint de radicación.
2. La URL del endpoint de consulta.
3. El token, si se usa.

Se configuran en Vercel como variables de entorno y se hace *Redeploy*:

| Variable | Valor |
|---|---|
| `SQR_API_RADICAR` | URL del endpoint 1 |
| `SQR_API_SEGUIMIENTO` | URL del endpoint 2 |
| `SQR_API_TOKEN` | El token (omitir si no se usa) |

**Mientras no existan, no pasa nada malo:** el formulario cae al correo `sqr@asignar.com.co`, que es como funciona hoy. La integración se puede activar sin ventana de mantenimiento y se apaga borrando las variables.

## Cómo probar sin tocar la web

Cuando los endpoints estén arriba, desde cualquier terminal:

```bash
# Radicar
curl -X POST "<URL_RADICAR>" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <token>" \
  -d '{"tipo":"Queja","nombre":"Prueba Integración","tipoDocumento":"CC","documento":"1020304050","email":"prueba@ejemplo.com","telefono":"3001112233","sede":"Medellín","vinculo":"Trabajador en misión","asunto":"Prueba de integración","mensaje":"Radicación de prueba desde la web.","autorizaDatos":true,"origen":"web","fecha":"2026-09-08T21:40:00.000Z"}'

# Consultar (con el radicado que devolvió la anterior)
curl -X POST "<URL_SEGUIMIENTO>" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <token>" \
  -d '{"radicado":"SQR-2026-00123","documento":"1020304050"}'
```

Si esos dos `curl` responden lo de arriba, la web funciona: no hay nada más que ajustar.

## Qué pasa del lado de la web

| Archivo | Qué hace |
|---|---|
| `src/app/api/sqr/route.ts` | Recibe el formulario, valida, llama al endpoint 1 y devuelve el radicado |
| `src/app/api/sqr/seguimiento/route.ts` | Llama al endpoint 2 y normaliza el estado |
| `src/lib/sqr-servidor.ts` | Encabezados de autenticación y los lectores tolerantes de campos |
| `src/lib/sqr.ts` | Envío desde el navegador y respaldo por correo |
| `src/components/FaqClient.tsx` | Formulario, pantalla con el radicado y tarjeta de estado |

Detalles de comportamiento:

- **Timeout de 12 s** hacia el sistema de SQR. Si se pasa, cae al correo.
- **El token nunca llega al navegador**: vive solo en el servidor de la web.
- **Sin `estado` en la consulta**, se muestra "no encontramos esa SQR" en vez de una tarjeta vacía.
- La web **no guarda** ni radicaciones ni consultas: no hay una segunda base de datos de SQR que después no cuadre con la del sistema.

## Alternativas que se descartaron, y por qué

| Opción | Por qué no |
|---|---|
| **Redirigir** desde la web al sistema de SQR | El usuario sale del sitio a otra interfaz y otro dominio. Se rompe la confianza justo en el momento más delicado (una queja) y se pierde la medición. |
| **Iframe** del formulario actual dentro de la web | Es la que obliga a rediseñar el formulario de Juan para que combine. Además da problemas de alto variable, foco y accesibilidad en móvil. |
| **Duplicar** el registro en la web (Sheet o base propia) | Dos verdades para el mismo caso. La primera vez que alguien responda desde un lado, el otro queda desactualizado — y son plazos de ley. |

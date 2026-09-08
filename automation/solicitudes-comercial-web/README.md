# Solicitudes Comerciales Web → n8n

Flujo que recibe las solicitudes de propuesta de la página nueva (`/servicios` y `/contacto`), le responde al cliente con el portafolio y el link para agendar, avisa a Paula y registra la fila.

```
Sitio  →  POST /api/solicitud  →  webhook n8n  →  Gmail (Paula) + Gmail (cliente) + Sheets
```

## Por qué existe si ya está "Cotizaciones - Solicitudes Comercial (Paula)"

Ese flujo **se queda como está y no se toca**: lo dispara un correo con asunto `Nuevo Contacto empresarial` que genera la **página vieja** desde su servidor (`conectando@asignar.com.co`). Mientras esa página siga viva, ese es su camino.

La página nueva no puede usar el mismo camino. Sus formularios abrían el correo del visitante (`mailto:`), lo que tiene dos problemas:

1. **El correo depende del visitante.** Si no tiene cliente de correo configurado —lo normal en móvil y en equipos con webmail— no pasa nada, y el formulario igual decía "enviado". La solicitud se perdía en silencio.
2. **Nunca sale de la página.** El correo lo manda el cliente desde su propia cuenta, así que ni el sitio ni n8n saben que existió.

Con el webhook, la solicitud **sale del servidor de la página**: llega siempre, con los campos ya separados y sin depender de parsear el texto de un correo.

## Qué comparten los dos flujos

Ambos escriben en el **mismo documento**, para que la operación siga siendo una sola:

| Documento | Pestaña | `gid` |
|---|---|---|
| [`Solicitudes Comerciales`](https://docs.google.com/spreadsheets/d/1tlnz559jVxHivBunTFlOy7cBl-5oWBgPpUnHKpoGXf4/edit) | `Untitled` | `801934088` |

Eso importa: **`Seguimiento - Detectar reunión agendada (Paula)` sigue funcionando sin cambios** con las solicitudes de la página nueva, porque cruza por la columna `EMAIL`. Cuando el cliente agenda desde el correo, su fila queda marcada igual que siempre.

Las filas de este flujo se distinguen por la columna `id`: empiezan por `web-` (las del flujo de Gmail traen el `messageId` de Gmail).

## Puesta en marcha

### 1. Importar el flujo

En n8n: *Workflows → Import from File* → `solicitudes-comercial-web.n8n.json`.

- **Verificar las credenciales de los cuatro nodos de Google.** Al importar, n8n no siempre respeta la credencial del archivo y engancha la primera del mismo tipo que encuentra. Deben quedar así (son las mismas del flujo de Paula):

  | Nodo | Credencial |
  |---|---|
  | 🔔 Avisar a Paula · 📤 Enviar portafolio al cliente · ⚠️ Avisar a Paula (revisar) | `Gmail account 4` |
  | 📎 Descargar portafolio (PDF) | `Google Drive account 2` |
  | 🧾 Registrar solicitud | `Google Sheets account 2` |

  El correo al cliente **sale desde la cuenta de esa credencial de Gmail**. Es lo que se quería: que llegue de comercial y no de un coordinador.
- Activar el workflow y copiar la **Production URL** del nodo webhook.

### 2. Conectar el sitio

En Vercel, variable de entorno:

| Variable | Valor |
|---|---|
| `N8N_SOLICITUD_WEBHOOK` | La Production URL del webhook |

Mientras no exista, los formularios **caen automáticamente al envío por correo**, que es como funcionan hoy: se puede activar sin prisa y sin romper nada.

Las variables en Vercel solo entran a jugar en el **siguiente deploy**: después de crearlas hay que hacer *Redeploy*, y marcarlas para el entorno donde se quiera probar (Production / Preview / Development).

## Qué hace cada nodo

| Nodo | Qué hace |
|---|---|
| 📥 Solicitud web (webhook) | Recibe el formulario en JSON (`POST`) |
| ⚙️ Configuración | Sheet, PDF del portafolio, correo de Paula, texto base y link de agenda |
| 🧾 Normalizar solicitud | Limpia los campos, valida el correo y personaliza el texto de Paula |
| ✅ Responder al sitio | Devuelve `{ok:true}` de inmediato para que el formulario confirme |
| ❓ ¿Tiene correo válido? | Bifurca: con correo se responde, sin correo se escala |
| 🔔 Avisar a Paula | Correo con todos los datos de la solicitud |
| 📎 Descargar portafolio (PDF) | Baja el PDF de Drive para adjuntarlo |
| 📤 Enviar portafolio al cliente | Correo al cliente con el PDF y el botón **Agendar reunión** |
| ⚠️ Avisar a Paula (revisar) | Rama sin correo válido: hay que responder a mano |
| 🧾 Registrar solicitud | Agrega la fila en el Sheet de siempre |

## Detalles que importan

- **Se responde al sitio antes de mandar los correos.** El formulario no tiene que esperar a Drive ni a Gmail: confirma en menos de un segundo y el resto del flujo sigue corriendo. Si algo falla después, se ve en la ejecución de n8n y en el Sheet, no en la cara del visitante.
- **El aviso a Paula va antes del correo al cliente.** Si Drive o Gmail fallan, Paula ya se enteró de la solicitud: es preferible perder el automatismo que perder el contacto.
- **Sin correo válido no se envía nada al cliente.** La fila queda como `REVISAR - sin correo` y Paula recibe el aviso para responder a mano. Es a propósito: mejor eso que mandar un portafolio a una dirección inventada.
- **El registro escribe en modo `RAW`.** Google Sheets evalúa como fórmula toda celda que empiece por `+`, `=`, `-` o `@`: un teléfono `+57 300…` quedaría en `#ERROR!`.
- **`NIT`, `CARGO` y `DIRECCION` van vacías.** El formulario de la página nueva no los pide —se quitaron para reducir fricción—. El sector y el origen quedan en `OBSERVACION`.
- **El texto del correo vive en ⚙️ Configuración**, no en el código: se cambia ahí, sin tocar nodos.

## Probarlo

Con el workflow activo, desde una terminal:

```bash
curl -X POST "<PRODUCTION_URL>" \
  -H "Content-Type: application/json" \
  -d '{
    "origen": "servicios",
    "empresa": "Prueba SAS",
    "nombre": "Nombre de prueba",
    "email": "tu-correo@ejemplo.com",
    "telefono": "3001112233",
    "ciudad": "Medellín",
    "servicio": "Servicios temporales",
    "mensaje": "Prueba del flujo nuevo."
  }'
```

Debe responder `{"ok":true}` y, en menos de un minuto:

1. Llegar el aviso a `comercialbog@asignar.com.co`.
2. Llegar el portafolio al correo que se puso en `email`, con el botón **Agendar reunión con Paula**.
3. Aparecer la fila en el Sheet con `ESTADO = Portafolio enviado` y `id` empezando por `web-`.

Después, la prueba de punta a punta: llenar el formulario en `/servicios` o `/contacto` del sitio ya desplegado con la variable configurada. El formulario debe decir **"Recibimos tu solicitud"** (si dice "Tu solicitud está lista para enviar" y abre el correo, es que cayó al respaldo: falta la variable o el webhook no respondió).

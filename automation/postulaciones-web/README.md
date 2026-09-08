# Postulaciones Web → n8n

Flujo que recibe las postulaciones del portal `/vacantes`, las enruta al equipo de selección de la ciudad y las registra.

```
Sitio  →  POST /api/postulacion  →  webhook n8n  →  Drive + Gmail + Sheets
```

El sitio **no conoce el correo del reclutador**: envía el `id` de la vacante y este flujo lo resuelve leyendo el Sheet con sus propias credenciales.

## Documentos

| Documento | Para qué | Quién debe tener acceso |
|---|---|---|
| [`Vacantes`](https://docs.google.com/spreadsheets/d/1c52d83mBFfV0f4HLmn0MCgAw-P_aMkJXIerXpenJ9Yw/edit) | Catálogo que publica el portal | Todo vinculación (edición) |
| [`Postulaciones Web`](https://docs.google.com/spreadsheets/d/1LwXlhlJT5LN_aOQ3eFS3HurYmgNlpxksZvnQBLG6sug/edit) | Registro de quienes se postulan | **Restringido** |

Van **separados a propósito**: el de vacantes se comparte con todo el equipo para que registren, mientras que el de postulaciones acumula datos personales de candidatos (nombre, documento, teléfono) y debe tener acceso más restringido. En un solo documento ambos compartirían permisos.

Los dos ya están creados y con sus encabezados. Los nodos de Sheets apuntan a la pestaña por **`gid`**, no por nombre, así que renombrarlas no rompe nada:

| Documento | Pestaña | `gid` |
|---|---|---|
| `Vacantes` | `Vacantes` | `308421811` |
| `Postulaciones Web` | `Untitled` | `91274160` |

El `gid` no siempre es `0`, ni siquiera en la primera pestaña de un documento recién creado. Sale de la URL del documento, después de `#gid=`, con la pestaña abierta.

### Cómo queda en Drive

```
1_Marketing 2026/
└── Webpage_Vacantes/           ← NO compartir la carpeta
    ├── Vacantes                ← compartir este ARCHIVO con vinculación
    ├── Postulaciones Web       ← restringido
    └── Hojas de vida/          ← restringido (aquí las sube n8n)
```

**Compartir el archivo `Vacantes`, nunca la carpeta.** En Drive los permisos se heredan hacia abajo: si se comparte `Webpage_Vacantes` para que vinculación edite las vacantes, con ella se van también las postulaciones y las hojas de vida de los candidatos.

## Puesta en marcha

### 1. Importar el flujo

En n8n: *Workflows → Import from File* → `postulaciones-web.n8n.json`.

Los IDs de los dos documentos y de la carpeta ya vienen puestos en **⚙️ Configuración**. Solo queda:

- **Verificar una por una las credenciales de los tres nodos de Google.** Es el paso que más se rompe: al importar, n8n no siempre respeta la credencial del archivo y engancha la primera del mismo tipo que encuentra, que puede ser la de otra persona. El flujo debe quedar así:

  | Nodo | Credencial |
  |---|---|
  | 📋 Leer vacantes · 🧾 Registrar postulación | `Google Sheets account 2` |
  | 📎 Subir hoja de vida a Drive | `Google Drive account 2` |
  | ✉️ Notificar (las dos) | `Gmail account` |

  Las tres deben estar conectadas a **marketingdigital@asignar.com.co**. Abriendo la credencial en n8n se ve a qué cuenta de Google pertenece. Si Drive queda con la cuenta equivocada, esa cuenta no ve la carpeta `Hojas de vida` —que está restringida a propósito— y **la subida falla en silencio**: el correo sale, la fila se registra, pero la hoja de vida no queda en Drive.
- Activar el workflow y copiar la **Production URL** del nodo webhook.

### 2. Conectar el sitio

En Vercel, variables de entorno:

| Variable | Valor |
|---|---|
| `N8N_POSTULACION_WEBHOOK` | La Production URL del webhook |
| `VACANTES_SHEET_ID` | `1c52d83mBFfV0f4HLmn0MCgAw-P_aMkJXIerXpenJ9Yw` |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | El `client_email` del JSON de la cuenta de servicio |
| `GOOGLE_SERVICE_ACCOUNT_KEY` | El `private_key` del mismo JSON, completo |

La cuenta de servicio necesita la **Google Sheets API habilitada** en su proyecto, y hay que compartirle el documento `Vacantes` como **Lector** usando su correo (`...@....iam.gserviceaccount.com`).

Mientras `N8N_POSTULACION_WEBHOOK` no exista, el formulario **cae automáticamente al envío por correo**, así que se puede activar sin prisa.

Las variables en Vercel solo entran a jugar en el **siguiente deploy**: después de crearlas hay que hacer *Redeploy*. Y hay que marcarlas para el entorno donde se quieran probar (Production / Preview / Development) — si solo quedan en Production, el preview del PR sigue mostrando la lista de respaldo.

## Qué hace cada nodo

| Nodo | Qué hace |
|---|---|
| 📥 Postulación (webhook) | Recibe el formulario (multipart; la hoja de vida llega como binario) |
| ⚙️ Configuración | IDs del Sheet y la carpeta, correo de respaldo y de copia |
| 📋 Leer vacantes | Lee la primera pestaña del documento `Vacantes` |
| 🧠 Resolver reclutador | Busca la fila con ese `id` y saca `correo_reclutador`; arma asunto y cuerpo |
| ❓ ¿Adjuntó hoja de vida? | Bifurca según venga o no archivo |
| 📎 Subir a Drive | Guarda la HV como `Nombre_Cargo_Cédula.pdf` |
| ✉️ Notificar (2 variantes) | Envía al reclutador, con copia a marketing, con la HV adjunta |
| 🧾 Registrar postulación | Agrega la fila en `Postulaciones Web` |
| ✅ Responder al sitio | Devuelve `{ok: true}` para que el formulario muestre el éxito |

## Detalles que importan

- **`vacanteId` es el `id` de la columna O**, no la posición de la fila. Por eso ordenar o insertar filas ya no reasigna nada. Si el id no cuadra con ninguna fila, el flujo **no se cae**: enruta a `contratacion2@`, marca `ENRUTADO_OK = NO` y avisa en el correo para revisar a mano.
- **Hay un respaldo por número de fila.** Si la columna `id` está vacía —o para enlaces viejos que sigan circulando—, se cae al comportamiento anterior. Deja de aplicar en cuanto la columna esté llena.
- **`AUTORIZA_MARKETING`** viene del consentimiento **separado y opcional** del formulario. Solo las filas en `SI` pueden entrar a campañas de email marketing: el consentimiento obligatorio cubre el proceso de selección, no usos comerciales (Ley 1581 de 2012).
- Los nodos de Drive y Sheets usan `continueRegularOutput`: si Drive o el registro fallan, **el correo al reclutador igual sale**. Es preferible perder la trazabilidad que perder la postulación.
- **Un fallo de Drive se ve en la columna `HOJA_DE_VIDA`.** Ahí queda `NO SE SUBIO A DRIVE …` con el motivo, en vez del enlace. Antes decía `adjunta al correo`, que es también lo que dice una postulación sin archivo: las dos situaciones se veían igual y un fallo podía pasar meses sin que nadie lo notara.
- **El nombre del archivo es `Nombre_Cargo_Cédula`** más la extensión original. La cédula va al final porque es lo único irrepetible: dos «Auxiliar de Cocina» que se llamen igual solo se distinguen por el documento.
- **El registro escribe en modo `RAW`.** Google Sheets evalúa como fórmula toda celda que empiece por `+`, `=`, `-` o `@`: un teléfono escrito como `+57 300…` quedaría en `#ERROR!`. Y en modo normal un documento con ceros a la izquierda los perdería al convertirse en número.
- **Drive y Gmail cuelgan en paralelo del IF**, no uno detrás del otro. El nodo de Google Drive no reenvía el archivo binario que recibe —su salida son los metadatos del archivo ya subido—, así que un Gmail encadenado después se queda sin nada que adjuntar. Colgando ambos del mismo punto, los dos reciben el ítem que todavía trae la hoja de vida.

## Probarlo

Con el workflow activo, desde una terminal:

```bash
curl -X POST "<PRODUCTION_URL>" \
  -F vacanteId=7 \
  -F cargo="Mesero/a de Servicio" \
  -F ciudad="Medellín" \
  -F nombre="Prueba Candidato" \
  -F tipoDocumento=CC \
  -F documento=1020304050 \
  -F edad=28 \
  -F telefono=3001112233 \
  -F autorizaDatos=true \
  -F autorizaMarketing=true \
  -F "hojaVida=@/ruta/a/hoja-de-vida.pdf"
```

Debe responder `{"ok":true}`, llegar el correo a `seleccion4@` (Medellín) y aparecer la fila en `Postulaciones Web`.

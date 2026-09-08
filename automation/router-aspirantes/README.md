# Router de Aspirantes → n8n

Limpia la bandeja `marketingdigital@asignar.com.co`: clasifica cada correo que
entra, y si es una postulación la reenvía al equipo de selección de la ciudad.

```
Gmail Trigger → leer el correo → Claude clasifica → reenviar / revisar / archivar
```

## Qué hace cada rama

| Categoría | Qué pasa |
|---|---|
| No es postulación | Se queda en el inbox, sin tocar |
| Postulación con ciudad | Se reenvía al correo de esa ciudad y **se borra** del buzón |
| Postulación sin ciudad | Va a `contratacion2@` para revisión manual y **se borra** |
| Postulación anterior a 2025 | Se etiqueta como archivo histórico |

Las ciudades y sus correos están en el nodo **Parsear Respuesta** (`getEmailForCiudad`).
Agregar una ciudad es agregar una línea ahí y otra en `CIUDADES_TEXTO` del nodo
**Preparar Prompt**, que es lo que ve el modelo.

## Credenciales

Al importar, n8n no siempre respeta la credencial del archivo: engancha la
primera del mismo tipo que encuentra, que puede ser la de otra persona.
**Revisar nodo por nodo después de importar.**

| Nodo | Credencial | Cuenta |
|---|---|---|
| Todos los de Gmail (9) | `Gmail account` | `marketingdigital@asignar.com.co` |
| Claude - Clasificar Email | `Anthropic account` | — |

## Detalles que importan

- **El correo que se procesa es el del trigger.** El nodo *Gmail - Leer correo
  del trigger* hace un `get` por `messageId`. Antes hacía `getAll` con
  `limit: 1` sobre el INBOX, es decir leía **«el más reciente»** y descartaba el
  que había reportado el trigger. Casi siempre coincidían, pero si entraba otro
  correo entre el disparo y la lectura, el flujo clasificaba, reenviaba y
  borraba el correo equivocado.

- **El borrado es permanente.** Los nodos *Gmail - Eliminar* usan la operación
  `delete`, que pega contra `DELETE /messages/{id}`: **no pasa por la papelera**
  y no hay forma de recuperar el correo. El nodo de Gmail de n8n no ofrece una
  operación «mover a papelera»; si algún día se quiere algo reversible, la
  alternativa es `removeLabels` con `INBOX`, que archiva el correo y lo deja
  buscable en «Todos», tal como ya hace la rama de Marketing.

- **El adjunto viaja como binario.** Los nodos de lectura llevan
  `downloadAttachments: true` y los *Merge Binario* renombran los adjuntos a
  `attachment_0`, `attachment_1`… porque el nodo de Gmail solo sabe adjuntar
  propiedades con nombre fijo. Hoy solo se reenvía `attachment_0`: si una
  postulación trae dos archivos, el segundo no se adjunta.

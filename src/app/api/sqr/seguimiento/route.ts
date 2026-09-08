import { NextResponse } from "next/server";
import { encabezadosSqr, leerEstado } from "@/lib/sqr-servidor";

/**
 * Consulta el estado de una SQR en el sistema de SQR (el de Juan).
 *
 * Pide radicado **y** documento a propósito: el estado de un caso trae datos
 * personales, y el radicado por sí solo es adivinable (son consecutivos). La
 * validación de que los dos correspondan al mismo caso la hace el sistema de
 * SQR; aquí solo se exige que vengan ambos.
 *
 * Configuración: SQR_API_SEGUIMIENTO (+ SQR_API_TOKEN opcional).
 */

export async function POST(request: Request) {
  const endpoint = process.env.SQR_API_SEGUIMIENTO;
  if (!endpoint) {
    return NextResponse.json(
      { ok: false, motivo: "sqr_no_configurado" },
      { status: 503 }
    );
  }

  let datos: Record<string, unknown>;
  try {
    datos = await request.json();
  } catch {
    return NextResponse.json({ ok: false, motivo: "json_invalido" }, { status: 400 });
  }

  const radicado = String(datos.radicado ?? "").trim().slice(0, 100);
  const documento = String(datos.documento ?? "").trim().replace(/[.\s]/g, "").slice(0, 40);

  if (!radicado || !documento) {
    return NextResponse.json({ ok: false, motivo: "campos_faltantes" }, { status: 400 });
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: encabezadosSqr(),
      body: JSON.stringify({ radicado, documento }),
      signal: AbortSignal.timeout(12_000),
    });

    if (res.status === 404) {
      return NextResponse.json({ ok: false, motivo: "no_encontrado" }, { status: 200 });
    }

    const respuesta = await res.json().catch(() => null);
    if (!res.ok) throw new Error(`SQR respondió ${res.status}`);

    const estado = leerEstado(respuesta);
    if (!estado) {
      // El sistema contestó, pero sin estado: para el usuario es lo mismo que
      // no encontrarlo, y así no mostramos una tarjeta vacía.
      return NextResponse.json({ ok: false, motivo: "no_encontrado" }, { status: 200 });
    }

    return NextResponse.json({ ok: true, ...estado });
  } catch (error) {
    console.error("[sqr] No se pudo consultar el estado:", error);
    return NextResponse.json({ ok: false, motivo: "sqr_no_disponible" }, { status: 502 });
  }
}

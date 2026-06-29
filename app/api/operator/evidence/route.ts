import { NextResponse } from "next/server";
import { z } from "zod";
import { getOperatorEvidenceForPlate } from "@/lib/operator/evidence-repository";
import { isValidPlate, normalizePlate } from "@/lib/plates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const evidenceQuerySchema = z.object({
  plate: z
    .string()
    .trim()
    .refine(isValidPlate, "Ingresa una placa valida.")
    .transform(normalizePlate)
});

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const parsed = evidenceQuerySchema.safeParse({
      plate: url.searchParams.get("plate") ?? url.searchParams.get("placa") ?? ""
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: "Datos invalidos.",
          issues: parsed.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const evidenceRows = await getOperatorEvidenceForPlate(parsed.data.plate);
    const evidence = evidenceRows.map((row) => ({
      id: row.id,
      sourceId: row.sourceId,
      sourceName: row.sourceName,
      sourceCategory: row.sourceCategory,
      status: row.status,
      confidenceLevel: row.confidenceLevel,
      summary: row.summary,
      checkedAt: row.checkedAt,
      updatedAt: row.updatedAt
    }));

    return NextResponse.json({
      ok: true,
      plate: parsed.data.plate,
      evidence
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        ok: false,
        error: "No se pudo consultar la evidencia del operador."
      },
      { status: 500 }
    );
  }
}

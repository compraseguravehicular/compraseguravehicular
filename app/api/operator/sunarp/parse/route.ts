import { NextResponse } from "next/server";
import { z } from "zod";
import { isValidPlate, normalizePlate } from "@/lib/plates";
import { updateOrderSourceResult } from "@/lib/orders/repository";
import { saveSunarpOperatorEvidence } from "@/lib/operator/evidence-repository";
import { parseSunarpEvidence } from "@/lib/operator/sunarp-parser";

export const runtime = "nodejs";

const parseSunarpSchema = z.object({
  plate: z
    .string()
    .trim()
    .refine(isValidPlate, "Ingresa una placa valida.")
    .transform(normalizePlate),
  rawText: z
    .string()
    .trim()
    .min(20, "Pega el texto o HTML del resultado oficial.")
    .max(40000, "La evidencia pegada es demasiado grande."),
  evidenceUrl: z
    .string()
    .trim()
    .url("URL de evidencia no valida.")
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined)),
  sourceResultId: z
    .string()
    .trim()
    .uuid("ID de fuente no valido.")
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined))
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = parseSunarpSchema.safeParse(body);

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

    const result = parseSunarpEvidence(parsed.data);
    const [savedSource, savedOperatorEvidence] = await Promise.all([
      parsed.data.sourceResultId
        ? updateOrderSourceResult({
            id: parsed.data.sourceResultId,
            status: result.statusSuggestion,
            confidenceLevel: result.confidenceLevel,
            summary: result.summary,
            evidenceUrl: parsed.data.evidenceUrl
          })
        : Promise.resolve(undefined),
      saveSunarpOperatorEvidence({
        plate: parsed.data.plate,
        result,
        rawText: parsed.data.rawText,
        evidenceUrl: parsed.data.evidenceUrl
      })
    ]);

    return NextResponse.json({
      ok: true,
      result,
      savedSource,
      savedOperatorEvidence
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        ok: false,
        error: "No se pudo analizar la evidencia SUNARP."
      },
      { status: 500 }
    );
  }
}

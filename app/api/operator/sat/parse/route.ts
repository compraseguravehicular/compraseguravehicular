import { NextResponse } from "next/server";
import { z } from "zod";
import { updateOrderSourceResult } from "@/lib/orders/repository";
import { saveOperatorEvidence } from "@/lib/operator/evidence-repository";
import { parseSatEvidence } from "@/lib/operator/sat-parser";
import { isValidPlate, normalizePlate } from "@/lib/plates";

export const runtime = "nodejs";

const parseSatSchema = z.object({
  plate: z
    .string()
    .trim()
    .refine(isValidPlate, "Ingresa una placa valida.")
    .transform(normalizePlate),
  rawText: z
    .string()
    .trim()
    .min(20, "Pega el texto, HTML o captura OCR del resultado SAT.")
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
    .transform((value) => (value ? value : undefined)),
  persist: z.boolean().optional().default(true)
});

const persistableStatuses = new Set([
  "consulted_no_alert",
  "consulted_with_alert"
]);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = parseSatSchema.safeParse(body);

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

    const result = parseSatEvidence(parsed.data);
    const shouldSaveOperatorEvidence = persistableStatuses.has(
      result.statusSuggestion
    ) && parsed.data.persist;
    const [savedSource, savedOperatorEvidence] = await Promise.all([
      parsed.data.sourceResultId && parsed.data.persist
        ? updateOrderSourceResult({
            id: parsed.data.sourceResultId,
            status: result.statusSuggestion,
            confidenceLevel: result.confidenceLevel,
            summary: result.summary,
            evidenceUrl: parsed.data.evidenceUrl
          })
        : Promise.resolve(undefined),
      shouldSaveOperatorEvidence
        ? saveOperatorEvidence({
            plate: parsed.data.plate,
            result,
            sourceCategory: "deudas",
            rawText: parsed.data.rawText,
            evidenceUrl: parsed.data.evidenceUrl,
            ingestion: "operator_ocr"
          })
        : Promise.resolve(undefined)
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
        error: "No se pudo analizar la evidencia SAT."
      },
      { status: 500 }
    );
  }
}

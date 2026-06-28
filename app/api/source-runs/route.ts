import { NextResponse } from "next/server";
import { z } from "zod";
import { isValidPlate, normalizePlate } from "@/lib/plates";
import { runVehicleSourcePlan, sourceRunMetrics } from "@/lib/sources/runner";

export const runtime = "nodejs";

const sourceRunSchema = z.object({
  plate: z
    .string()
    .trim()
    .refine(isValidPlate, "Ingresa una placa valida.")
    .transform(normalizePlate),
  packageType: z.enum(["express", "compra_segura", "pro"]).default("compra_segura")
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = sourceRunSchema.safeParse(body);

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

    const results = runVehicleSourcePlan(
      parsed.data.plate,
      parsed.data.packageType
    );

    return NextResponse.json({
      ok: true,
      plate: parsed.data.plate,
      packageType: parsed.data.packageType,
      metrics: sourceRunMetrics(results),
      results
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        ok: false,
        error: "No se pudo preparar el plan de fuentes."
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { isValidPlate, normalizePlate } from "@/lib/plates";
import { runLivePlateReport } from "@/lib/live-sources/report";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const liveReportSchema = z.object({
  plate: z
    .string()
    .trim()
    .refine(isValidPlate, "Ingresa una placa valida.")
    .transform(normalizePlate),
  packageType: z.enum(["express", "compra_segura", "pro"]).default("pro")
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = liveReportSchema.safeParse(body);

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

    const report = await runLivePlateReport(parsed.data);

    return NextResponse.json({
      ok: true,
      report
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        ok: false,
        error: "No se pudo generar el reporte en vivo."
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { updateOrderSourceResult } from "@/lib/orders/repository";
import { updateSourceResultSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const parsed = updateSourceResultSchema.safeParse(body);

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

    const source = await updateOrderSourceResult(parsed.data);

    return NextResponse.json({
      ok: true,
      source
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        ok: false,
        error: "No se pudo actualizar la fuente."
      },
      { status: 500 }
    );
  }
}

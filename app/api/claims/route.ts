import { NextResponse } from "next/server";
import { createCustomerClaim } from "@/lib/claims/repository";
import { normalizeMoney } from "@/lib/utils";
import { createClaimSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createClaimSchema.safeParse({
      ...body,
      amount: normalizeMoney(body.amount)
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

    const claim = await createCustomerClaim(parsed.data);

    return NextResponse.json({
      ok: true,
      claim
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        ok: false,
        error: "No se pudo registrar la solicitud."
      },
      { status: 500 }
    );
  }
}

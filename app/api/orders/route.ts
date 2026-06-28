import { NextResponse } from "next/server";
import { createVehicleCheck } from "@/lib/orders/repository";
import { packageLabels } from "@/lib/orders/pricing";
import { createOrderSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createOrderSchema.safeParse({
      ...body,
      mileage:
        body.mileage === "" || body.mileage === undefined
          ? undefined
          : Number(body.mileage)
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

    const order = await createVehicleCheck(parsed.data);
    const whatsappMessage = [
      "Hola, quiero iniciar mi reporte vehicular.",
      `Codigo: ${order.code}`,
      `Placa: ${order.plate}`,
      `Paquete: ${packageLabels[order.packageType]}`,
      `Monto: S/ ${order.totalPrice.toFixed(2)}`
    ].join("\n");

    return NextResponse.json({
      ok: true,
      order,
      whatsappMessage
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        ok: false,
        error: "No se pudo crear la orden."
      },
      { status: 500 }
    );
  }
}

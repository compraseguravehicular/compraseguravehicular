import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OrderSourceWorkspace } from "@/components/panel/order-source-workspace";
import { getOrderDetailByCode } from "@/lib/orders/repository";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Detalle operativo de orden",
  description:
    "Vista interna para ejecutar fuentes, registrar evidencias y preparar reporte.",
  robots: {
    index: false,
    follow: false
  }
};

export default async function OrderDetailPage({
  params
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const order = await getOrderDetailByCode(decodeURIComponent(code));

  if (!order) {
    notFound();
  }

  return <OrderSourceWorkspace order={order} />;
}

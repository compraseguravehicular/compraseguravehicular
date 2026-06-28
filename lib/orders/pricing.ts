import type { PackageType } from "@/lib/domain";

export const packagePrices: Record<PackageType, number> = {
  express: 19.9,
  compra_segura: 39.9,
  pro: 59
};

export const packageLabels: Record<PackageType, string> = {
  express: "Express",
  compra_segura: "Compra Segura",
  pro: "Pro"
};

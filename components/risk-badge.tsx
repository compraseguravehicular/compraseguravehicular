import { cn } from "@/lib/utils";

type RiskBadgeProps = {
  value: string;
};

export function RiskBadge({ value }: RiskBadgeProps) {
  const tone =
    value === "Rojo"
      ? "bg-redRisk text-white"
      : value === "Amarillo"
        ? "bg-amberRisk text-white"
        : value === "Verde"
          ? "bg-brand-700 text-white"
          : "bg-surface text-slateText";

  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center rounded-md px-2.5 text-xs font-semibold",
        tone
      )}
    >
      {value}
    </span>
  );
}

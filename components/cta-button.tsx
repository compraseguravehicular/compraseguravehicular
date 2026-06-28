import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type CtaButtonProps = {
  href: string;
  children: React.ReactNode;
  icon?: LucideIcon;
  variant?: "primary" | "secondary" | "light";
  eventName?: string;
  eventProperties?: Record<string, string | number | boolean>;
};

export function CtaButton({
  href,
  children,
  icon: Icon,
  variant = "primary",
  eventName,
  eventProperties
}: CtaButtonProps) {
  return (
    <Link
      href={href}
      data-track={eventName}
      data-track-props={
        eventProperties ? JSON.stringify(eventProperties) : undefined
      }
      className={cn(
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-md px-5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2",
        variant === "primary" &&
          "bg-brand-700 text-white hover:bg-brand-900 focus:ring-brand-700",
        variant === "secondary" &&
          "border border-ink/15 bg-white text-ink hover:border-brand-700 hover:text-brand-700 focus:ring-brand-700",
        variant === "light" &&
          "bg-white text-brand-900 hover:bg-brand-50 focus:ring-white"
      )}
    >
      {Icon ? <Icon aria-hidden="true" size={18} /> : null}
      {children}
    </Link>
  );
}

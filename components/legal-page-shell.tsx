import Link from "next/link";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

type LegalPageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function LegalPageShell({
  eyebrow,
  title,
  description,
  children
}: LegalPageShellProps) {
  return (
    <>
      <SiteHeader />
      <main className="bg-surface pt-16">
        <section className="border-b border-line bg-ink py-16 text-white">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <p className="text-sm font-semibold uppercase tracking-normal text-white/70">
              {eyebrow}
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-normal sm:text-5xl">
              {title}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-white/75">
              {description}
            </p>
          </div>
        </section>
        <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-md border border-line bg-white p-6 shadow-panel sm:p-8">
            <div className="prose-legal">{children}</div>
            <div className="mt-8 border-t border-line pt-5 text-sm text-slateText">
              <Link href="/" className="font-semibold text-brand-700 hover:text-brand-900">
                Volver al inicio
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

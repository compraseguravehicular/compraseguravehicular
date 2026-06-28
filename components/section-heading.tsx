type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  children?: React.ReactNode;
};

export function SectionHeading({ eyebrow, title, children }: SectionHeadingProps) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      {eyebrow ? (
        <p className="mb-3 text-sm font-semibold uppercase tracking-normal text-brand-700">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-3xl font-bold tracking-normal text-ink sm:text-4xl">
        {title}
      </h2>
      {children ? (
        <p className="mt-4 text-base leading-7 text-slateText">{children}</p>
      ) : null}
    </div>
  );
}

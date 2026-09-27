interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  centered?: boolean;
}

export default function SectionHeading({
  eyebrow,
  title,
  description,
  centered = false,
}: SectionHeadingProps) {
  return (
    <div
      className={[
        "max-w-2xl",
        centered ? "mx-auto text-center" : "",
      ].join(" ")}
    >
      {eyebrow && (
        <span className="mb-3 inline-block text-xs font-extrabold uppercase tracking-[0.16em] text-harvest-500">
          {eyebrow}
        </span>
      )}

      <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl lg:text-[46px]">
        {title}
      </h2>

      {description && (
        <p className="mt-4 text-sm leading-7 text-muted sm:text-base">
          {description}
        </p>
      )}
    </div>
  );
}
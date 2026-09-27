/**
 * One headline figure on the admin overview. Kept its own module because the
 * overview grid repeats it four times and the tone swatch is the only real
 * variation between cards.
 */
export default function StatCard({
  label,
  value,
  hint,
  icon,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
  tone: string;
}) {
  return (
    <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <span
          className={`grid size-10 shrink-0 place-items-center rounded-2xl text-white ${tone}`}
        >
          {icon}
        </span>

        <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted">
          {label}
        </p>
      </div>

      <p className="mt-4 text-2xl font-extrabold text-ink">{value}</p>
      <p className="mt-1 text-[11px] text-muted">{hint}</p>
    </div>
  );
}

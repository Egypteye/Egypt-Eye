// Form primitives for the OS.
//
// No directive at the top on purpose: these are presentational, so they work
// unchanged whether a server page or a client form imports them.
//
// Every text field that has common answers gets a <datalist>. That is the
// deliberate middle ground between a free-text box (fast to type, impossible
// to count) and a <select> (countable, and refuses the value somebody needs
// today). The suggestions appear as you type; anything else is still accepted.

export function Field({
  label,
  name,
  type = "text",
  defaultValue,
  placeholder,
  suggestions,
  required,
  disabled,
  hint,
  className = "",
  ...rest
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | number | null;
  placeholder?: string;
  suggestions?: readonly string[];
  required?: boolean;
  disabled?: boolean;
  hint?: string;
  className?: string;
  min?: string | number;
  step?: string | number;
}) {
  const listId = suggestions ? `${name}-suggestions-${label.replace(/\W+/g, "")}` : undefined;
  return (
    <label className={`block ${className}`}>
      <span className="block text-xs font-semibold uppercase tracking-wider text-ink-soft">
        {label}
        {required ? <span className="text-terracotta"> *</span> : null}
      </span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue ?? undefined}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        list={listId}
        autoComplete="off"
        className="mt-1 w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-ink shadow-sm disabled:bg-black/5 disabled:text-ink-soft"
        {...rest}
      />
      {suggestions ? (
        <datalist id={listId}>
          {suggestions.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>
      ) : null}
      {hint ? <span className="mt-1 block text-xs text-ink-soft/80">{hint}</span> : null}
    </label>
  );
}

export function TextArea({
  label,
  name,
  defaultValue,
  placeholder,
  rows = 2,
  disabled,
  hint,
  className = "",
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  hint?: string;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-xs font-semibold uppercase tracking-wider text-ink-soft">{label}</span>
      <textarea
        name={name}
        rows={rows}
        defaultValue={defaultValue ?? undefined}
        placeholder={placeholder}
        disabled={disabled}
        className="mt-1 w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-ink shadow-sm disabled:bg-black/5 disabled:text-ink-soft"
      />
      {hint ? <span className="mt-1 block text-xs text-ink-soft/80">{hint}</span> : null}
    </label>
  );
}

export function Select({
  label,
  name,
  options,
  defaultValue,
  disabled,
  className = "",
}: {
  label: string;
  name: string;
  options: readonly { value: string; label: string }[];
  defaultValue?: string | null;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-xs font-semibold uppercase tracking-wider text-ink-soft">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue ?? undefined}
        disabled={disabled}
        className="mt-1 w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-ink shadow-sm disabled:bg-black/5"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Checkbox({
  label,
  name,
  defaultChecked,
  disabled,
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
  disabled?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 py-1 text-sm font-medium text-ink">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        disabled={disabled}
        className="size-4 rounded border-black/25"
      />
      {label}
    </label>
  );
}

export function Panel({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-black/10 bg-cream shadow-sm">
      <div className="border-b border-black/5 px-4 py-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-ink">{title}</h2>
        {description ? <p className="mt-0.5 text-xs text-ink-soft">{description}</p> : null}
      </div>
      <div className="px-4 py-4">{children}</div>
      {footer ? <div className="border-t border-black/5 px-4 py-3">{footer}</div> : null}
    </section>
  );
}

/** A read-only panel body, for a role that may look but not change. */
export function ReadOnlyNotice({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg bg-black/5 px-3 py-2 text-xs text-ink-soft">{children}</p>
  );
}

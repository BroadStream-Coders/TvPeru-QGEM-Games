interface DescriptionInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
}

export function DescriptionInput({
  value,
  onChange,
  placeholder = "Añade una descripción...",
  className = "",
  rows = 2,
}: DescriptionInputProps) {
  return (
    <div className="px-4 py-3.5 shrink-0 border-b border-border/50 bg-muted/10">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={`block w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-hidden focus:ring-1 focus:ring-brand/40 transition-all resize-none ${className}`}
      />
    </div>
  );
}

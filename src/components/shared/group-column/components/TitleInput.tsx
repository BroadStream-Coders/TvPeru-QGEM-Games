interface TitleInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}

export function TitleInput({
  value,
  onChange,
  placeholder = "Escribe el título...",
  className = "",
}: TitleInputProps) {
  return (
    <div className="px-4 py-3.5 shrink-0 border-b border-border/50 bg-muted/10">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full h-8 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-hidden focus:ring-1 focus:ring-brand/40 transition-all ${className}`}
      />
    </div>
  );
}

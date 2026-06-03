import { Input } from "@/components/ui/input";

export function Inspector({
  name,
  onNameChange,
  active,
  onActiveChange,
}: {
  name: string;
  onNameChange: (value: string) => void;
  active: boolean;
  onActiveChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-background/40 p-2">
      <input
        type="checkbox"
        checked={active}
        onChange={(e) => onActiveChange(e.target.checked)}
        title={active ? "Objeto activo" : "Objeto apagado"}
        className="size-4 shrink-0 cursor-pointer accent-brand"
      />
      <Input
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder="Nombre"
        className="h-7 text-sm"
      />
    </div>
  );
}

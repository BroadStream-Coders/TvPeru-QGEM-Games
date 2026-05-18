import { ReactNode } from "react";
import { AddColumnButton } from "@/components/shared/group-column/components/AddColumnButton";

interface GroupsContainerProps {
  children: ReactNode;
  onAddGroup: () => void;
  addLabel?: string;
  className?: string;
}

export function GroupsContainer({
  children,
  onAddGroup,
  addLabel = "Agregar Grupo",
}: GroupsContainerProps) {
  return (
    <div className="h-full overflow-x-auto overflow-y-hidden">
      <div className="flex min-w-max gap-4 px-6 py-6 h-full">
        {children}
        <AddColumnButton onClick={onAddGroup} label={addLabel} />
      </div>
    </div>
  );
}

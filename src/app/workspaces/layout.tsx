import { WorkspaceHeader } from "@/components/shared/WorkspaceHeader";
import { AnimationsProvider } from "@engine/animations/AnimationsContext";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AnimationsProvider>
      <div className="flex h-screen flex-col bg-background text-foreground font-sans overflow-hidden">
        <WorkspaceHeader />
        <div className="flex flex-col flex-1 overflow-hidden">{children}</div>
      </div>
    </AnimationsProvider>
  );
}

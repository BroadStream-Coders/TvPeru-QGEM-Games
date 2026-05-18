import { WorkspaceHeader } from "@/components/shared/WorkspaceHeader";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen flex-col bg-background text-foreground font-sans overflow-hidden">
      <WorkspaceHeader />
      <div className="flex flex-col flex-1 overflow-hidden">{children}</div>

      <footer className="flex h-9 shrink-0 items-center justify-between border-t border-border px-6 bg-background">
        <span className="text-2xs text-muted-foreground font-mono">
          BroadStream Coders © {new Date().getFullYear()} — TV PERÚ QGEM APP
          CENTER
        </span>
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-success" />
          <span className="text-2xs text-muted-foreground font-mono uppercase tracking-wider">
            Workspace Active
          </span>
        </div>
      </footer>
    </div>
  );
}

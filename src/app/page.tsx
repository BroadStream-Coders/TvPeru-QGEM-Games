import Link from "next/link";
import { SpellCheck, ArrowRight, Trophy, FlaskConical } from "lucide-react";

const workspaces = [
  {
    name: "Deletreo",
    description: "Gestión de palabras por rondas",
    href: "/workspaces/deletreo",
    icon: SpellCheck,
  },
  {
    name: "Sandbox",
    description: "Compositor estilo OBS",
    href: "/workspaces/sandbox",
    icon: FlaskConical,
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground font-sans">
      {/* Top bar */}
      <header className="flex h-12 items-center border-b border-border px-6 bg-background/80 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <Trophy className="h-3.5 w-3.5" />
          </div>
          <span className="text-sm font-bold tracking-tight text-foreground/90">
            QGEM Studio
          </span>
        </div>
        <div className="ml-auto">
          <span className="rounded-full border border-border bg-muted/30 px-2.5 py-0.5 text-2xs font-bold text-muted-foreground uppercase tracking-widest">
            TV Perú
          </span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-5xl space-y-10">
          {/* Hero */}
          <div className="space-y-2 text-center">
            <p className="text-caption font-mono font-medium text-muted-foreground uppercase tracking-header">
              Workspaces de datos
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              Que Gane el Mejor
            </h1>
            <p className="text-sm text-muted-foreground">
              Selecciona un área de trabajo para comenzar la producción.
            </p>
          </div>

          {/* Module cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {workspaces.map((workspace) => (
              <Link
                key={workspace.href}
                href={workspace.href}
                className="group relative flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:border-brand/40 hover:bg-card/80 active:scale-[0.98] hover:shadow-lg hover:shadow-brand/5"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground group-hover:bg-brand/10 group-hover:text-brand transition-colors">
                  <workspace.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">
                    {workspace.name}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                    {workspace.description}
                  </p>
                </div>
                <div className="text-muted-foreground/20 transition-all group-hover:text-brand/60 group-hover:translate-x-0.5 pr-1">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      {/* Footer sticky to bottom */}
      <footer className="footer-home border-t border-border h-12 px-6 sm:px-8 flex items-center justify-between gap-4 bg-background/50 backdrop-blur-md">
        <p className="text-caption text-muted-foreground font-mono">
          BroadStream Coders © {new Date().getFullYear()} — TV PERÚ
        </p>
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-success/10 border border-success/20">
          <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse shadow-[0_0_8px_rgba(var(--success-rgb),0.5)]" />
          <span className="text-3xs font-mono font-bold text-success uppercase tracking-widest">
            Sistema activo
          </span>
        </div>
      </footer>
    </div>
  );
}

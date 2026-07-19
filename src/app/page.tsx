import Link from "next/link";
import {
  SpellCheck,
  ArrowRight,
  Trophy,
  FlaskConical,
  Calculator,
  VenetianMask,
  BookOpen,
  Zap,
  Images,
  BookHeart,
  FolderDown,
  Sigma,
} from "lucide-react";
import { AuthButton } from "@/components/shared/AuthButton";

const workspaces = [
  {
    name: "Deletreo",
    description: "Gestión de palabras por rondas",
    href: "/workspaces/deletreo",
    icon: SpellCheck,
  },
  {
    name: "Cálculo Mental",
    description: "Operaciones encadenadas por rondas",
    href: "/workspaces/calculo-mental",
    icon: Calculator,
  },
  {
    name: "Intruso",
    description: "Encuentra al elemento inconsistente",
    href: "/workspaces/intruso",
    icon: VenetianMask,
  },
  {
    name: "La Sabes o No",
    description: "Preguntas de dos opciones por grupos",
    href: "/workspaces/la-sabes-o-no",
    icon: BookOpen,
  },
  {
    name: "Al Vuelo",
    description: "Preguntas rápidas de sí o no",
    href: "/workspaces/al-vuelo",
    icon: Zap,
  },
  {
    name: "Álbum",
    description: "Cartas por temas con preguntas y fotos",
    href: "/workspaces/album",
    icon: Images,
  },
  {
    name: "Mi Libro Favorito",
    description: "Preguntas de libros con vidas por jugador",
    href: "/workspaces/mi-libro-favorito",
    icon: BookHeart,
  },
  {
    name: "Operaciones Combinadas",
    description: "Prototipo: pruebas de botones con mouse",
    href: "/workspaces/operaciones-combinadas",
    icon: Sigma,
  },
  {
    name: "Sandbox",
    description: "Compositor estilo OBS",
    href: "/workspaces/sandbox",
    icon: FlaskConical,
  },
];

const tools = [
  {
    name: "Sesiones",
    description: "Archivos de sesión subidos desde Studio",
    href: "/sesiones",
    icon: FolderDown,
  },
  {
    name: "Lab",
    description: "Demos aisladas de librerías, antes de producción",
    href: "/lab",
    icon: FlaskConical,
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-bg text-ink font-sans">
      {/* Top bar */}
      <header className="flex h-[34px] items-center border-b border-edge px-6 bg-head sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-acc-bg text-acc">
            <Trophy className="h-3.5 w-3.5" />
          </div>
          <span className="text-sm font-bold tracking-tight text-ink">
            QGEM Games
          </span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="rounded-full border border-line bg-elev px-2.5 py-0.5 text-2xs font-bold text-dim uppercase tracking-widest">
            TV Perú
          </span>
          <AuthButton />
        </div>
      </header>

      {/* Main content */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-5xl space-y-10">
          {/* Hero */}
          <div className="space-y-2 text-center">
            <p className="text-caption font-mono font-medium text-dim uppercase tracking-header">
              Workspaces de juegos
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-ink">
              Que Gane el Mejor
            </h1>
            <p className="text-sm text-dim">
              Selecciona un área de trabajo para comenzar la producción.
            </p>
          </div>

          {/* Module cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {workspaces.map((workspace) => (
              <Link
                key={workspace.href}
                href={workspace.href}
                className="group relative flex items-center gap-4 rounded-xl border border-line bg-panel p-4 transition-all hover:border-acc/50 hover:bg-panel-2 active:scale-[0.98] hover:shadow-lg hover:shadow-acc/5"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-elev text-dim group-hover:bg-acc-bg group-hover:text-acc transition-colors">
                  <workspace.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-ink truncate">
                    {workspace.name}
                  </p>
                  <p className="mt-0.5 text-xs text-dim line-clamp-1">
                    {workspace.description}
                  </p>
                </div>
                <div className="text-faint transition-all group-hover:text-acc group-hover:translate-x-0.5 pr-1">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            ))}
          </div>

          {/* Herramientas internas — separadas de los juegos */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-3xs font-mono font-bold text-faint uppercase tracking-widest">
                Herramientas internas
              </span>
              <div className="h-px flex-1 bg-edge" />
            </div>
            {tools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="group flex items-center gap-4 rounded-xl border border-dashed border-line bg-transparent p-4 transition-all hover:border-acc/40 hover:bg-panel/50"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-dashed border-line text-faint group-hover:border-acc/40 group-hover:text-acc transition-colors">
                  <tool.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-dim group-hover:text-ink truncate">
                    {tool.name}
                  </p>
                  <p className="mt-0.5 text-xs text-faint line-clamp-1">
                    {tool.description}
                  </p>
                </div>
                <div className="text-faint transition-all group-hover:text-acc group-hover:translate-x-0.5 pr-1">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      {/* Footer sticky to bottom */}
      <footer className="footer-home border-t border-edge h-12 px-6 sm:px-8 flex items-center justify-between gap-4 bg-head">
        <p className="text-caption text-dim font-mono">
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

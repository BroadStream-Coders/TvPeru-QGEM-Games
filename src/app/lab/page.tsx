import Link from "next/link";
import { ArrowRight, FlaskConical, Sparkles } from "lucide-react";

const demos = [
  {
    name: "motion",
    description:
      "Animaciones y transiciones entre pantallas (motion · ex-framer-motion) — magic move / slide / fade",
    href: "/lab/motion",
    icon: Sparkles,
  },
];

export default function Lab() {
  return (
    <div className="min-h-screen bg-bg text-ink font-sans">
      <header className="flex h-12 items-center gap-3 border-b border-edge bg-head px-6">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-acc-bg text-acc">
          <FlaskConical className="h-3.5 w-3.5" />
        </div>
        <span className="text-sm font-bold tracking-tight">Lab · demos de librerías</span>
      </header>

      <main className="mx-auto w-full max-w-3xl px-6 py-12">
        <p className="mb-6 text-sm text-dim">
          Pruebas aisladas de paquetes de la comunidad, antes de cablearlos a
          producción. Cada demo vive en <code className="text-acc">/lab/&lt;nombre&gt;</code>.
        </p>
        <div className="grid gap-3">
          {demos.map((d) => (
            <Link
              key={d.href}
              href={d.href}
              className="group flex items-center gap-4 rounded-xl border border-line bg-panel p-4 transition-all hover:border-acc/50 hover:bg-panel-2"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-elev text-dim group-hover:bg-acc-bg group-hover:text-acc">
                <d.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-ink">{d.name}</p>
                <p className="mt-0.5 text-xs text-dim">{d.description}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-faint transition-all group-hover:translate-x-0.5 group-hover:text-acc" />
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

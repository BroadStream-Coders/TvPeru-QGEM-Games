"use client";

import { useRef, useState } from "react";
import {
  DockviewReact,
  type DockviewApi,
  type DockviewReadyEvent,
  type IDockviewPanelProps,
  type IContextMenuItemComponentProps,
} from "dockview-react";
import "dockview-react/dist/styles/dockview.css";
import "./dockview-theme.css";

/* ---- Fake panel contents, just so each panel looks like something ---- */

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md bg-elev px-2.5 py-1.5">
      <span className="text-2xs uppercase tracking-widest text-faint">
        {label}
      </span>
      <span className="text-xs font-mono text-ink">{value}</span>
    </div>
  );
}

function InspectorPanel() {
  return (
    <div className="scrl h-full space-y-2 overflow-auto p-3">
      <p className="text-2xs uppercase tracking-widest text-dim">RectTransform</p>
      <Row label="Pos X" value="120" />
      <Row label="Pos Y" value="64" />
      <Row label="Width" value="480" />
      <Row label="Height" value="270" />
      <Row label="Rotation" value="0°" />
      <p className="pt-2 text-2xs uppercase tracking-widest text-dim">Image</p>
      <Row label="Source" value="logo.png" />
      <Row label="Fit" value="cover" />
    </div>
  );
}

function HierarchyPanel() {
  const items = ["Canvas", "  Background", "  Title", "  Logo", "  Score", "  Timer"];
  return (
    <div className="scrl h-full overflow-auto p-2 text-xs">
      {items.map((it, i) => (
        <div
          key={i}
          className={`cursor-default rounded px-2 py-1 font-mono whitespace-pre hover:bg-elev ${
            i === 3 ? "bg-acc-bg text-acc" : "text-ink"
          }`}
        >
          {it}
        </div>
      ))}
    </div>
  );
}

function ScenePanel() {
  return (
    <div className="grid h-full place-items-center bg-stage p-4">
      <div className="relative aspect-video w-full max-w-full rounded-md border border-line bg-[#0b0d0f] shadow-inner">
        <div className="absolute inset-0 grid place-items-center">
          <span className="text-xs text-faint">Scene viewport (16:9)</span>
        </div>
        <div className="absolute left-1/4 top-1/3 h-16 w-24 rounded border-2 border-dashed border-acc/70" />
      </div>
    </div>
  );
}

function GamePanel() {
  return (
    <div className="grid h-full place-items-center bg-black p-4">
      <div className="grid aspect-video w-full max-w-full place-items-center rounded-md bg-[#00B140]">
        <span className="rounded bg-black/40 px-3 py-1 text-xs text-white">
          Aquí iría &lt;FullScreen&gt; (broadcast)
        </span>
      </div>
    </div>
  );
}

function ConsolePanel() {
  const lines = [
    "[info] asset preloader: 12/12 decoded",
    "[info] session loaded — 6 objects",
    "[warn] no background set, using #000000",
    "[info] render 60fps",
  ];
  return (
    <div className="scrl h-full overflow-auto p-3 font-mono text-2xs leading-relaxed">
      {lines.map((l, i) => (
        <div key={i} className={l.includes("warn") ? "text-type-video" : "text-dim"}>
          {l}
        </div>
      ))}
    </div>
  );
}

function EmptyPanel(props: IDockviewPanelProps) {
  return (
    <div className="grid h-full place-items-center p-4 text-center">
      <div>
        <p className="text-sm text-ink">{props.api.title}</p>
        <p className="mt-1 text-2xs text-faint">Panel nuevo — arrástrame por la pestaña</p>
      </div>
    </div>
  );
}

const components = {
  inspector: InspectorPanel,
  hierarchy: HierarchyPanel,
  scene: ScenePanel,
  game: GamePanel,
  console: ConsolePanel,
  empty: EmptyPanel,
};

/* ---- Context-menu extra: float the tab ---- */

function FloatMenuItem({ panel, api, close }: IContextMenuItemComponentProps) {
  return (
    <div
      className="dv-context-menu-item"
      onClick={() => {
        api.addFloatingGroup(panel);
        close();
      }}
    >
      Float tab
    </div>
  );
}

/* ---- Toolbar button ---- */

function TbtnBase(
  props: React.ButtonHTMLAttributes<HTMLButtonElement>,
) {
  return (
    <button
      {...props}
      className="rounded-md border border-line bg-elev px-2.5 py-1 text-2xs font-medium text-ink transition-colors hover:bg-elev-2 disabled:opacity-40"
    />
  );
}

export default function DockviewLab() {
  const apiRef = useRef<DockviewApi | null>(null);
  const [savedLayout, setSavedLayout] = useState<string | null>(null);
  const [newCount, setNewCount] = useState(0);

  function buildDefault(api: DockviewApi) {
    const scene = api.addPanel({ id: "scene", component: "scene", title: "Scene" });
    api.addPanel({
      id: "game",
      component: "game",
      title: "Game",
      position: { referencePanel: scene.id, direction: "within" },
    });
    api.addPanel({
      id: "hierarchy",
      component: "hierarchy",
      title: "Hierarchy",
      position: { referencePanel: scene.id, direction: "left" },
    });
    api.addPanel({
      id: "inspector",
      component: "inspector",
      title: "Inspector",
      position: { referencePanel: scene.id, direction: "right" },
    });
    api.addPanel({
      id: "console",
      component: "console",
      title: "Console",
      position: { referencePanel: scene.id, direction: "below" },
    });
  }

  function onReady(event: DockviewReadyEvent) {
    apiRef.current = event.api;
    buildDefault(event.api);
  }

  const api = () => apiRef.current!;

  return (
    <div className="flex h-screen flex-col bg-bg text-ink">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-edge bg-head px-3 py-2">
        <span className="mr-2 text-xs font-bold tracking-tight">
          dockview · playground
        </span>

        <TbtnBase
          onClick={() => {
            const n = newCount + 1;
            setNewCount(n);
            api().addPanel({
              id: `new_${n}_${Date.now()}`,
              component: "empty",
              title: `Panel ${n}`,
            });
          }}
        >
          + Panel (tab)
        </TbtnBase>

        <TbtnBase
          onClick={() => {
            const n = newCount + 1;
            setNewCount(n);
            api().addPanel({
              id: `float_${n}_${Date.now()}`,
              component: "empty",
              title: `Flotante ${n}`,
              floating: { width: 320, height: 200, position: { top: 80, left: 120 } },
            });
          }}
        >
          + Panel flotante
        </TbtnBase>

        <TbtnBase
          onClick={() => {
            const g = api().activeGroup;
            if (g) api().addPopoutGroup(g);
          }}
        >
          Pop out grupo activo →
        </TbtnBase>

        <span className="mx-1 h-4 w-px bg-line" />

        <TbtnBase onClick={() => setSavedLayout(JSON.stringify(api().toJSON()))}>
          Guardar layout
        </TbtnBase>
        <TbtnBase
          disabled={!savedLayout}
          onClick={() => savedLayout && api().fromJSON(JSON.parse(savedLayout))}
        >
          Restaurar layout
        </TbtnBase>
        <TbtnBase
          onClick={() => {
            api().clear();
            buildDefault(api());
          }}
        >
          Reset
        </TbtnBase>
        <TbtnBase onClick={() => api().clear()}>Vaciar (watermark)</TbtnBase>

        <span className="ml-auto text-2xs text-faint">
          arrastra pestañas · resize por los bordes · click derecho en pestaña
        </span>
      </div>

      {/* Dock */}
      <div className="min-h-0 flex-1">
        <DockviewReact
          className="dockview-theme-abyss dv-qgem"
          components={components}
          onReady={onReady}
          getTabContextMenuItems={() => [
            "close",
            "separator",
            { component: FloatMenuItem },
          ]}
        />
      </div>
    </div>
  );
}

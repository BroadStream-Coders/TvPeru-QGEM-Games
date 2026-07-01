"use client";

import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import {
  DockviewReact,
  type DockviewApi,
  type DockviewReadyEvent,
} from "dockview-react";
import "dockview-react/dist/styles/dockview.css";
import "../../../components/shared/engine/dockview-theme.css";

import { Scene } from "@engine/Scene";
import { GameObjectView } from "@engine/GameObjectView";
import { SelectionOverlay } from "@engine/SelectionOverlay";
import { Hierarchy } from "@engine/Hierarchy";
import { GameObjectInspector } from "@engine/GameObjectInspector";
import { RectTransformInspector } from "@engine/RectTransformInspector";
import { AddComponentButton } from "@engine/AddComponentButton";
import { gameObjectKind } from "@engine/gameObject";
import {
  createComponentRegistry,
  NATIVE_COMPONENTS,
  ComponentRegistryProvider,
  type ComponentRegistry,
} from "@engine/componentRegistry";
import { useSceneEditor } from "@/hooks/use-scene-editor";

const registry: ComponentRegistry = createComponentRegistry(NATIVE_COMPONENTS);

type Editor = ReturnType<typeof useSceneEditor> & {
  editMode: boolean;
  setEditMode: Dispatch<SetStateAction<boolean>>;
  registry: ComponentRegistry;
};

const EditorContext = createContext<Editor | null>(null);

function useEditor() {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error("useEditor must be used inside EditorContext");
  return ctx;
}

function HierarchyPanel() {
  const e = useEditor();
  return (
    <div className="scrl h-full overflow-y-auto bg-panel p-3">
      <Hierarchy
        nodes={e.hierarchyNodes}
        selectedId={e.selectedId}
        onSelect={e.setSelectedId}
        onCreate={(parentId) => e.createNewGameObject(parentId ?? undefined)}
        onDelete={e.deleteGameObject}
        onReorder={e.handleReorder}
        onToggleActive={(id, active) => e.patchGameObject(id, { active })}
      />
    </div>
  );
}

function InspectorPanel() {
  const e = useEditor();
  const selected = e.selected;
  return (
    <div className="scrl flex h-full flex-col overflow-y-auto bg-panel">
      {selected ? (
        <>
          <GameObjectInspector
            name={selected.name}
            kind={gameObjectKind(selected.components)}
            onNameChange={(name) => e.patchGameObject(selected.id, { name })}
            active={selected.active}
            onActiveChange={(active) =>
              e.patchGameObject(selected.id, { active })
            }
          />
          <RectTransformInspector
            transform={selected.transform}
            setAxis={e.setAxis}
            setRotation={e.setRotation}
            editMode={e.editMode}
            onToggleEdit={() => e.setEditMode((v) => !v)}
          />
          {selected.components.map((component, index) => {
            const Editor = e.registry.get(component.type)?.editor;
            return Editor ? (
              <Editor
                key={index}
                component={component}
                onChange={(next) => e.patchComponent(selected.id, index, next)}
                onRemove={() => e.removeComponent(selected.id, index)}
                onResize={(size) => e.setGameObjectSize(selected.id, size)}
                onAddComponent={(type) => e.addComponent(selected.id, type)}
              />
            ) : null;
          })}
          <AddComponentButton
            options={e.registry.options}
            onAdd={(type) => e.addComponent(selected.id, type)}
          />
        </>
      ) : (
        <p className="p-3 text-2xs text-dim">
          Crea un objeto con click derecho en Hierarchy.
        </p>
      )}
    </div>
  );
}

function ScenePanel() {
  const e = useEditor();
  return (
    <Scene viewMode="scene">
      <div ref={e.stageRef} className="absolute inset-0">
        {e.gameObjects
          .filter((go) => !go.parentId && go.active)
          .map((go) => (
            <GameObjectView
              key={go.id}
              gameObject={go}
              allGameObjects={e.gameObjects}
              selectedId={e.selectedId}
            />
          ))}
      </div>
      {e.editMode && (
        <SelectionOverlay
          selected={e.selected}
          allGameObjects={e.gameObjects}
          onGesture={e.beginGesture}
        />
      )}
    </Scene>
  );
}

function GamePanel() {
  const e = useEditor();
  return (
    <Scene viewMode="game" showFullscreenButton hideCursorOnFullscreen>
      <div className="absolute inset-0">
        {e.gameObjects
          .filter((go) => !go.parentId && go.active)
          .map((go) => (
            <GameObjectView
              key={go.id}
              gameObject={go}
              allGameObjects={e.gameObjects}
              selectedId={null}
            />
          ))}
      </div>
    </Scene>
  );
}

function AssetsPanel() {
  return (
    <div className="scrl flex h-full items-center justify-center overflow-auto bg-panel p-3">
      <p className="text-2xs text-faint">Ninguno cargado.</p>
    </div>
  );
}

const components = {
  hierarchy: HierarchyPanel,
  inspector: InspectorPanel,
  scene: ScenePanel,
  game: GamePanel,
  assets: AssetsPanel,
};

function buildDefaultLayout(api: DockviewApi) {
  const scene = api.addPanel({ id: "scene", component: "scene", title: "Scene" });
  api.addPanel({
    id: "game",
    component: "game",
    title: "Game",
    position: { referencePanel: "scene", direction: "within" },
  });
  api.addPanel({
    id: "hierarchy",
    component: "hierarchy",
    title: "Hierarchy",
    initialWidth: 262,
    position: { referencePanel: "scene", direction: "left" },
  });
  api.addPanel({
    id: "inspector",
    component: "inspector",
    title: "Inspector",
    initialWidth: 336,
    position: { referencePanel: "scene", direction: "right" },
  });
  api.addPanel({
    id: "assets",
    component: "assets",
    title: "Assets",
    initialHeight: 180,
    position: { referencePanel: "scene", direction: "below" },
  });
  scene.api.setActive();
}

export function EditorDock() {
  const editor = useSceneEditor({ registry });
  const [editMode, setEditMode] = useState(false);

  const value: Editor = { ...editor, editMode, setEditMode, registry };

  function onReady(event: DockviewReadyEvent) {
    buildDefaultLayout(event.api);
  }

  return (
    <ComponentRegistryProvider value={registry}>
      <EditorContext.Provider value={value}>
        <div className="min-h-0 flex-1">
          <DockviewReact
            className="dockview-theme-abyss dv-qgem"
            components={components}
            onReady={onReady}
          />
        </div>
      </EditorContext.Provider>
    </ComponentRegistryProvider>
  );
}

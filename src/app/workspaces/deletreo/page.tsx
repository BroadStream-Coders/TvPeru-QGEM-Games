"use client";

import { useEffect, useState } from "react";
import { SpellCheck, FileJson } from "lucide-react";
import { AssetsBar, AssetTile, AssetLoaderTiles } from "@engine/AssetsBar";
import { useWorkspaceHeader } from "@/hooks/use-workspace-header";
import { useAssetPreloader } from "@/hooks/use-asset-preloader";
import type { AssetKind } from "@/helpers/asset-preloader";
import { toManifest, type AssetCatalog } from "@/helpers/asset-source";
import { SHARED_ASSETS } from "@/assets/shared";
import { DELETREO_ASSETS } from "./assets";
import { useGameKeys } from "@/hooks/use-game-keys";
import { useSceneEditor } from "@/hooks/use-scene-editor";
import { playSound } from "@/lib/audio";

import { Scene } from "@engine/Scene";
import { DESIGN_WIDTH, DESIGN_HEIGHT } from "@engine/RectTransform";
import { GameObjectView } from "@engine/GameObjectView";
import { SelectionOverlay } from "@engine/SelectionOverlay";
import { spellframeDefinition } from "./components/spellframe";
import { createSpellframeComponent } from "./components/spellframe/spellframeComponent";
import { controllerDefinition } from "./components/controller";
import {
  ControllerComponent,
  createControllerComponent,
} from "./components/controller/controllerComponent";
import { SidePanel } from "@engine/SidePanel";
import { Hierarchy } from "@engine/Hierarchy";
import { GameObjectInspector } from "@engine/GameObjectInspector";
import { RectTransformInspector } from "@engine/RectTransformInspector";
import {
  GameObjectComponent,
  createGameObject,
  gameObjectKind,
} from "@engine/gameObject";
import {
  createComponentRegistry,
  NATIVE_COMPONENTS,
  ComponentRegistryProvider,
} from "@engine/componentRegistry";
import { AddComponentButton } from "@engine/AddComponentButton";
import {
  ImageComponent,
  createImageComponent,
} from "@engine/components/image/imageComponent";
import { createColorComponent } from "@engine/components/color/colorComponent";
import { createPopComponent } from "@engine/components/pop/popComponent";
import { createShakeComponent } from "@engine/components/shake/shakeComponent";
import { createBounceComponent } from "@engine/components/bounce/bounceComponent";
import { createSlideComponent } from "@engine/components/slide/slideComponent";
import { useAnimations } from "@engine/animations/AnimationsContext";

const CATALOG: AssetCatalog = {
  correct: SHARED_ASSETS.correctSound,
  incorrect: SHARED_ASSETS.incorrectSound,
  ...DELETREO_ASSETS,
};

const ASSETS = toManifest(CATALOG);

const ASSET_KINDS: Record<string, AssetKind> = Object.fromEntries(
  Object.entries(CATALOG).map(([key, entry]) => [key, entry.kind]),
);

const ANCHOR_ID = "frame-anchor";
const FRAME_ID = "main-frame";
const TEXT_ID = "text";
const CONTROLLER_ID = "controller";

const registry = createComponentRegistry([
  ...NATIVE_COMPONENTS,
  spellframeDefinition,
  controllerDefinition,
]);

export default function DeletreoPage() {
  const setHeader = useWorkspaceHeader((s) => s.setHeader);
  const resetHeader = useWorkspaceHeader((s) => s.resetHeader);

  const { ready, assets, statuses, progress } = useAssetPreloader(ASSETS);
  const normalUrl = assets.mainFrame?.url;
  const errorUrl = assets.errorFrame?.url;
  const correctUrl = assets.correct?.url;
  const incorrectUrl = assets.incorrect?.url;

  const [editMode, setEditMode] = useState(false);

  const {
    gameObjects,
    setGameObjects,
    selectedId,
    setSelectedId,
    selected,
    hierarchyNodes,
    stageRef,
    beginGesture,
    patchGameObject,
    createNewGameObject,
    deleteGameObject,
    handleReorder,
    addComponent,
    removeComponent,
    patchComponent,
    setGameObjectSize,
    setAxis,
    setRotation,
    animatePosition,
  } = useSceneEditor({
    registry,
    initialSelectedId: FRAME_ID,
    initialGameObjects: () => [
      createGameObject({
        id: "background",
        name: "Background",
        transform: {
          position: { x: 0, y: 0 },
          size: { x: DESIGN_WIDTH, y: DESIGN_HEIGHT },
          pivot: { x: 0.5, y: 0.5 },
        },
        components: [createColorComponent({ value: "#01FF02" })],
      }),
      createGameObject({
        id: ANCHOR_ID,
        name: "Anchor",
        transform: {
          position: { x: 25, y: -358 },
          size: { x: 1170, y: 204 },
          pivot: { x: 0.5, y: 0.5 },
        },
      }),
      createGameObject({
        id: FRAME_ID,
        name: "MainFrame",
        parentId: ANCHOR_ID,
        transform: {
          position: { x: 0, y: 0 },
          size: { x: 1170, y: 204 },
          pivot: { x: 0.5, y: 0.5 },
        },
        components: [
          createImageComponent({ src: "", fit: "fill" }),
          createPopComponent(),
          createShakeComponent(),
          createBounceComponent(),
          createSlideComponent(),
        ],
      }),
      createGameObject({
        id: TEXT_ID,
        name: "Text",
        parentId: FRAME_ID,
        transform: {
          position: { x: 0, y: 0 },
          size: { x: 900, y: 160 },
          pivot: { x: 0.5, y: 0.5 },
        },
        components: [createSpellframeComponent()],
      }),
      createGameObject({
        id: CONTROLLER_ID,
        name: "Controller",
        transform: {
          position: { x: 0, y: 0 },
          size: { x: 0, y: 0 },
          pivot: { x: 0.5, y: 0.5 },
        },
        components: [createControllerComponent()],
      }),
    ],
  });

  const [spellStep, setSpellStep] = useState(0);
  const [normalSrc, setNormalSrc] = useState("");

  const controller = gameObjects
    .find((go) => go.id === CONTROLLER_ID)
    ?.components.find((c) => c.type === "controller") as
    ControllerComponent | undefined;
  const groups = controller?.groups ?? [];
  const groupIndex = controller?.groupIndex ?? 0;
  const slotIndex = controller?.slotIndex ?? 0;

  const patchController = (patch: Partial<ControllerComponent>) =>
    setGameObjects((prev) =>
      prev.map((go) =>
        go.id === CONTROLLER_ID
          ? {
              ...go,
              components: go.components.map((c) =>
                c.type === "controller" ? { ...c, ...patch } : c,
              ),
            }
          : go,
      ),
    );

  const setMainFrameImageSrc = (src: string) =>
    setGameObjects((prev) =>
      prev.map((go) =>
        go.id === FRAME_ID
          ? {
              ...go,
              components: go.components.map((c) =>
                c.type === "image" ? { ...c, src } : c,
              ),
            }
          : go,
      ),
    );

  const onComponentChange =
    (goId: string, index: number) => (next: GameObjectComponent) => {
      patchComponent(goId, index, next);
      if (goId === FRAME_ID && next.type === "image") {
        const src = (next as ImageComponent).src;
        if (src && src !== errorUrl) setNormalSrc(src);
      }
    };

  const { trigger } = useAnimations();

  useEffect(() => {
    return () => resetHeader();
  }, [resetHeader]);

  useEffect(() => {
    setHeader({
      title: "Deletreo",
      icon: <SpellCheck className="h-3 w-3" />,
    });
  }, [setHeader]);

  useEffect(() => {
    if (!ready || !normalUrl) return;
    setNormalSrc(normalUrl);
    setMainFrameImageSrc(normalUrl);
  }, [ready, normalUrl]);

  const currentGroup = groups[groupIndex]?.words ?? [];
  const word = currentGroup[slotIndex] ?? "";

  useEffect(() => {
    setSpellStep(0);
    setMainFrameImageSrc(normalSrc);
  }, [groupIndex, slotIndex, controller?.fileName]);

  useEffect(() => {
    setGameObjects((prev) =>
      prev.map((go) =>
        go.id === TEXT_ID
          ? {
              ...go,
              components: go.components.map((c) =>
                c.type === "spellframe" ? { ...c, word, spellStep } : c,
              ),
            }
          : go,
      ),
    );
  }, [word, spellStep, setGameObjects]);

  const selectGroup = (n: number) => {
    if (n < 0 || n >= groups.length) return;
    patchController({ groupIndex: n, slotIndex: 0 });
  };

  const selectSlot = (n: number) => {
    if (n < 0 || n >= currentGroup.length) return;
    patchController({ slotIndex: n });
  };

  const nextSlot = () => {
    if (slotIndex >= currentGroup.length - 1) return;
    patchController({ slotIndex: slotIndex + 1 });
  };

  const prevSlot = () => {
    if (slotIndex <= 0) return;
    patchController({ slotIndex: slotIndex - 1 });
  };

  useGameKeys({
    onNumber: selectSlot,
    onNavigate: selectGroup,
    onNext: nextSlot,
    onBack: prevSlot,
    onShowAnswer: () => {
      setSpellStep(word.length);
      setMainFrameImageSrc(normalSrc);
      if (correctUrl) playSound(correctUrl);
      trigger(FRAME_ID, "pop");
    },
    onMarkError: () => {
      if (errorUrl) setMainFrameImageSrc(errorUrl);
      if (incorrectUrl) playSound(incorrectUrl);
      trigger(FRAME_ID, "shake");
    },
    onInteract: () => setSpellStep((s) => Math.min(s + 1, word.length)),
    onArrowUp: () => trigger(FRAME_ID, "bounce"),
    onArrowDown: () => trigger(FRAME_ID, "slide"),
  });

  return (
    <main className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 w-full flex-1">
        <SidePanel
          title="Hierarchy"
          className="w-[262px] shrink-0 border-r border-edge"
        >
          <Hierarchy
            nodes={hierarchyNodes}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onCreate={(parentId) => createNewGameObject(parentId ?? undefined)}
            onDelete={deleteGameObject}
            onReorder={handleReorder}
            onToggleActive={(id, active) => patchGameObject(id, { active })}
          />
        </SidePanel>
        <div className="flex min-w-0 flex-1 flex-col">
          <Scene hideCursorOnFullscreen>
            <ComponentRegistryProvider value={registry}>
              {ready ? (
                <div ref={stageRef} className="absolute inset-0">
                  {gameObjects
                    .filter((go) => !go.parentId && go.active)
                    .map((go) => (
                      <GameObjectView
                        key={go.id}
                        gameObject={go}
                        allGameObjects={gameObjects}
                        selectedId={selectedId}
                        onAnimatePosition={animatePosition}
                      />
                    ))}
                  {editMode && (
                    <SelectionOverlay
                      selected={selected}
                      allGameObjects={gameObjects}
                      onGesture={beginGesture}
                    />
                  )}
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-white/70">
                  Cargando assets… {progress.loaded}/{progress.total}
                </div>
              )}
            </ComponentRegistryProvider>
          </Scene>
        </div>
        <SidePanel
          title="Inspector"
          className="w-[336px] shrink-0 border-l border-edge"
          bodyClassName="flex flex-col"
        >
          {selected ? (
            <>
              <GameObjectInspector
                name={selected.name}
                kind={gameObjectKind(selected.components)}
                onNameChange={(name) => patchGameObject(selected.id, { name })}
                active={selected.active}
                onActiveChange={(active) =>
                  patchGameObject(selected.id, { active })
                }
              />
              <RectTransformInspector
                transform={selected.transform}
                setAxis={setAxis}
                setRotation={setRotation}
                editMode={editMode}
                onToggleEdit={() => setEditMode((v) => !v)}
              />
              {selected.components.map((component, index) => {
                const Editor = registry.get(component.type)?.editor;
                return Editor ? (
                  <Editor
                    key={index}
                    component={component}
                    onChange={onComponentChange(selected.id, index)}
                    onRemove={() => removeComponent(selected.id, index)}
                    onResize={(size) => setGameObjectSize(selected.id, size)}
                    onAddComponent={(type) => addComponent(selected.id, type)}
                  />
                ) : null;
              })}
              <AddComponentButton
                options={registry.options}
                onAdd={(type) => addComponent(selected.id, type)}
              />
            </>
          ) : (
            <p className="p-3 text-2xs text-dim">
              Selecciona un objeto en Hierarchy.
            </p>
          )}
        </SidePanel>
      </div>

      <AssetsBar count={`${progress.loaded}/${progress.total}`}>
        {controller?.fileName && (
          <AssetTile
            icon={<FileJson size={22} />}
            name={controller.fileName}
            meta={`${groups.length} grupos`}
          />
        )}
        <AssetLoaderTiles statuses={statuses} kinds={ASSET_KINDS} />
      </AssetsBar>
    </main>
  );
}

"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { SpellCheck } from "lucide-react";
import { useWorkspaceHeader } from "@/hooks/use-workspace-header";
import { useAssetPreloader } from "@/hooks/use-asset-preloader";
import type { AssetKind } from "@/helpers/asset-preloader";
import { toManifest, type AssetCatalog } from "@/helpers/asset-source";
import { SHARED_ASSETS } from "@/assets/shared";
import { AssetLoaderCard } from "@/components/shared/AssetLoaderCard";
import { useGameKeys } from "@/hooks/use-game-keys";
import { useTransformGesture, HANDLES } from "@/hooks/use-transform-gesture";
import { playSound } from "@/lib/audio";

import { Scene } from "@engine/Scene";
import {
  RectTransformValues,
  Vec2,
  DESIGN_WIDTH,
  DESIGN_HEIGHT,
} from "@engine/RectTransform";
import { GameObjectView } from "@engine/GameObjectView";
import { spellframeDefinition } from "./components/spellframe";
import { createSpellframeComponent } from "./components/spellframe/spellframeComponent";
import { controllerDefinition } from "./components/controller";
import {
  ControllerComponent,
  createControllerComponent,
} from "./components/controller/controllerComponent";
import { SidePanel } from "@engine/SidePanel";
import { Hierarchy, TreeNode } from "@engine/Hierarchy";
import { GameObjectInspector } from "@engine/GameObjectInspector";
import { RectTransformInspector } from "@engine/RectTransformInspector";
import {
  GameObject,
  GameObjectComponent,
  createGameObject,
  ancestorOffset,
  reorderGameObjects,
  collectSubtreeIds,
  gameObjectKind,
  gameObjectHasAnimation,
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

const DELETREO_ASSETS = {
  mainFrame: { kind: "image", path: "games/deletreo/mainFrame.png" },
  errorFrame: { kind: "image", path: "games/deletreo/errorFrame.png" },
} satisfies AssetCatalog;

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

  const [gameObjects, setGameObjects] = useState<GameObject[]>(() => [
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
  ]);
  const [selectedId, setSelectedId] = useState<string>(FRAME_ID);

  const [spellStep, setSpellStep] = useState(0);
  const [normalSrc, setNormalSrc] = useState("");

  const selected = gameObjects.find((go) => go.id === selectedId) ?? null;

  const controller = gameObjects
    .find((go) => go.id === CONTROLLER_ID)
    ?.components.find((c) => c.type === "controller") as
    | ControllerComponent
    | undefined;
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

  const buildNode = (go: GameObject): TreeNode => {
    const children = gameObjects
      .filter((c) => c.parentId === go.id)
      .map(buildNode);
    return {
      id: go.id,
      name: go.name,
      active: go.active,
      kind: gameObjectKind(go.components),
      hasAnimation: gameObjectHasAnimation(go.components),
      children: children.length ? children : undefined,
    };
  };

  const hierarchyNodes: TreeNode[] = gameObjects
    .filter((go) => !go.parentId)
    .map(buildNode);

  const patchGameObject = (id: string, patch: Partial<GameObject>) =>
    setGameObjects((prev) =>
      prev.map((go) => (go.id === id ? { ...go, ...patch } : go)),
    );

  const patchComponent = (
    goId: string,
    index: number,
    next: GameObjectComponent,
  ) =>
    setGameObjects((prev) =>
      prev.map((go) =>
        go.id === goId
          ? {
              ...go,
              components: go.components.map((c, i) => (i === index ? next : c)),
            }
          : go,
      ),
    );

  const createNewGameObject = (parentId?: string) => {
    const id = crypto.randomUUID();
    setGameObjects((prev) => [
      ...prev,
      createGameObject({
        id,
        name: "GameObject",
        parentId,
        transform: {
          position: { x: 0, y: 0 },
          size: { x: 100, y: 100 },
          pivot: { x: 0.5, y: 0.5 },
        },
      }),
    ]);
    setSelectedId(id);
  };

  const deleteGameObject = (id: string) => {
    const ids = collectSubtreeIds(gameObjects, id);
    setGameObjects((prev) => prev.filter((go) => !ids.has(go.id)));
    if (selectedId && ids.has(selectedId)) setSelectedId("");
  };

  const handleReorder = (
    draggedId: string,
    targetId: string,
    position: "before" | "after" | "inside",
  ) =>
    setGameObjects((prev) =>
      reorderGameObjects(prev, draggedId, targetId, position),
    );

  const addComponent = (goId: string, type: string) => {
    const def = registry.get(type);
    if (!def) return;
    setGameObjects((prev) =>
      prev.map((go) =>
        go.id === goId
          ? { ...go, components: [...go.components, def.create()] }
          : go,
      ),
    );
  };

  const setGameObjectSize = (goId: string, size: Vec2) =>
    setGameObjects((prev) =>
      prev.map((go) =>
        go.id === goId ? { ...go, transform: { ...go.transform, size } } : go,
      ),
    );

  const removeComponent = (goId: string, index: number) =>
    setGameObjects((prev) =>
      prev.map((go) =>
        go.id === goId
          ? {
              ...go,
              components: go.components.filter((_, i) => i !== index),
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

  const setAxis =
    (field: keyof RectTransformValues, axis: keyof Vec2) => (value: number) =>
      setGameObjects((prev) =>
        prev.map((go) =>
          go.id === selectedId
            ? {
                ...go,
                transform: {
                  ...go.transform,
                  [field]: { ...go.transform[field], [axis]: value },
                },
              }
            : go,
        ),
      );

  const { trigger } = useAnimations();

  const animatePosition = useCallback(
    (id: string, position: Vec2) =>
      setGameObjects((prev) =>
        prev.map((go) =>
          go.id === id
            ? { ...go, transform: { ...go.transform, position } }
            : go,
        ),
      ),
    [],
  );

  const stageRef = useRef<HTMLDivElement>(null);
  const { beginGesture } = useTransformGesture({
    stageRef,
    getTransform: () => {
      if (!selected) return null;
      const origin = ancestorOffset(selected, gameObjects);
      return {
        ...selected.transform,
        position: {
          x: selected.transform.position.x + origin.x,
          y: selected.transform.position.y + origin.y,
        },
      };
    },
    onChange: ({ position, size }) =>
      setGameObjects((prev) =>
        prev.map((go) => {
          if (go.id !== selectedId) return go;
          const origin = ancestorOffset(go, gameObjects);
          return {
            ...go,
            transform: {
              ...go.transform,
              position: {
                x: position.x - origin.x,
                y: position.y - origin.y,
              },
              size,
            },
          };
        }),
      ),
  });

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
  }, [word, spellStep]);

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

  const renderContent = (go: GameObject) => (
    <>
      {editMode && go.id === selectedId && (
        <>
          <div
            onPointerDown={(e) => beginGesture("move", e)}
            className="absolute inset-0 cursor-move touch-none select-none"
          />
          {HANDLES.map((hd) => (
            <div
              key={hd.h}
              onPointerDown={(e) => beginGesture(hd.h, e)}
              className={`absolute ${hd.pos} ${hd.cursor} h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-700 bg-white touch-none`}
            />
          ))}
        </>
      )}
    </>
  );

  return (
    <main className="flex-1 p-3 overflow-auto flex flex-col gap-3">
      <div className="flex gap-1.5">
        <SidePanel title="Hierarchy" className="w-72 shrink-0">
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
                        editMode={editMode}
                        renderContent={renderContent}
                        onAnimatePosition={animatePosition}
                      />
                    ))}
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-white/70">
                  Cargando assets… {progress.loaded}/{progress.total}
                </div>
              )}
            </ComponentRegistryProvider>
          </Scene>
        </div>
        <SidePanel title="Inspector" className="w-72 shrink-0">
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
            <p className="px-1 py-2 text-2xs text-muted-foreground">
              Selecciona un objeto en Hierarchy.
            </p>
          )}
        </SidePanel>
      </div>

      {/* Config */}
      <div className="grid grid-cols-1 gap-4">
        <AssetLoaderCard
          statuses={statuses}
          progress={progress}
          kinds={ASSET_KINDS}
        />
      </div>
    </main>
  );
}

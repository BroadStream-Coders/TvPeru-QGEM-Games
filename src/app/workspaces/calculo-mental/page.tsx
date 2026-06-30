"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Calculator, FileJson } from "lucide-react";
import { AssetsBar, AssetTile, AssetLoaderTiles } from "@engine/AssetsBar";
import { useWorkspaceHeader } from "@/hooks/use-workspace-header";
import { useGameKeys } from "@/hooks/use-game-keys";
import { useAssetPreloader } from "@/hooks/use-asset-preloader";
import type { AssetKind } from "@/helpers/asset-preloader";
import { toManifest, type AssetCatalog } from "@/helpers/asset-source";
import { SHARED_ASSETS } from "@/assets/shared";
import { CALCULO_ASSETS } from "./assets";
import { useTransformGesture } from "@/hooks/use-transform-gesture";
import { playSound } from "@/lib/audio";

import { Scene } from "@engine/Scene";
import {
  RectTransformValues,
  Vec2,
  DESIGN_WIDTH,
  DESIGN_HEIGHT,
} from "@engine/RectTransform";
import { GameObjectView } from "@engine/GameObjectView";
import { SelectionOverlay } from "@engine/SelectionOverlay";
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
import { createColorComponent } from "@engine/components/color/colorComponent";
import { createPopComponent } from "@engine/components/pop/popComponent";
import { createShakeComponent } from "@engine/components/shake/shakeComponent";
import { createBounceComponent } from "@engine/components/bounce/bounceComponent";
import { createSlideComponent } from "@engine/components/slide/slideComponent";
import { createTextComponent } from "@engine/components/text/textComponent";
import { useAnimations } from "@engine/animations/AnimationsContext";
import { slotDefinition } from "./components/slot";
import {
  SlotComponent,
  createSlotComponent,
} from "./components/slot/slotComponent";
import { controllerDefinition } from "./components/controller";
import {
  ControllerComponent,
  createControllerComponent,
} from "./components/controller/controllerComponent";

const CATALOG: AssetCatalog = {
  correct: SHARED_ASSETS.correctSound,
  incorrect: SHARED_ASSETS.incorrectSound,
  ...CALCULO_ASSETS,
};

const ASSETS = toManifest(CATALOG);

const ASSET_KINDS: Record<string, AssetKind> = Object.fromEntries(
  Object.entries(CATALOG).map(([key, entry]) => [key, entry.kind]),
);

const BACKGROUND_ID = "background";
const CONTROLLER_ID = "controller";

const SLOT_COUNT = 4;
const SLOT_IDS = Array.from({ length: SLOT_COUNT }, (_, i) => `slot-${i}`);
const QUESTION_IDS = SLOT_IDS.map((id) => `${id}-question`);
const ANSWER_IDS = SLOT_IDS.map((id) => `${id}-answer`);
const SLOT_POSITIONS: Vec2[] = [
  { x: -675, y: -400 },
  { x: -280, y: -400 },
  { x: 115, y: -400 },
  { x: 510, y: -400 },
];

const QUESTION_TRANSFORM: RectTransformValues = {
  position: { x: -8, y: 30 },
  size: { x: 346, y: 124 },
  pivot: { x: 0.5, y: 0.5 },
};
const ANSWER_TRANSFORM: RectTransformValues = {
  position: { x: 69, y: -45 },
  size: { x: 230, y: 87 },
  pivot: { x: 0.5, y: 0.5 },
};

const createSlotTextComponent = () =>
  createTextComponent({
    text: "",
    autoSize: true,
    fontSizeMin: 1,
    fontSizeMax: 6,
    color: "#ffffff",
    fontFamily: "var(--font-poppins-semibold)",
  });

const registry = createComponentRegistry([
  ...NATIVE_COMPONENTS,
  slotDefinition,
  controllerDefinition,
]);

export default function CalculoMentalPage() {
  const setHeader = useWorkspaceHeader((s) => s.setHeader);
  const resetHeader = useWorkspaceHeader((s) => s.resetHeader);

  const { ready, assets, statuses, progress } = useAssetPreloader(ASSETS);
  const blueUrl = assets.blueFrame?.url;
  const purpleUrl = assets.purpleFrame?.url;
  const checkUrl = assets.check?.url;
  const xUrl = assets.x?.url;
  const correctUrl = assets.correct?.url;
  const incorrectUrl = assets.incorrect?.url;

  const [editMode, setEditMode] = useState(false);

  const [gameObjects, setGameObjects] = useState<GameObject[]>(() => [
    createGameObject({
      id: BACKGROUND_ID,
      name: "Background",
      transform: {
        position: { x: 0, y: 0 },
        size: { x: DESIGN_WIDTH, y: DESIGN_HEIGHT },
        pivot: { x: 0.5, y: 0.5 },
      },
      components: [createColorComponent({ value: "#01FF02" })],
    }),
    createGameObject({
      id: CONTROLLER_ID,
      name: "Controller",
      transform: {
        position: { x: 0, y: 0 },
        size: { x: DESIGN_WIDTH, y: DESIGN_HEIGHT },
        pivot: { x: 0.5, y: 0.5 },
      },
      components: [createControllerComponent()],
    }),
    ...SLOT_IDS.flatMap((id, i) => [
      createGameObject({
        id,
        name: `Slot ${i + 1}`,
        parentId: CONTROLLER_ID,
        transform: {
          position: SLOT_POSITIONS[i],
          size: { x: 400, y: 200 },
          pivot: { x: 0.5, y: 0.5 },
        },
        components: [
          createSlotComponent(),
          createPopComponent(),
          createShakeComponent(),
          createBounceComponent(),
          createSlideComponent(),
        ],
      }),
      createGameObject({
        id: QUESTION_IDS[i],
        name: "Pregunta",
        parentId: id,
        active: false,
        transform: QUESTION_TRANSFORM,
        components: [createSlotTextComponent()],
      }),
      createGameObject({
        id: ANSWER_IDS[i],
        name: "Respuesta",
        parentId: id,
        active: false,
        transform: ANSWER_TRANSFORM,
        components: [createSlotTextComponent()],
      }),
    ]),
  ]);
  const [selectedId, setSelectedId] = useState<string>(SLOT_IDS[0]);

  const selected = gameObjects.find((go) => go.id === selectedId) ?? null;

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

  const onComponentChange =
    (goId: string, index: number) => (next: GameObjectComponent) =>
      patchComponent(goId, index, next);

  const patchSlot = (id: string, patch: Partial<SlotComponent>) =>
    setGameObjects((prev) =>
      prev.map((go) =>
        go.id === id
          ? {
              ...go,
              components: go.components.map((c) =>
                c.type === "slot" ? { ...c, ...patch } : c,
              ),
            }
          : go,
      ),
    );

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
      title: "Cálculo Mental",
      icon: <Calculator className="h-3 w-3" />,
    });
  }, [setHeader]);

  useEffect(() => {
    if (!ready) return;
    setGameObjects((prev) =>
      prev.map((go) =>
        SLOT_IDS.includes(go.id)
          ? {
              ...go,
              components: go.components.map((c) => {
                if (c.type !== "slot") return c;
                const slot = c as SlotComponent;
                return {
                  ...slot,
                  blueSrc: blueUrl ?? slot.blueSrc,
                  purpleSrc: purpleUrl ?? slot.purpleSrc,
                  checkSrc: checkUrl ?? slot.checkSrc,
                  xSrc: xUrl ?? slot.xSrc,
                };
              }),
            }
          : go,
      ),
    );
  }, [ready, blueUrl, purpleUrl, checkUrl, xUrl]);

  const controller = gameObjects
    .find((go) => go.id === CONTROLLER_ID)
    ?.components.find((c) => c.type === "controller") as
    | ControllerComponent
    | undefined;
  const groups = controller?.groups ?? [];
  const groupIndex = controller?.groupIndex ?? 0;
  const boardIndex = controller?.boardIndex ?? 0;
  const cursor = controller?.cursor ?? -1;
  const fileName = controller?.fileName;

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

  const boardSlots = groups[groupIndex]?.boards[boardIndex]?.slots ?? [];

  useEffect(() => {
    const slots = groups[groupIndex]?.boards[boardIndex]?.slots ?? [];
    setGameObjects((prev) =>
      prev.map((go) => {
        if (go.id === CONTROLLER_ID) {
          return {
            ...go,
            components: go.components.map((c) =>
              c.type === "controller" ? { ...c, cursor: -1 } : c,
            ),
          };
        }
        if (SLOT_IDS.includes(go.id)) {
          return {
            ...go,
            components: go.components.map((c) =>
              c.type === "slot" ? { ...c, status: "none" } : c,
            ),
          };
        }
        const qIndex = QUESTION_IDS.indexOf(go.id);
        if (qIndex !== -1) {
          const text = slots[qIndex]?.question ?? "";
          return {
            ...go,
            active: false,
            components: go.components.map((c) =>
              c.type === "text" ? { ...c, text } : c,
            ),
          };
        }
        const aIndex = ANSWER_IDS.indexOf(go.id);
        if (aIndex !== -1) {
          const text = slots[aIndex]?.answer ?? "";
          return {
            ...go,
            active: false,
            components: go.components.map((c) =>
              c.type === "text" ? { ...c, text } : c,
            ),
          };
        }
        return go;
      }),
    );
  }, [groupIndex, boardIndex, fileName]);

  const selectGroup = (n: number) => {
    if (n < 0 || n >= groups.length) return;
    patchController({ groupIndex: n, boardIndex: 0 });
  };

  const selectBoard = (n: number) => {
    const boards = groups[groupIndex]?.boards ?? [];
    if (n < 0 || n >= boards.length) return;
    patchController({ boardIndex: n });
  };

  const nextBoard = () => {
    const boards = groups[groupIndex]?.boards ?? [];
    if (boardIndex >= boards.length - 1) return;
    patchController({ boardIndex: boardIndex + 1 });
  };

  const prevBoard = () => {
    if (boardIndex <= 0) return;
    patchController({ boardIndex: boardIndex - 1 });
  };

  const revealNextQuestion = () => {
    const next = cursor + 1;
    if (next >= SLOT_COUNT || next >= boardSlots.length) return;
    patchGameObject(QUESTION_IDS[next], { active: true });
    patchController({ cursor: next });
  };

  const selectBackSlot = () => {
    if (cursor < 0) return;
    patchGameObject(QUESTION_IDS[cursor], { active: false });
    patchGameObject(ANSWER_IDS[cursor], { active: false });
    patchSlot(SLOT_IDS[cursor], { status: "none" });
    patchController({ cursor: cursor - 1 });
  };

  const playSequence = (anim: "bounce" | "slide", delayMs = 100) =>
    SLOT_IDS.forEach((id, i) =>
      setTimeout(() => trigger(id, anim), i * delayMs),
    );

  const showCurrentAnswer = () => {
    if (cursor < 0) return;
    patchGameObject(ANSWER_IDS[cursor], { active: true });
    patchSlot(SLOT_IDS[cursor], { status: "correct" });
    if (correctUrl) playSound(correctUrl);
    trigger(SLOT_IDS[cursor], "pop");
  };

  const markCurrentError = () => {
    if (cursor < 0) return;
    patchSlot(SLOT_IDS[cursor], { status: "incorrect" });
    if (incorrectUrl) playSound(incorrectUrl);
    trigger(SLOT_IDS[cursor], "shake");
  };

  const clearCurrent = () => {
    if (cursor < 0) return;
    patchSlot(SLOT_IDS[cursor], { status: "none" });
  };

  useGameKeys({
    onNavigate: selectGroup,
    onNumber: selectBoard,
    onNext: nextBoard,
    onBack: prevBoard,
    onArrowRight: revealNextQuestion,
    onArrowLeft: selectBackSlot,
    onShowAnswer: showCurrentAnswer,
    onMarkError: markCurrentError,
    onClear: clearCurrent,
    onArrowUp: () => playSequence("bounce"),
    onArrowDown: () => playSequence("slide"),
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
        {fileName && (
          <AssetTile
            icon={<FileJson size={22} />}
            name={fileName}
            meta={`${groups.length} grupos`}
          />
        )}
        <AssetLoaderTiles statuses={statuses} kinds={ASSET_KINDS} />
      </AssetsBar>
    </main>
  );
}

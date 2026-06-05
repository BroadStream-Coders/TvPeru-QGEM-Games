"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { SpellCheck } from "lucide-react";
import { loadJsonFile } from "@/helpers/persistence";
import { useWorkspaceHeader } from "@/hooks/use-workspace-header";
import { useGameKeys } from "@/hooks/use-game-keys";
import { useTransformGesture, HANDLES } from "@/hooks/use-transform-gesture";
import { useShake } from "@/hooks/use-shake";
import { usePop } from "@/hooks/use-pop";
import { useBounceMove } from "@/hooks/use-bounce-move";
import { useSlide } from "@/hooks/use-slide";
import { SOUNDS, playSound } from "@/lib/audio";

import { Scene, SceneBackground } from "@engine/Scene";
import { BackgroundConfig } from "@/components/shared/BackgroundConfig";
import { RectTransformValues, Vec2 } from "@engine/RectTransform";
import { GameObjectView } from "@engine/GameObjectView";
import { SpellFrame } from "./components/SpellFrame";
import { StatusCard } from "./components/StatusCard";
import { LegendCard } from "./components/LegendCard";
import { TextCard } from "./components/TextCard";
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
} from "@engine/gameObject";
import {
  COMPONENT_REGISTRY,
  COMPONENT_OPTIONS,
} from "@engine/componentRegistry";
import { AddComponentButton } from "@engine/AddComponentButton";
import {
  ImageComponent,
  createImageComponent,
} from "@engine/components/image/imageComponent";

import mainFrame from "./graphics/mainFrame.png";
import errorFrame from "./graphics/errorFrame.png";

const NORMAL_SRC = mainFrame.src;
const ERROR_SRC = errorFrame.src;

interface DeletreoGroup {
  words: string[];
}

interface DeletreoData {
  groups: DeletreoGroup[];
}

const HIDDEN_POS = { x: 25, y: -688 };
const SHOWN_POS = { x: 25, y: -358 };

const FRAME_ID = "main-frame";
const TEXT_ID = "text";

export default function DeletreoPage() {
  const setHeader = useWorkspaceHeader((s) => s.setHeader);
  const resetHeader = useWorkspaceHeader((s) => s.resetHeader);

  const [groups, setGroups] = useState<string[][]>([]);
  const [groupIndex, setGroupIndex] = useState(0);
  const [slotIndex, setSlotIndex] = useState(0);

  const [background, setBackground] = useState<SceneBackground>({
    type: "color",
    value: "#01FF02",
  });
  const [editMode, setEditMode] = useState(false);

  const [gameObjects, setGameObjects] = useState<GameObject[]>(() => [
    createGameObject({
      id: FRAME_ID,
      name: "MainFrame",
      transform: {
        position: { ...HIDDEN_POS },
        size: { x: 1170, y: 204 },
        pivot: { x: 0.5, y: 0.5 },
      },
      components: [createImageComponent({ src: NORMAL_SRC, fit: "fill" })],
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
    }),
  ]);
  const [selectedId, setSelectedId] = useState<string>(FRAME_ID);

  const [textConfig, setTextConfig] = useState({
    fontSize: 80,
    letterSpacing: 20,
    offset: { x: 0, y: 0 },
    underlineGap: 0,
  });

  const [spellStep, setSpellStep] = useState(0);
  const [normalSrc, setNormalSrc] = useState(NORMAL_SRC);
  const [manualText, setManualText] = useState("");

  const selected = gameObjects.find((go) => go.id === selectedId) ?? null;
  const mainFrame = gameObjects.find((go) => go.id === FRAME_ID)!;
  const textVisible =
    gameObjects.find((go) => go.id === TEXT_ID)?.active ?? true;

  const buildNode = (go: GameObject): TreeNode => {
    const children = gameObjects
      .filter((c) => c.parentId === go.id)
      .map(buildNode);
    return {
      id: go.id,
      name: go.name,
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

  const createNewGameObject = () => {
    const id = crypto.randomUUID();
    setGameObjects((prev) => [
      ...prev,
      createGameObject({
        id,
        name: "GameObject",
        transform: {
          position: { x: 0, y: 0 },
          size: { x: 100, y: 100 },
          pivot: { x: 0.5, y: 0.5 },
        },
      }),
    ]);
    setSelectedId(id);
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
    const def = COMPONENT_REGISTRY[type];
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
        if (src !== ERROR_SRC) setNormalSrc(src);
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

  const { ref: shakeRef, shake } = useShake<HTMLDivElement>();
  const { ref: popRef, pop } = usePop<HTMLDivElement>();
  const bounce = useBounceMove();
  const slide = useSlide();

  const setFramePosition = (position: Vec2) =>
    setGameObjects((prev) =>
      prev.map((go) =>
        go.id === FRAME_ID
          ? { ...go, transform: { ...go.transform, position } }
          : go,
      ),
    );

  const showFrame = () => {
    slide.cancel();
    bounce.moveTo(mainFrame.transform.position, SHOWN_POS, setFramePosition);
  };

  const hideFrame = () => {
    bounce.cancel();
    slide.moveTo(mainFrame.transform.position, HIDDEN_POS, setFramePosition);
  };

  const frameRef = useCallback(
    (node: HTMLDivElement | null) => {
      shakeRef.current = node;
      popRef.current = node;
    },
    [shakeRef, popRef],
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

  const handleLoad = useCallback(
    async (file: File) => {
      try {
        const isValid = (data: unknown): data is DeletreoData =>
          typeof data === "object" &&
          data !== null &&
          "groups" in data &&
          Array.isArray((data as DeletreoData).groups) &&
          (data as DeletreoData).groups.every((g) => Array.isArray(g.words));

        const data = await loadJsonFile<DeletreoData>(file, isValid);
        setGroups(data.groups.map((g) => g.words));
        setGroupIndex(0);
        setSlotIndex(0);
        setSpellStep(0);
        setMainFrameImageSrc(normalSrc);
      } catch {
        console.error("Error al cargar el archivo JSON.");
      }
    },
    [normalSrc],
  );

  useEffect(() => {
    return () => resetHeader();
  }, [resetHeader]);

  useEffect(() => {
    setHeader({
      title: "Deletreo",
      icon: <SpellCheck className="h-3 w-3" />,
      onLoad: handleLoad,
    });
  }, [setHeader, handleLoad]);

  const currentGroup = groups[groupIndex] ?? [];
  const word = manualText !== "" ? manualText : (currentGroup[slotIndex] ?? "");

  const selectGroup = (n: number) => {
    if (n < 0 || n >= groups.length) return;
    setGroupIndex(n);
    setSlotIndex(0);
    setSpellStep(0);
    setMainFrameImageSrc(normalSrc);
  };

  const selectSlot = (n: number) => {
    if (n < 0 || n >= currentGroup.length) return;
    setSlotIndex(n);
    setSpellStep(0);
    setMainFrameImageSrc(normalSrc);
  };

  const nextSlot = () => {
    setSlotIndex((i) => Math.min(i + 1, currentGroup.length - 1));
    setSpellStep(0);
    setMainFrameImageSrc(normalSrc);
  };

  const prevSlot = () => {
    setSlotIndex((i) => Math.max(i - 1, 0));
    setSpellStep(0);
    setMainFrameImageSrc(normalSrc);
  };

  useGameKeys({
    onNumber: selectSlot,
    onNavigate: selectGroup,
    onNext: nextSlot,
    onBack: prevSlot,
    onShowAnswer: () => {
      setSpellStep(word.length);
      setMainFrameImageSrc(normalSrc);
      playSound(SOUNDS.correctAnswer);
      pop();
    },
    onMarkError: () => {
      setMainFrameImageSrc(ERROR_SRC);
      playSound(SOUNDS.incorrectAnswer);
      shake();
    },
    onInteract: () => setSpellStep((s) => Math.min(s + 1, word.length)),
    onArrowUp: showFrame,
    onArrowDown: hideFrame,
  });

  const renderContent = (go: GameObject) => (
    <>
      {go.id === FRAME_ID && (
        <SpellFrame
          frameRef={frameRef}
          word={textVisible ? word : ""}
          spellStep={spellStep}
          textConfig={textConfig}
        />
      )}
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
            onAdd={createNewGameObject}
            onReorder={handleReorder}
          />
        </SidePanel>
        <div className="flex min-w-0 flex-1 flex-col">
          <Scene background={background} hideCursorOnFullscreen>
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
                  />
                ))}
            </div>
          </Scene>
        </div>
        <SidePanel title="Inspector" className="w-72 shrink-0">
          {selected ? (
            <>
              <GameObjectInspector
                name={selected.name}
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
                const Editor = COMPONENT_REGISTRY[component.type]?.editor;
                return Editor ? (
                  <Editor
                    key={index}
                    component={component}
                    onChange={onComponentChange(selected.id, index)}
                    onRemove={() => removeComponent(selected.id, index)}
                    onResize={(size) => setGameObjectSize(selected.id, size)}
                  />
                ) : null;
              })}
              <AddComponentButton
                options={COMPONENT_OPTIONS}
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
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <BackgroundConfig value={background} onChange={setBackground} />
        </div>
        <TextCard
          textConfig={textConfig}
          onChange={setTextConfig}
          manualText={manualText}
          onManualTextChange={setManualText}
        />
        <StatusCard
          groups={groups}
          groupIndex={groupIndex}
          slotIndex={slotIndex}
        />
        <LegendCard />
      </div>
    </main>
  );
}

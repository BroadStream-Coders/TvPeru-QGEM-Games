import React from "react";
import { RectTransform, Vec2 } from "@engine/RectTransform";
import { GameObject } from "@engine/gameObject";
import { COMPONENT_REGISTRY } from "@engine/componentRegistry";
import { useSceneViewMode } from "@engine/SceneViewMode";

interface GameObjectViewProps {
  gameObject: GameObject;
  allGameObjects: GameObject[];
  parentSize?: Vec2;
  selectedId?: string | null;
  editMode?: boolean;
  renderContent?: (go: GameObject) => React.ReactNode;
  contentRef?: (go: GameObject) => React.Ref<HTMLDivElement> | undefined;
}

export function GameObjectView({
  gameObject,
  allGameObjects,
  parentSize,
  selectedId,
  editMode,
  renderContent,
  contentRef,
}: GameObjectViewProps) {
  const viewMode = useSceneViewMode();
  const selected = gameObject.id === selectedId;
  const showOutline = (editMode && selected) || viewMode === "scene";

  const childObjects = allGameObjects.filter(
    (go) => go.parentId === gameObject.id,
  );

  return (
    <RectTransform
      position={gameObject.transform.position}
      size={gameObject.transform.size}
      pivot={gameObject.transform.pivot}
      parentSize={parentSize}
    >
      <div ref={contentRef?.(gameObject)} className="absolute inset-0">
        {gameObject.components.map((component, index) => {
          const View = COMPONENT_REGISTRY[component.type]?.view;
          return View ? <View key={index} component={component} /> : null;
        })}
        {childObjects.map((child) =>
          child.active ? (
            <GameObjectView
              key={child.id}
              gameObject={child}
              allGameObjects={allGameObjects}
              parentSize={gameObject.transform.size}
              selectedId={selectedId}
              editMode={editMode}
              renderContent={renderContent}
              contentRef={contentRef}
            />
          ) : null,
        )}
        {renderContent?.(gameObject)}
      </div>
      {showOutline && (
        <div
          className={`pointer-events-none absolute inset-0 border-2 border-dashed ${
            selected ? "border-brand" : "border-white/60"
          }`}
        />
      )}
    </RectTransform>
  );
}

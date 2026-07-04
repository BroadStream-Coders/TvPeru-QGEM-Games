import React, { useMemo } from "react";
import { RectTransform, Vec2 } from "@engine/RectTransform";
import { GameObject } from "@engine/gameObject";
import { useComponentRegistry } from "@engine/componentRegistry";
import { useSceneViewMode } from "@engine/SceneViewMode";
import { useGameObjectAnimations } from "@engine/animations/useGameObjectAnimations";
import { mergeRefs } from "@engine/refs";
import {
  MaskComponent,
  maskStyle,
} from "@engine/components/mask/maskComponent";
import { ImageComponent } from "@engine/components/image/imageComponent";
import { useAssets } from "@engine/assetsContext";

interface GameObjectViewProps {
  gameObject: GameObject;
  allGameObjects: GameObject[];
  parentSize?: Vec2;
  selectedId?: string | null;
  renderContent?: (go: GameObject) => React.ReactNode;
  contentRef?: (go: GameObject) => React.Ref<HTMLDivElement> | undefined;
  onAnimatePosition?: (goId: string, position: Vec2) => void;
}

export function GameObjectView({
  gameObject,
  allGameObjects,
  parentSize,
  selectedId,
  renderContent,
  contentRef,
  onAnimatePosition,
}: GameObjectViewProps) {
  const viewMode = useSceneViewMode();
  const registry = useComponentRegistry();
  const selected = gameObject.id === selectedId;
  const showOutline = viewMode === "scene";

  const childObjects = allGameObjects.filter(
    (go) => go.parentId === gameObject.id,
  );

  const mask = gameObject.components.find(
    (c): c is MaskComponent => c.type === "mask",
  );
  const maskImage = gameObject.components.find(
    (c): c is ImageComponent => c.type === "image",
  );
  const { assets } = useAssets();
  const maskUrl =
    mask && maskImage?.assetKey ? assets[maskImage.assetKey]?.url : undefined;
  const wrapperStyle =
    maskUrl && maskImage ? maskStyle(maskUrl, maskImage.fit) : undefined;

  const animationRef = useGameObjectAnimations(gameObject, onAnimatePosition);
  const externalRef = contentRef?.(gameObject);
  const mergedContentRef = useMemo(
    () => mergeRefs(animationRef, externalRef),
    [animationRef, externalRef],
  );

  return (
    <RectTransform
      position={gameObject.transform.position}
      size={gameObject.transform.size}
      pivot={gameObject.transform.pivot}
      rotation={gameObject.transform.rotation}
      parentSize={parentSize}
    >
      <div
        ref={mergedContentRef}
        className="absolute inset-0"
        style={wrapperStyle}
      >
        {gameObject.components.map((component, index) => {
          if (mask && component === maskImage && !mask.showImage) return null;
          const View = registry.get(component.type)?.view;
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
              renderContent={renderContent}
              contentRef={contentRef}
              onAnimatePosition={onAnimatePosition}
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

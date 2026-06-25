"use client";

import { useEffect, useRef } from "react";
import { VideoControlComponent } from "@engine/components/videoControl/videoControlComponent";

function isTypingTarget(target: EventTarget | null): boolean {
  const node = target as HTMLElement | null;
  if (!node) return false;
  const tag = node.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    node.isContentEditable
  );
}

export function VideoControlView({
  component,
}: {
  component: VideoControlComponent;
}) {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const componentRef = useRef(component);
  componentRef.current = component;

  useEffect(() => {
    const findVideo = (): HTMLVideoElement | null => {
      const parent = anchorRef.current?.parentElement;
      if (!parent) return null;
      const video = Array.from(parent.children).find(
        (el): el is HTMLVideoElement => el instanceof HTMLVideoElement,
      );
      return video ?? null;
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || isTypingTarget(event.target)) return;
      const key = event.key.toLowerCase();
      const { pauseKey, restartKey } = componentRef.current;
      const video = findVideo();
      if (!video) return;
      if (key === pauseKey.toLowerCase()) {
        if (video.paused) void video.play().catch(() => {});
        else video.pause();
      } else if (key === restartKey.toLowerCase()) {
        video.pause();
        video.currentTime = 0;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return <span ref={anchorRef} className="hidden" />;
}

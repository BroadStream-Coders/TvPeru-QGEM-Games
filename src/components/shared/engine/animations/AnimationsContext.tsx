"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from "react";

export type AnimationTrigger = () => Promise<void>;

export interface AnimationsApi {
  register: (goId: string, type: string, fn: AnimationTrigger) => void;
  unregister: (goId: string, type: string) => void;
  play: (goId: string, type: string) => Promise<void>;
  playStagger: (
    goIds: string[],
    type: string,
    stepMs?: number,
  ) => Promise<void>;
}

const noop = () => {};
const resolved = () => Promise.resolve();
const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const AnimationsContext = createContext<AnimationsApi>({
  register: noop,
  unregister: noop,
  play: resolved,
  playStagger: resolved,
});

export function AnimationsProvider({ children }: { children: ReactNode }) {
  const mapRef = useRef<Map<string, Map<string, AnimationTrigger>>>(new Map());

  const register = useCallback(
    (goId: string, type: string, fn: AnimationTrigger) => {
      let byType = mapRef.current.get(goId);
      if (!byType) {
        byType = new Map();
        mapRef.current.set(goId, byType);
      }
      byType.set(type, fn);
    },
    [],
  );

  const unregister = useCallback((goId: string, type: string) => {
    const byType = mapRef.current.get(goId);
    if (!byType) return;
    byType.delete(type);
    if (byType.size === 0) mapRef.current.delete(goId);
  }, []);

  const play = useCallback(
    (goId: string, type: string) =>
      mapRef.current.get(goId)?.get(type)?.() ?? Promise.resolve(),
    [],
  );

  const playStagger = useCallback(
    (goIds: string[], type: string, stepMs = 100) =>
      Promise.all(
        goIds.map((goId, i) => delay(i * stepMs).then(() => play(goId, type))),
      ).then(noop),
    [play],
  );

  const api = useMemo(
    () => ({ register, unregister, play, playStagger }),
    [register, unregister, play, playStagger],
  );

  return (
    <AnimationsContext.Provider value={api}>
      {children}
    </AnimationsContext.Provider>
  );
}

export function useAnimations(): AnimationsApi {
  return useContext(AnimationsContext);
}

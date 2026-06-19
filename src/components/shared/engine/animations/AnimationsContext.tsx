"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from "react";

export type AnimationTrigger = () => void;

export interface AnimationsApi {
  register: (goId: string, type: string, fn: AnimationTrigger) => void;
  unregister: (goId: string, type: string) => void;
  trigger: (goId: string, type: string) => void;
}

const noop = () => {};

const AnimationsContext = createContext<AnimationsApi>({
  register: noop,
  unregister: noop,
  trigger: noop,
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

  const trigger = useCallback((goId: string, type: string) => {
    mapRef.current.get(goId)?.get(type)?.();
  }, []);

  const api = useMemo(
    () => ({ register, unregister, trigger }),
    [register, unregister, trigger],
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

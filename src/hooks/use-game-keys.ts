import { useEffect, useRef } from "react";

export interface GameKeyHandlers {
  /** Fila superior 0-9. Con Shift entrega el número +10. */
  onNumber?: (value: number) => void;
  /** Teclado numérico 0-9 (navegar entre grupos). */
  onNavigate?: (value: number) => void;
  /** Tecla N. */
  onNext?: () => void;
  /** Tecla B. */
  onBack?: () => void;
  /** Tecla M (mostrar respuesta). */
  onShowAnswer?: () => void;
  /** Tecla F (marcar error). */
  onMarkError?: () => void;
  /** Tecla E (interacción). */
  onInteract?: () => void;
}

export function useGameKeys(handlers: GameKeyHandlers) {
  const ref = useRef(handlers);

  useEffect(() => {
    ref.current = handlers;
  });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;

      const h = ref.current;
      const code = e.code;

      if (/^Digit[0-9]$/.test(code)) {
        if (!h.onNumber) return;
        e.preventDefault();
        const n = Number(code.slice(5));
        h.onNumber(e.shiftKey ? n + 10 : n);
        return;
      }

      if (/^Numpad[0-9]$/.test(code)) {
        if (!h.onNavigate) return;
        e.preventDefault();
        h.onNavigate(Number(code.slice(6)));
        return;
      }

      const map: Record<string, keyof GameKeyHandlers | undefined> = {
        KeyN: "onNext",
        KeyB: "onBack",
        KeyM: "onShowAnswer",
        KeyF: "onMarkError",
        KeyE: "onInteract",
      };
      const handlerKey = map[code];
      if (!handlerKey) return;
      const handler = h[handlerKey] as (() => void) | undefined;
      if (!handler) return;
      e.preventDefault();
      handler();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}

import { useEffect, useRef } from "react";

/**
 * Teclas que NO conviene usar como atajos de juego porque el navegador las
 * reserva y un `preventDefault()` no las detiene (o saca del fullscreen):
 *
 * - Escape       → siempre sale del fullscreen; el navegador lo intercepta antes,
 *                  no es cancelable desde la página.
 * - F11          → conmuta el fullscreen del navegador (no cancelable).
 * - F5 / Ctrl+R  → recargan la página.
 * - F12 / Ctrl+Shift+I → abren las DevTools.
 * - F3 / Ctrl+F  → buscar en la página.
 * - Tab          → mueve el foco entre elementos.
 * - Ctrl/Cmd + cualquier tecla → atajos del navegador/SO no cancelables
 *                  (Ctrl+1..9 cambia de pestaña, Ctrl+0 resetea zoom, W cierra
 *                  pestaña, T nueva pestaña…). Por eso este hook los ignora.
 *
 * Alt SÍ se usa, pero sólo en la fila de dígitos (Alt = +20): Alt+dígito no
 * tiene acción por defecto en el navegador y es cancelable. Fuera de los
 * dígitos, Alt se ignora.
 *
 * Seguras para mapear aquí: letras sueltas, dígitos, numpad y flechas
 * (estas últimas hacen scroll, por eso se cancela su acción por defecto).
 */
export interface GameKeyHandlers {
  /** Fila superior 0-9. Shift suma 10, Alt suma 20 (combinables → +30). */
  onNumber?: (value: number) => void;
  /** Teclado numérico 0-9 (navegar entre grupos). */
  onNavigate?: (value: number) => void;
  /** Tecla N. */
  onNext?: () => void;
  /** Tecla B. */
  onBack?: () => void;
  /** Tecla M (mostrar respuesta). */
  onShowAnswer?: () => void;
  /** Teclas Q/W/E/R (elegir opción 0-3). Si está definido, E deja de disparar onInteract. */
  onOption?: (index: number) => void;
  /** Tecla V (validar selección). */
  onValidate?: () => void;
  /** Tecla F (marcar error). */
  onMarkError?: () => void;
  /** Tecla E (interacción). */
  onInteract?: () => void;
  /** Tecla C (limpiar). */
  onClear?: () => void;
  /** Flecha arriba. */
  onArrowUp?: () => void;
  /** Flecha abajo. */
  onArrowDown?: () => void;
  /** Flecha izquierda. */
  onArrowLeft?: () => void;
  /** Flecha derecha. */
  onArrowRight?: () => void;
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
      if (e.repeat || e.ctrlKey || e.metaKey) return;

      const h = ref.current;
      const code = e.code;

      if (/^Digit[0-9]$/.test(code)) {
        if (!h.onNumber) return;
        e.preventDefault();
        const n = Number(code.slice(5));
        const offset = (e.shiftKey ? 10 : 0) + (e.altKey ? 20 : 0);
        h.onNumber(n + offset);
        return;
      }

      // Alt sólo aplica a la fila de dígitos; en el resto se ignora.
      if (e.altKey) return;

      if (/^Numpad[0-9]$/.test(code)) {
        if (!h.onNavigate) return;
        e.preventDefault();
        h.onNavigate(Number(code.slice(6)));
        return;
      }

      const optionMap: Record<string, number> = {
        KeyQ: 0,
        KeyW: 1,
        KeyE: 2,
        KeyR: 3,
      };
      if (h.onOption && code in optionMap) {
        e.preventDefault();
        h.onOption(optionMap[code]);
        return;
      }

      const map: Record<string, keyof GameKeyHandlers | undefined> = {
        KeyN: "onNext",
        KeyV: "onValidate",
        KeyB: "onBack",
        KeyM: "onShowAnswer",
        KeyF: "onMarkError",
        KeyE: "onInteract",
        KeyC: "onClear",
        ArrowUp: "onArrowUp",
        ArrowDown: "onArrowDown",
        ArrowLeft: "onArrowLeft",
        ArrowRight: "onArrowRight",
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

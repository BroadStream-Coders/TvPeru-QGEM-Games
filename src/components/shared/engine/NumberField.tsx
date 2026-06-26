import { useState } from "react";

type Token = { type: "num"; value: number } | { type: "op"; value: string };

function tokenize(input: string): Token[] | null {
  const tokens: Token[] = [];
  let i = 0;
  while (i < input.length) {
    const c = input[i];
    if (c === " ") {
      i++;
      continue;
    }
    if ("+-*/()".includes(c)) {
      tokens.push({ type: "op", value: c });
      i++;
      continue;
    }
    if ((c >= "0" && c <= "9") || c === ".") {
      let num = "";
      while (
        i < input.length &&
        ((input[i] >= "0" && input[i] <= "9") || input[i] === ".")
      ) {
        num += input[i];
        i++;
      }
      const n = Number(num);
      if (Number.isNaN(n)) return null;
      tokens.push({ type: "num", value: n });
      continue;
    }
    return null;
  }
  return tokens;
}

function evaluateExpression(input: string): number | null {
  const tokens = tokenize(input);
  if (!tokens || tokens.length === 0) return null;

  let pos = 0;
  const peek = () => tokens[pos];

  const parseFactor = (): number | null => {
    const t = peek();
    if (!t) return null;
    if (t.type === "op" && (t.value === "+" || t.value === "-")) {
      pos++;
      const f = parseFactor();
      if (f === null) return null;
      return t.value === "-" ? -f : f;
    }
    if (t.type === "op" && t.value === "(") {
      pos++;
      const e = parseExpr();
      if (e === null) return null;
      const close = peek();
      if (!close || close.type !== "op" || close.value !== ")") return null;
      pos++;
      return e;
    }
    if (t.type === "num") {
      pos++;
      return t.value;
    }
    return null;
  };

  const parseTerm = (): number | null => {
    let left = parseFactor();
    if (left === null) return null;
    let t = peek();
    while (t && t.type === "op" && (t.value === "*" || t.value === "/")) {
      pos++;
      const right = parseFactor();
      if (right === null) return null;
      left = t.value === "*" ? left * right : left / right;
      t = peek();
    }
    return left;
  };

  function parseExpr(): number | null {
    let left = parseTerm();
    if (left === null) return null;
    let t = peek();
    while (t && t.type === "op" && (t.value === "+" || t.value === "-")) {
      pos++;
      const right = parseTerm();
      if (right === null) return null;
      left = t.value === "+" ? left + right : left - right;
      t = peek();
    }
    return left;
  }

  const result = parseExpr();
  if (result === null || pos !== tokens.length) return null;
  if (!Number.isFinite(result)) return null;
  return result;
}

export function NumberInput({
  value,
  onChange,
  title,
  className,
}: {
  value: number;
  onChange: (value: number) => void;
  title?: string;
  className?: string;
}) {
  const [draft, setDraft] = useState<string | null>(null);

  const commit = () => {
    if (draft === null) return;
    const trimmed = draft.trim();
    const result =
      trimmed === "+" || trimmed === "-" ? 0 : evaluateExpression(trimmed);
    if (result !== null) onChange(result);
    setDraft(null);
  };

  return (
    <input
      type="text"
      inputMode="decimal"
      title={title}
      value={draft ?? String(value)}
      onFocus={() => setDraft(String(value))}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          commit();
        } else if (e.key === "Escape") {
          e.preventDefault();
          setDraft(null);
        }
      }}
      className={
        className ??
        "h-7 w-full min-w-0 rounded-[5px] border border-line bg-bg px-2 py-1 text-right text-xs font-mono text-ink outline-none focus:border-acc"
      }
    />
  );
}

export function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="flex items-center gap-2">
      <span className="w-[54px] shrink-0 text-2xs font-medium text-dim">
        {label}
      </span>
      <NumberInput value={value} onChange={onChange} />
    </label>
  );
}

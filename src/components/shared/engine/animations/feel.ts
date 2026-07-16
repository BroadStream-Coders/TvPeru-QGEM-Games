export const FEEL = {
  snappy: { type: "spring", visualDuration: 0.25, bounce: 0.2 },
  bouncy: { type: "spring", visualDuration: 0.45, bounce: 0.4 },
  gentle: { type: "spring", visualDuration: 0.6, bounce: 0.15 },
} as const;

export type FeelToken = keyof typeof FEEL;

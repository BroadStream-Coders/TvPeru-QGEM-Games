export const SOUNDS = {
  correctAnswer: "/audio/correct_answer.mp3",
  incorrectAnswer: "/audio/incorrect_answer.mp3",
} as const;

const cache = new Map<string, HTMLAudioElement>();

export function playSound(src: string) {
  let audio = cache.get(src);
  if (!audio) {
    audio = new Audio(src);
    cache.set(src, audio);
  }
  audio.currentTime = 0;
  audio.play().catch(() => {});
}

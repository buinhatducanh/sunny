// packages/utils/src/random.ts

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function randomBoolean(probability = 0.5): boolean {
  return Math.random() < probability;
}

export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = result[i]!;
    result[i] = result[j]!;
    result[j] = temp;
  }
  return result;
}

export function weightedRandom<T>(
  items: T[],
  weights: number[],
): T {
  if (items.length !== weights.length) {
    throw new Error("Items and weights must have the same length");
  }
  const total = weights.reduce((a, b) => a + b, 0);
  let rand = Math.random() * total;

  for (let i = 0; i < items.length; i++) {
    rand -= weights[i] ?? 0;
    if (rand <= 0) return items[i]!;
  }

  return items[items.length - 1]!;
}

export function weightedRandomIndex(weights: number[]): number {
  const total = weights.reduce((a, b) => a + b, 0);
  let rand = Math.random() * total;

  for (let i = 0; i < weights.length; i++) {
    rand -= weights[i] ?? 0;
    if (rand <= 0) return i;
  }

  return weights.length - 1;
}

export function pickRandom<T>(array: T[]): T {
  if (array.length === 0) throw new Error("Cannot pick from empty array");
  return array[Math.floor(Math.random() * array.length)]!;
}

export function pickRandomN<T>(array: T[], n: number): T[] {
  const shuffled = shuffleArray(array);
  return shuffled.slice(0, Math.min(n, array.length));
}

export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export function generateInviteCode(length = 6): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)]!;
  }
  return result;
}

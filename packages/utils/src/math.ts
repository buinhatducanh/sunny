// packages/utils/src/math.ts

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function floor(value: number): number {
  return Math.floor(value);
}

export function ceil(value: number): number {
  return Math.ceil(value);
}

export function round(value: number): number {
  return Math.round(value);
}

export function percentage(value: number, total: number): number {
  if (total === 0) return 0;
  return (value / total) * 100;
}

export function percentOf(percent: number, total: number): number {
  return (percent / 100) * total;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function inverseLerp(a: number, b: number, value: number): number {
  if (a === b) return 0;
  return (value - a) / (b - a);
}

export function remap(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
): number {
  const t = inverseLerp(inMin, inMax, value);
  return lerp(outMin, outMax, t);
}

export function compoundGrowth(
  base: number,
  rate: number,
  periods: number,
): number {
  return base * Math.pow(1 + rate, periods);
}

export function sum(values: number[]): number {
  return values.reduce((acc, v) => acc + v, 0);
}

export function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return sum(values) / values.length;
}

export function min(values: number[]): number {
  return Math.min(...values);
}

export function max(values: number[]): number {
  return Math.max(...values);
}

export function sign(value: number): number {
  return value < 0 ? -1 : value > 0 ? 1 : 0;
}

import type { Matrix2xN, ModelParams } from './types';
import { REP_THRESHOLD } from './types';

export function sampleX(n: number, S: number, out?: number[]): number[] {
  const x = out ?? new Array<number>(n);
  for (let i = 0; i < n; i++) x[i] = Math.random() < S ? 0 : Math.random();
  return x;
}

export function importance(i: number, r: number): number {
  return Math.pow(r, i);
}

export function forward(
  x: number[],
  W: Matrix2xN,
  b: number[],
  useReLU: boolean,
): { h: [number, number]; xhat: number[] } {
  const n = x.length;
  let h0 = 0;
  let h1 = 0;
  for (let i = 0; i < n; i++) {
    h0 += W[0][i] * x[i];
    h1 += W[1][i] * x[i];
  }
  const xhat = new Array<number>(n);
  for (let i = 0; i < n; i++) {
    const z = b[i] + W[0][i] * h0 + W[1][i] * h1;
    xhat[i] = useReLU ? Math.max(0, z) : z;
  }
  return { h: [h0, h1], xhat };
}

export function norms(W: Matrix2xN): number[] {
  const n = W[0].length;
  const out = new Array<number>(n);
  for (let i = 0; i < n; i++) out[i] = Math.hypot(W[0][i], W[1][i]);
  return out;
}

export function WtW(W: Matrix2xN): number[][] {
  const n = W[0].length;
  const out: number[][] = [];
  for (let i = 0; i < n; i++) {
    out[i] = new Array<number>(n);
    for (let j = 0; j < n; j++) {
      out[i][j] = W[0][i] * W[0][j] + W[1][i] * W[1][j];
    }
  }
  return out;
}

export function representedCount(W: Matrix2xN, threshold = REP_THRESHOLD): number {
  return norms(W).filter((v) => v > threshold).length;
}

export function shapeName(k: number): string {
  const named: Record<number, string> = {
    0: '—',
    1: 'point',
    2: 'antipodale',
    3: 'triangle',
    4: 'carré',
    5: 'pentagone',
    6: 'hexagone',
  };
  return named[k] ?? `${k}-gone`;
}

export function cloneParams(p: ModelParams): ModelParams {
  return {
    W: [p.W[0].slice(), p.W[1].slice()],
    b: p.b.slice(),
  };
}

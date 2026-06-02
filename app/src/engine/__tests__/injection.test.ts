import { describe, it, expect } from 'vitest';
import { createTrainer } from '../train';
import { WtW } from '../model';

function reconstruct(
  W: ReturnType<typeof createTrainer>['snapshot'] extends () => infer P ? (P extends { W: infer W } ? W : never) : never,
  b: number[],
  xin: number[],
  useReLU: boolean,
): number[] {
  const n = xin.length;
  const G = WtW(W as unknown as [number[], number[]]);
  const out = new Array<number>(n);
  for (let i = 0; i < n; i++) {
    let z = b[i];
    for (let k = 0; k < n; k++) z += G[i][k] * xin[k];
    out[i] = useReLU ? Math.max(0, z) : z;
  }
  return out;
}

describe('R6 injection / ghost invariant', () => {
  it('with ReLU ON + a single active feature in superposition regime, ghosts (xhat for inactive features) are small', () => {
    const trainer = createTrainer(5);
    for (let i = 0; i < 4000; i++) trainer.step(0.93, 0.97, true);
    const { W, b } = trainer.snapshot();

    const xin = [0.85, 0, 0, 0, 0];
    const xhRelu = reconstruct(W, b, xin, true);
    const ghostsRelu = xhRelu.slice(1);

    for (const g of ghostsRelu) {
      expect(g).toBeLessThan(0.2);
    }
  }, 15000);

  it('with ReLU OFF, ghosts become signed and at least one is non-negligible', () => {
    const trainer = createTrainer(5);
    for (let i = 0; i < 4000; i++) trainer.step(0.93, 0.97, true);
    const { W, b } = trainer.snapshot();

    const xin = [0.85, 0, 0, 0, 0];
    const xhLin = reconstruct(W, b, xin, false);
    const ghostsLin = xhLin.slice(1);
    const maxAbs = Math.max(...ghostsLin.map((g) => Math.abs(g)));
    const anyNeg = ghostsLin.some((g) => g < -0.02);

    expect(maxAbs).toBeGreaterThan(0.05);
    expect(anyNeg).toBe(true);
  }, 15000);
});

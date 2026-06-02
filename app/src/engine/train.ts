import type { Matrix2xN, ModelParams, StepOutput } from './types';
import {
  B,
  BETA1,
  BETA2,
  EPS,
  INIT_RANGE,
  LR,
  M,
} from './types';
import { cloneParams, importance } from './model';

export type Trainer = {
  step(S: number, r: number, useReLU: boolean): StepOutput;
  reset(n: number): void;
  snapshot(): ModelParams;
  n(): number;
};

export function createTrainer(initialN: number): Trainer {
  let n = initialN;
  let W: Matrix2xN = [[], []];
  let b: number[] = [];
  let mW: Matrix2xN = [[], []];
  let vW: Matrix2xN = [[], []];
  let mb: number[] = [];
  let vb: number[] = [];
  let t = 0;

  function init(newN: number) {
    n = newN;
    W = [new Array(n), new Array(n)];
    mW = [new Array(n), new Array(n)];
    vW = [new Array(n), new Array(n)];
    b = new Array(n);
    mb = new Array(n);
    vb = new Array(n);
    t = 0;
    for (let i = 0; i < n; i++) {
      W[0][i] = (Math.random() * 2 - 1) * INIT_RANGE;
      W[1][i] = (Math.random() * 2 - 1) * INIT_RANGE;
      mW[0][i] = 0;
      mW[1][i] = 0;
      vW[0][i] = 0;
      vW[1][i] = 0;
      b[i] = 0;
      mb[i] = 0;
      vb[i] = 0;
    }
  }

  init(n);

  function step(S: number, r: number, useReLU: boolean): StepOutput {
    const gW0 = new Array<number>(n).fill(0);
    const gW1 = new Array<number>(n).fill(0);
    const gb = new Array<number>(n).fill(0);
    let lossSum = 0;
    const x = new Array<number>(n);
    const z = new Array<number>(n);
    const xh = new Array<number>(n);
    const g = new Array<number>(n);

    for (let s = 0; s < B; s++) {
      for (let i = 0; i < n; i++) x[i] = Math.random() < S ? 0 : Math.random();

      let h0 = 0;
      let h1 = 0;
      for (let i = 0; i < n; i++) {
        h0 += W[0][i] * x[i];
        h1 += W[1][i] * x[i];
      }

      for (let i = 0; i < n; i++) {
        z[i] = b[i] + W[0][i] * h0 + W[1][i] * h1;
        xh[i] = useReLU ? Math.max(0, z[i]) : z[i];
        const err = xh[i] - x[i];
        const I = importance(i, r);
        lossSum += I * err * err;
        const dz = useReLU && z[i] <= 0 ? 0 : 1;
        g[i] = 2 * I * err * dz;
      }

      let dh0 = 0;
      let dh1 = 0;
      for (let i = 0; i < n; i++) {
        dh0 += g[i] * W[0][i];
        dh1 += g[i] * W[1][i];
        gb[i] += g[i];
      }
      for (let i = 0; i < n; i++) {
        gW0[i] += g[i] * h0 + dh0 * x[i];
        gW1[i] += g[i] * h1 + dh1 * x[i];
      }
    }

    t++;
    const bc1 = 1 - Math.pow(BETA1, t);
    const bc2 = 1 - Math.pow(BETA2, t);

    for (let i = 0; i < n; i++) {
      const g0 = gW0[i] / B;
      mW[0][i] = BETA1 * mW[0][i] + (1 - BETA1) * g0;
      vW[0][i] = BETA2 * vW[0][i] + (1 - BETA2) * g0 * g0;
      W[0][i] -= LR * (mW[0][i] / bc1) / (Math.sqrt(vW[0][i] / bc2) + EPS);

      const g1 = gW1[i] / B;
      mW[1][i] = BETA1 * mW[1][i] + (1 - BETA1) * g1;
      vW[1][i] = BETA2 * vW[1][i] + (1 - BETA2) * g1 * g1;
      W[1][i] -= LR * (mW[1][i] / bc1) / (Math.sqrt(vW[1][i] / bc2) + EPS);
    }
    for (let i = 0; i < n; i++) {
      const gr = gb[i] / B;
      mb[i] = BETA1 * mb[i] + (1 - BETA1) * gr;
      vb[i] = BETA2 * vb[i] + (1 - BETA2) * gr * gr;
      b[i] -= LR * (mb[i] / bc1) / (Math.sqrt(vb[i] / bc2) + EPS);
    }

    return { W, b, loss: lossSum / B };
  }

  return {
    step,
    reset: init,
    snapshot: () => cloneParams({ W, b }),
    n: () => n,
  };
}

export { M };

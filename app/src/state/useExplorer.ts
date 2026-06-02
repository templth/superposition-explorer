import { create } from 'zustand';
import { createTrainer, type Trainer } from '../engine/train';
import type { Matrix2xN } from '../engine/types';

const DEFAULT_N = 5;
const DEFAULT_S = 0.1;
const DEFAULT_R = 0.9;
const LOSS_HISTORY_MAX = 600;

export type RenderId = 1 | 2 | 3 | 4 | 5 | 6 | 7;

let trainer: Trainer | null = null;
function getTrainer(n: number): Trainer {
  if (!trainer) trainer = createTrainer(n);
  return trainer;
}

function freshXin(n: number): number[] {
  const x = new Array<number>(n).fill(0);
  if (n > 0) x[0] = 0.85;
  return x;
}

function snapshotW(t: Trainer): Matrix2xN {
  const s = t.snapshot();
  return s.W;
}

export type ExplorerState = {
  n: number;
  S: number;
  r: number;
  useReLU: boolean;
  paused: boolean;
  xin: number[];
  W: Matrix2xN;
  b: number[];
  loss: number;
  lossHistory: number[];
  step: number;
  presenterRender: RenderId | null;
  setPresenterRender: (v: RenderId | null) => void;
  setS: (v: number) => void;
  setR: (v: number) => void;
  setReLU: (v: boolean) => void;
  setN: (v: number) => void;
  setXin: (i: number, v: number) => void;
  setPaused: (v: boolean) => void;
  retrain: () => void;
  publish: (W: Matrix2xN, b: number[], loss: number) => void;
};

export const useExplorer = create<ExplorerState>((set, get) => {
  const t = getTrainer(DEFAULT_N);
  const snap = t.snapshot();
  return {
    n: DEFAULT_N,
    S: DEFAULT_S,
    r: DEFAULT_R,
    useReLU: true,
    paused: false,
    xin: freshXin(DEFAULT_N),
    W: snap.W,
    b: snap.b,
    loss: 0,
    lossHistory: [],
    step: 0,
    presenterRender: null,
    setPresenterRender: (v) => set({ presenterRender: v }),
    setS: (v) => set({ S: v }),
    setR: (v) => set({ r: v }),
    setReLU: (v) => set({ useReLU: v }),
    setN: (v) => {
      if (v === get().n) return;
      const tr = getTrainer(v);
      tr.reset(v);
      const s = tr.snapshot();
      set({ n: v, xin: freshXin(v), W: s.W, b: s.b, loss: 0, lossHistory: [], step: 0 });
    },
    setXin: (i, v) => {
      const next = get().xin.slice();
      next[i] = v;
      set({ xin: next });
    },
    setPaused: (v) => set({ paused: v }),
    retrain: () => {
      const tr = getTrainer(get().n);
      tr.reset(get().n);
      const s = tr.snapshot();
      set({ W: s.W, b: s.b, loss: 0, lossHistory: [], step: 0, paused: false });
    },
    publish: (W, b, loss) => {
      const st = get();
      const hist = st.lossHistory;
      const next = hist.length >= LOSS_HISTORY_MAX
        ? hist.slice(hist.length - LOSS_HISTORY_MAX + 1).concat(loss)
        : hist.concat(loss);
      set({ W, b, loss, lossHistory: next, step: st.step + 1 });
    },
  };
});

export function getCurrentTrainer(): Trainer {
  return getTrainer(useExplorer.getState().n);
}

export { snapshotW };

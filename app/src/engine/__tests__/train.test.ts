import { describe, it, expect } from 'vitest';
import { createTrainer } from '../train';

describe('createTrainer', () => {
  it('decreases loss over training steps (n=5, S=0.1, r=0.9, ReLU)', () => {
    const trainer = createTrainer(5);
    const S = 0.1;
    const r = 0.9;
    const useReLU = true;

    let earlyLoss = 0;
    for (let i = 0; i < 10; i++) earlyLoss = trainer.step(S, r, useReLU).loss;

    let lateLoss = 0;
    for (let i = 0; i < 200; i++) lateLoss = trainer.step(S, r, useReLU).loss;

    expect(lateLoss).toBeLessThan(earlyLoss);
    expect(lateLoss).toBeLessThan(0.5);
    expect(Number.isFinite(lateLoss)).toBe(true);
  });

  it('reset reinitializes params after n change', () => {
    const trainer = createTrainer(3);
    for (let i = 0; i < 50; i++) trainer.step(0.5, 0.9, true);
    const before = trainer.snapshot();
    trainer.reset(6);
    const after = trainer.snapshot();
    expect(after.W[0].length).toBe(6);
    expect(after.b.length).toBe(6);
    expect(after.W[0]).not.toEqual(before.W[0]);
  });

  it('produces no NaN for n=2 and n=6', () => {
    for (const n of [2, 6]) {
      const trainer = createTrainer(n);
      for (let i = 0; i < 100; i++) {
        const { loss } = trainer.step(0.9, 0.95, true);
        expect(Number.isFinite(loss)).toBe(true);
      }
    }
  });
});

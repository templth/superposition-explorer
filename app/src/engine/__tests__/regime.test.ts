import { describe, it, expect } from 'vitest';
import { createTrainer } from '../train';
import { classifyFeatures, norms } from '../model';

describe('R7 regime classification', () => {
  it('low sparsity → some features dedicated, others absent', () => {
    const trainer = createTrainer(5);
    for (let i = 0; i < 4000; i++) trainer.step(0.05, 0.85, true);
    const { W } = trainer.snapshot();
    const regimes = classifyFeatures(W);
    expect(regimes.filter((r) => r === 'dedicated').length).toBeGreaterThanOrEqual(1);
    expect(regimes.filter((r) => r === 'absent').length).toBeGreaterThanOrEqual(1);
  }, 15000);

  it('pentagon regime → all features superposed', () => {
    const trainer = createTrainer(5);
    for (let i = 0; i < 4000; i++) trainer.step(0.93, 0.97, true);
    const { W } = trainer.snapshot();
    const regimes = classifyFeatures(W);
    const nrm = norms(W);
    expect(nrm.every((v) => v > 0.4)).toBe(true);
    expect(regimes.filter((r) => r === 'superposed').length).toBeGreaterThanOrEqual(4);
  }, 15000);
});

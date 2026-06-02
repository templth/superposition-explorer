import { describe, it, expect } from 'vitest';
import { createTrainer } from '../train';
import { norms, representedCount } from '../model';

describe('preset Pentagone parity', () => {
  it('produces 5 represented features at n=5, S=0.93, r=0.97 within reasonable training budget', () => {
    const trainer = createTrainer(5);
    for (let i = 0; i < 4000; i++) trainer.step(0.93, 0.97, true);
    const snap = trainer.snapshot();
    const ns = norms(snap.W);
    expect(representedCount(snap.W)).toBe(5);
    for (const v of ns) {
      expect(v).toBeGreaterThan(0.5);
      expect(v).toBeLessThan(1.3);
    }
  }, 15000);

  it('low-sparsity case: only ~2 features dominate at n=5, S=0.05', () => {
    const trainer = createTrainer(5);
    for (let i = 0; i < 4000; i++) trainer.step(0.05, 0.85, true);
    const rep = representedCount(trainer.snapshot().W);
    expect(rep).toBeLessThanOrEqual(3);
    expect(rep).toBeGreaterThanOrEqual(1);
  }, 15000);
});

import { useEffect } from 'react';
import { useExplorer, getCurrentTrainer } from './useExplorer';
import { K } from '../engine/types';

export function useTrainingLoop() {
  useEffect(() => {
    let raf = 0;
    let running = true;

    const tick = () => {
      if (!running) return;
      const st = useExplorer.getState();
      const trainer = getCurrentTrainer();

      if (!st.paused) {
        let last = 0;
        for (let k = 0; k < K; k++) last = trainer.step(st.S, st.r, st.useReLU).loss;
        const snap = trainer.snapshot();
        st.publish(snap.W, snap.b, last);
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
    };
  }, []);
}

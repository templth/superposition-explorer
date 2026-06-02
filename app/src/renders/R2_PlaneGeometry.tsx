import { useExplorer } from '../state/useExplorer';
import { PlaneArrows } from './PlaneArrows';

export function R2_PlaneGeometry() {
  const W = useExplorer((s) => s.W);
  const n = useExplorer((s) => s.n);

  return (
    <svg viewBox="0 0 400 400" preserveAspectRatio="xMidYMid meet" style={{ display: 'block', width: '100%', height: 'auto' }}>
      <PlaneArrows W={W} n={n} size={400} />
    </svg>
  );
}

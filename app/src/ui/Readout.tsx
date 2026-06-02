import { useExplorer } from '../state/useExplorer';
import { representedCount, shapeName } from '../engine/model';

export function Readout() {
  const W = useExplorer((s) => s.W);
  const useReLU = useExplorer((s) => s.useReLU);
  const loss = useExplorer((s) => s.loss);

  const rep = representedCount(W);
  const geom = useReLU ? shapeName(rep) : 'orthogonale';

  return (
    <div style={{ display: 'flex', gap: 32, padding: '16px 0', borderTop: '1px solid #2a2e37', marginTop: 16, fontFamily: 'IBM Plex Mono, monospace' }}>
      <div>
        <div style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#7b7d82' }}>Représentées</div>
        <div style={{ fontSize: 22, marginTop: 4 }}><b style={{ color: '#e0a64a' }}>{rep}</b> / 2 dim.</div>
      </div>
      <div>
        <div style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#7b7d82' }}>Géométrie</div>
        <div style={{ fontSize: 16, marginTop: 4 }}>{geom}</div>
      </div>
      <div>
        <div style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#7b7d82' }}>Perte</div>
        <div style={{ fontSize: 16, marginTop: 4 }}>{loss.toFixed(4)}</div>
      </div>
    </div>
  );
}

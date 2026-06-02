import { useExplorer } from '../state/useExplorer';
import { PlaneArrows } from './PlaneArrows';
import { representedCount, shapeName } from '../engine/model';

export function R5_ReluCompare() {
  const W = useExplorer((s) => s.W);
  const n = useExplorer((s) => s.n);
  const useReLU = useExplorer((s) => s.useReLU);
  const loss = useExplorer((s) => s.loss);
  const setReLU = useExplorer((s) => s.setReLU);

  const rep = representedCount(W);
  const regime = useReLU ? shapeName(rep) : 'orthogonale';
  const regimeLabel = `ReLU ${useReLU ? 'ON' : 'OFF'} · ${regime}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={() => setReLU(!useReLU)}
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 14,
            letterSpacing: '0.08em',
            padding: '12px 22px',
            borderRadius: 3,
            cursor: 'pointer',
            border: '1px solid',
            borderColor: useReLU ? 'var(--pos)' : 'var(--neg)',
            background: useReLU ? 'var(--pos)' : 'var(--neg)',
            color: 'var(--bg)',
            transition: '0.15s',
          }}
        >
          ReLU {useReLU ? 'ON' : 'OFF'}
        </button>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <div
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 10,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--dim)',
            }}
          >
            Perte
          </div>
          <div
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 30,
              color: useReLU ? 'var(--pos)' : 'var(--neg)',
              lineHeight: 1,
              marginTop: 4,
            }}
          >
            {loss.toFixed(4)}
          </div>
        </div>
      </div>

      <svg
        viewBox="0 0 400 400"
        preserveAspectRatio="xMidYMid meet"
        style={{ display: 'block', width: '100%', maxWidth: 340, height: 'auto', margin: '0 auto' }}
      >
        <PlaneArrows W={W} n={n} size={400} />
      </svg>

      <div
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 12,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          textAlign: 'center',
          color: useReLU ? 'var(--pos)' : 'var(--neg)',
          paddingTop: 8,
          borderTop: '1px solid var(--line)',
        }}
      >
        {regimeLabel}
      </div>
    </div>
  );
}

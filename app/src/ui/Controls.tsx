import { useExplorer } from '../state/useExplorer';

const N_CHOICES = [2, 3, 4, 5, 6];

type Preset = { label: string; n: number; S: number; r: number };
const PRESETS: Preset[] = [
  { label: 'Compression (2 orth.)', n: 5, S: 0.05, r: 0.85 },
  { label: 'Antipodale n=2', n: 2, S: 0.9, r: 0.9 },
  { label: 'Triangle n=3', n: 3, S: 0.9, r: 0.95 },
  { label: 'Carré n=4', n: 4, S: 0.91, r: 0.95 },
  { label: 'Pentagone n=5', n: 5, S: 0.93, r: 0.97 },
];

const labelStyle: React.CSSProperties = {
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: 11,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: 'var(--dim)',
  minWidth: 96,
};
const numStyle: React.CSSProperties = {
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: 13,
  color: 'var(--text)',
  minWidth: 56,
  textAlign: 'right',
};
const btnBase: React.CSSProperties = {
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: 11,
  letterSpacing: '0.06em',
  background: 'var(--panel2)',
  color: 'var(--text)',
  border: '1px solid var(--line)',
  padding: '8px 13px',
  borderRadius: 3,
  cursor: 'pointer',
  transition: '0.15s',
};
const btnOn: React.CSSProperties = {
  ...btnBase,
  background: 'var(--pos)',
  color: 'var(--bg)',
  borderColor: 'var(--pos)',
};

export function Controls() {
  const n = useExplorer((s) => s.n);
  const S = useExplorer((s) => s.S);
  const r = useExplorer((s) => s.r);
  const useReLU = useExplorer((s) => s.useReLU);
  const paused = useExplorer((s) => s.paused);
  const setS = useExplorer((s) => s.setS);
  const setR = useExplorer((s) => s.setR);
  const setReLU = useExplorer((s) => s.setReLU);
  const setN = useExplorer((s) => s.setN);
  const setPaused = useExplorer((s) => s.setPaused);
  const retrain = useExplorer((s) => s.retrain);

  const applyPreset = (p: Preset) => {
    setN(p.n);
    setS(p.S);
    setR(p.r);
  };

  return (
    <div
      style={{
        marginTop: 24,
        background: 'var(--panel)',
        border: '1px solid var(--line)',
        borderRadius: 4,
        padding: '20px 22px',
      }}
    >
      <div style={rowStyle}>
        <span style={{ ...labelStyle, width: '100%', marginBottom: 10 }}>Cas types</span>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {PRESETS.map((p) => (
            <button key={p.label} style={btnBase} onClick={() => applyPreset(p)}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div style={rowStyle}>
        <label style={labelStyle}>Sparsité S</label>
        <input
          type="range"
          min={0}
          max={0.97}
          step={0.01}
          value={S}
          onChange={(e) => setS(+e.target.value)}
          style={sliderStyle}
        />
        <span style={numStyle}>{S.toFixed(2)}</span>
      </div>

      <div style={rowStyle}>
        <label style={labelStyle}>Importance r</label>
        <input
          type="range"
          min={0.4}
          max={1}
          step={0.01}
          value={r}
          onChange={(e) => setR(+e.target.value)}
          style={sliderStyle}
        />
        <span style={numStyle}>{r.toFixed(2)}</span>
      </div>

      <div style={rowStyle}>
        <label style={labelStyle}>Features n</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {N_CHOICES.map((v) => (
            <button
              key={v}
              style={{ ...(n === v ? btnOn : btnBase), minWidth: 34 }}
              onClick={() => setN(v)}
            >
              {v}
            </button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <label style={{ ...labelStyle, minWidth: 'auto' }}>Non-linéarité</label>
          <button
            style={useReLU ? btnOn : btnBase}
            onClick={() => setReLU(!useReLU)}
          >
            ReLU {useReLU ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      <div style={{ ...rowStyle, marginBottom: 0 }}>
        <label style={labelStyle}>Entraînement</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={paused ? btnOn : btnBase} onClick={() => setPaused(!paused)}>
            {paused ? '▶ Reprendre' : '⏸ Pause'}
          </button>
          <button style={btnBase} onClick={retrain}>
            ↻ Réentraîner depuis zéro
          </button>
        </div>
        <span style={{ ...numStyle, minWidth: 'auto', color: 'var(--dim)' }}>
          {paused ? 'figé' : 'apprend…'}
        </span>
      </div>
    </div>
  );
}

const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 18,
  flexWrap: 'wrap',
  marginBottom: 18,
};
const sliderStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 160,
  height: 2,
  background: 'var(--line)',
  borderRadius: 2,
  appearance: 'none',
  WebkitAppearance: 'none',
  outline: 'none',
};

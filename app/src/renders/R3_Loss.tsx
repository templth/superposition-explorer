import { useExplorer } from '../state/useExplorer';

const W_SVG = 720;
const H_SVG = 220;
const PAD_L = 56;
const PAD_R = 16;
const PAD_T = 16;
const PAD_B = 28;

function convergenceLabel(hist: number[]): string {
  if (hist.length < 30) return 'init.';
  const tail = hist.slice(-30);
  const mean = tail.reduce((a, b) => a + b, 0) / tail.length;
  const variance = tail.reduce((a, b) => a + (b - mean) ** 2, 0) / tail.length;
  const cv = mean > 1e-6 ? Math.sqrt(variance) / mean : 0;
  if (cv < 0.02) return 'convergé';
  if (cv < 0.08) return 'stabilisation';
  return 'descente';
}

export function R3_Loss() {
  const hist = useExplorer((s) => s.lossHistory);
  const loss = useExplorer((s) => s.loss);
  const step = useExplorer((s) => s.step);
  const paused = useExplorer((s) => s.paused);
  const setPaused = useExplorer((s) => s.setPaused);
  const retrain = useExplorer((s) => s.retrain);

  const innerW = W_SVG - PAD_L - PAD_R;
  const innerH = H_SVG - PAD_T - PAD_B;

  const N = hist.length;
  const yMax = N > 0 ? Math.max(...hist) : 1;
  const yMin = N > 0 ? Math.min(...hist) : 0;
  const span = Math.max(0.001, yMax - yMin);
  const yPad = span * 0.08;
  const yHi = yMax + yPad;
  const yLo = Math.max(0, yMin - yPad);
  const ySpan = Math.max(0.001, yHi - yLo);

  const path = N > 1
    ? hist
        .map((v, i) => {
          const x = PAD_L + (i / Math.max(1, N - 1)) * innerW;
          const y = PAD_T + (1 - (v - yLo) / ySpan) * innerH;
          return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
        })
        .join(' ')
    : '';

  const lastX = PAD_L + innerW;
  const lastY = N > 0 ? PAD_T + (1 - (hist[N - 1] - yLo) / ySpan) * innerH : 0;

  const conv = convergenceLabel(hist);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setPaused(!paused)}
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11,
              letterSpacing: '0.1em',
              padding: '8px 16px',
              borderRadius: 3,
              border: `1px solid ${paused ? 'var(--pos)' : 'var(--line)'}`,
              background: paused ? 'var(--pos)' : 'var(--panel2)',
              color: paused ? 'var(--bg)' : 'var(--text)',
              cursor: 'pointer',
            }}
          >
            {paused ? 'reprendre' : 'pause'}
          </button>
          <button
            onClick={retrain}
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11,
              letterSpacing: '0.1em',
              padding: '8px 16px',
              borderRadius: 3,
              border: '1px solid var(--line)',
              background: 'var(--panel2)',
              color: 'var(--text)',
              cursor: 'pointer',
            }}
          >
            réentraîner
          </button>
        </div>
        <div style={{ display: 'flex', gap: 22, alignItems: 'baseline' }}>
          <div>
            <div style={tagStyle}>perte</div>
            <div style={valStyle}>{loss.toFixed(4)}</div>
          </div>
          <div>
            <div style={tagStyle}>pas</div>
            <div style={valStyle}>{step}</div>
          </div>
          <div>
            <div style={tagStyle}>état</div>
            <div style={{ ...valStyle, color: 'var(--rep)' }}>{conv}</div>
          </div>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W_SVG} ${H_SVG}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ display: 'block', width: '100%', height: 'auto' }}
      >
        <rect
          x={PAD_L}
          y={PAD_T}
          width={innerW}
          height={innerH}
          fill="none"
          stroke="var(--line)"
          strokeWidth={1}
        />

        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const y = PAD_T + t * innerH;
          const val = yHi - t * ySpan;
          return (
            <g key={`g${t}`}>
              <line x1={PAD_L} y1={y} x2={PAD_L + innerW} y2={y} stroke="var(--line)" strokeWidth={0.5} strokeDasharray="2 3" opacity={0.5} />
              <text
                x={PAD_L - 8}
                y={y + 3}
                textAnchor="end"
                fontFamily="'IBM Plex Mono', monospace"
                fontSize={9}
                fill="var(--dim)"
              >
                {val.toFixed(3)}
              </text>
            </g>
          );
        })}

        {N > 1 && (
          <path
            d={path}
            fill="none"
            stroke="var(--pos)"
            strokeWidth={1.6}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}

        {N > 0 && (
          <circle cx={lastX} cy={lastY} r={3.5} fill="var(--pos)" stroke="var(--bg)" strokeWidth={1.2} />
        )}

        <text
          x={PAD_L}
          y={H_SVG - 8}
          fontFamily="'IBM Plex Mono', monospace"
          fontSize={9}
          fill="var(--dim)"
          letterSpacing="0.12em"
        >
          PAS D'ENTRAÎNEMENT
        </text>
        <text
          x={PAD_L - 44}
          y={PAD_T + 8}
          fontFamily="'IBM Plex Mono', monospace"
          fontSize={9}
          fill="var(--dim)"
          letterSpacing="0.12em"
        >
          PERTE
        </text>
      </svg>
    </div>
  );
}

const tagStyle: React.CSSProperties = {
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: 9,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: 'var(--dim)',
};
const valStyle: React.CSSProperties = {
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: 18,
  color: 'var(--text)',
  lineHeight: 1,
  marginTop: 2,
};

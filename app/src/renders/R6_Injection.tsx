import { useExplorer } from '../state/useExplorer';
import { HUES } from '../engine/palette';
import { PlaneArrows } from './PlaneArrows';
import { WtW } from '../engine/model';

const CHIP_VAL = 0.85;
const BAR_SIZE = 200;

type BarsProps = {
  vals: number[];
  n: number;
  ghostOf: (i: number) => boolean;
};

function Bars({ vals, n, ghostOf }: BarsProps) {
  const base = 150;
  const bw = 180 / n;
  const x0 = 12;
  const sc = 105;

  const items = [];
  items.push(
    <line key="base" x1={8} y1={base} x2={192} y2={base} stroke="var(--line)" strokeWidth={1} />,
  );

  for (let i = 0; i < n; i++) {
    const v = vals[i];
    const ghost = ghostOf(i);
    const x = x0 + i * bw + bw * 0.18;
    const w = bw * 0.64;
    const col = HUES[i % HUES.length];

    if (v >= 0) {
      const h2 = Math.min(128, v * sc);
      const y = base - h2;
      items.push(
        <rect
          key={`b${i}`}
          x={x}
          y={y}
          width={w}
          height={h2}
          rx={2}
          fill={ghost ? 'none' : col}
          opacity={ghost ? 0.9 : 1}
          stroke={ghost ? col : 'none'}
          strokeDasharray={ghost ? '3 3' : undefined}
          strokeWidth={ghost ? 1.4 : 0}
        />,
      );
    } else {
      const h2 = Math.min(45, -v * sc);
      items.push(
        <rect
          key={`b${i}`}
          x={x}
          y={base}
          width={w}
          height={h2}
          rx={2}
          fill="none"
          stroke={col}
          strokeDasharray="3 3"
          strokeWidth={1.4}
          opacity={0.7}
        />,
      );
    }

    items.push(
      <text
        key={`t${i}`}
        x={x + w / 2}
        y={base + 15}
        textAnchor="middle"
        fontFamily="'IBM Plex Mono', monospace"
        fontSize={10}
        fill={col}
        opacity={ghost ? 0.7 : 1}
      >
        {i}
      </text>,
    );
  }

  return (
    <svg
      viewBox={`0 0 ${BAR_SIZE} ${BAR_SIZE}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ display: 'block', maxWidth: 230, margin: '0 auto' }}
    >
      {items}
    </svg>
  );
}

export function R6_Injection() {
  const W = useExplorer((s) => s.W);
  const b = useExplorer((s) => s.b);
  const n = useExplorer((s) => s.n);
  const useReLU = useExplorer((s) => s.useReLU);
  const xin = useExplorer((s) => s.xin);
  const setXin = useExplorer((s) => s.setXin);

  let h0 = 0;
  let h1 = 0;
  for (let i = 0; i < n; i++) {
    h0 += (W[0][i] ?? 0) * (xin[i] ?? 0);
    h1 += (W[1][i] ?? 0) * (xin[i] ?? 0);
  }
  const G = WtW(W);
  const xh = new Array<number>(n);
  for (let i = 0; i < n; i++) {
    let z = b[i] ?? 0;
    for (let k = 0; k < n; k++) z += G[i][k] * (xin[k] ?? 0);
    xh[i] = useReLU ? Math.max(0, z) : z;
  }

  const activeCount = xin.filter((v) => v > 0).length;

  const toggleChip = (i: number) => {
    setXin(i, (xin[i] ?? 0) > 0 ? 0 : CHIP_VAL);
  };

  const hCx = 100;
  const hCy = 100;
  const hSc = 64;
  const hx = hCx + h0 * hSc;
  const hy = hCy - h1 * hSc;

  return (
    <div>
      <div
        style={{
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          marginBottom: 20,
        }}
      >
        {Array.from({ length: n }, (_, i) => {
          const active = (xin[i] ?? 0) > 0;
          const col = HUES[i % HUES.length];
          return (
            <button
              key={i}
              onClick={() => toggleChip(i)}
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11,
                padding: '6px 12px',
                borderRadius: 3,
                border: `1px solid ${active ? col : 'var(--line)'}`,
                background: active ? col : 'var(--panel2)',
                color: active ? 'var(--bg)' : 'var(--dim)',
                cursor: 'pointer',
                transition: '0.15s',
              }}
            >
              feature {i}
            </button>
          );
        })}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1.05fr auto 1fr',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={capStyle}>Entrée x</div>
          <Bars vals={xin} n={n} ghostOf={() => false} />
        </div>
        <div style={arrowStyle}>h = W·x</div>
        <div style={{ textAlign: 'center' }}>
          <div style={capStyle}>h dans le plan ℝ²</div>
          <svg
            viewBox="0 0 200 200"
            preserveAspectRatio="xMidYMid meet"
            style={{ display: 'block', maxWidth: 230, margin: '0 auto' }}
          >
            <PlaneArrows
              W={W}
              n={n}
              size={200}
              scale={hSc}
              showLabels={false}
              showUnitCircle
              showAxes
              dimInactive={xin}
            />
            <line
              x1={hCx}
              y1={hCy}
              x2={hx}
              y2={hy}
              stroke="#e9e6dc"
              strokeWidth={1}
              strokeDasharray="2 3"
              opacity={0.55}
            />
            <circle cx={hx} cy={hy} r={5} fill="#e9e6dc" stroke="var(--bg)" strokeWidth={1.5} />
            <text
              x={hx + 8}
              y={hy - 6}
              fontFamily="'IBM Plex Mono', monospace"
              fontSize={11}
              fill="#e9e6dc"
            >
              h
            </text>
          </svg>
        </div>
        <div style={arrowStyle}>ReLU(Wᵀh + b)</div>
        <div style={{ textAlign: 'center' }}>
          <div style={capStyle}>Reconstruction x̂</div>
          <Bars vals={xh} n={n} ghostOf={(i) => (xin[i] ?? 0) <= 0} />
        </div>
      </div>

      <div
        style={{
          marginTop: 6,
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 10,
          color: 'var(--dim)',
          textAlign: 'right',
        }}
      >
        {activeCount} active{activeCount > 1 ? 's' : ''}
      </div>
    </div>
  );
}

const capStyle: React.CSSProperties = {
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: 10,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: 'var(--dim)',
  marginBottom: 8,
};
const arrowStyle: React.CSSProperties = {
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: 10,
  color: 'var(--faint)',
  textAlign: 'center',
  whiteSpace: 'nowrap',
  padding: '0 4px',
};

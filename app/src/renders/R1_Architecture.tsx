import { useExplorer } from '../state/useExplorer';
import { HUES } from '../engine/palette';
import { forward } from '../engine/model';

const CHIP_VAL = 0.85;
const W_SVG = 720;
const H_SVG = 320;

export function R1_Architecture() {
  const W = useExplorer((s) => s.W);
  const b = useExplorer((s) => s.b);
  const n = useExplorer((s) => s.n);
  const useReLU = useExplorer((s) => s.useReLU);
  const xin = useExplorer((s) => s.xin);
  const setXin = useExplorer((s) => s.setXin);

  const { h, xhat } = forward(xin, W, b, useReLU);

  const xLeft = 130;
  const xMidL = 320;
  const xMidR = 400;
  const xRight = 600;
  const colTop = 60;
  const colBot = 280;
  const rowH = (colBot - colTop) / Math.max(1, n - 1);

  const featY = (i: number) => (n === 1 ? (colTop + colBot) / 2 : colTop + i * rowH);

  const h0y = 130;
  const h1y = 210;

  const toggle = (i: number) => setXin(i, (xin[i] ?? 0) > 0 ? 0 : CHIP_VAL);

  const items: React.ReactNode[] = [];

  for (let i = 0; i < n; i++) {
    const y = featY(i);
    const active = (xin[i] ?? 0) > 0;
    const col = HUES[i % HUES.length];
    const op = active ? 0.85 : 0.18;
    items.push(
      <line
        key={`enc0_${i}`}
        x1={xLeft + 18}
        y1={y}
        x2={xMidL}
        y2={h0y}
        stroke={col}
        strokeWidth={active ? 1.6 : 0.7}
        opacity={op * 0.6}
      />,
      <line
        key={`enc1_${i}`}
        x1={xLeft + 18}
        y1={y}
        x2={xMidL}
        y2={h1y}
        stroke={col}
        strokeWidth={active ? 1.6 : 0.7}
        opacity={op * 0.6}
      />,
    );
  }

  for (let i = 0; i < n; i++) {
    const y = featY(i);
    const col = HUES[i % HUES.length];
    const out = xhat[i] ?? 0;
    const op = Math.min(1, Math.max(0.15, Math.abs(out) * 1.2));
    items.push(
      <line
        key={`dec0_${i}`}
        x1={xMidR}
        y1={h0y}
        x2={xRight - 18}
        y2={y}
        stroke={col}
        strokeWidth={op > 0.4 ? 1.4 : 0.7}
        opacity={op * 0.5}
      />,
      <line
        key={`dec1_${i}`}
        x1={xMidR}
        y1={h1y}
        x2={xRight - 18}
        y2={y}
        stroke={col}
        strokeWidth={op > 0.4 ? 1.4 : 0.7}
        opacity={op * 0.5}
      />,
    );
  }

  items.push(
    <rect
      key="bottleneck"
      x={xMidL - 8}
      y={h0y - 30}
      width={xMidR - xMidL + 16}
      height={h1y - h0y + 60}
      rx={4}
      fill="var(--panel2)"
      stroke="var(--line)"
      strokeWidth={1.2}
    />,
  );

  const hSc = 18;
  for (const [idx, hv, hy] of [
    [0, h[0], h0y],
    [1, h[1], h1y],
  ] as const) {
    const w = Math.min(28, Math.abs(hv) * hSc);
    items.push(
      <line
        key={`hbase${idx}`}
        x1={xMidL + 4}
        y1={hy}
        x2={xMidR - 4}
        y2={hy}
        stroke="var(--faint)"
        strokeWidth={0.6}
      />,
      <rect
        key={`hbar${idx}`}
        x={(xMidL + xMidR) / 2 - (hv >= 0 ? 0 : w)}
        y={hy - 7}
        width={w}
        height={14}
        rx={2}
        fill="#e9e6dc"
        opacity={0.85}
      />,
      <text
        key={`hl${idx}`}
        x={xMidL + 4}
        y={hy - 12}
        fontFamily="'IBM Plex Mono', monospace"
        fontSize={10}
        fill="var(--dim)"
      >
        h{idx}
      </text>,
    );
  }

  items.push(
    <text
      key="bnlabel"
      x={(xMidL + xMidR) / 2}
      y={h1y + 48}
      textAnchor="middle"
      fontFamily="'IBM Plex Mono', monospace"
      fontSize={11}
      fill="var(--rep)"
      letterSpacing="0.12em"
    >
      m = 2
    </text>,
    <text
      key="bnsub"
      x={(xMidL + xMidR) / 2}
      y={h1y + 62}
      textAnchor="middle"
      fontFamily="'IBM Plex Mono', monospace"
      fontSize={9}
      fill="var(--dim)"
      letterSpacing="0.1em"
    >
      goulot
    </text>,
  );

  items.push(
    <text
      key="encArrow"
      x={(xLeft + xMidL) / 2}
      y={42}
      textAnchor="middle"
      fontFamily="'IBM Plex Mono', monospace"
      fontSize={10}
      fill="var(--faint)"
    >
      h = W·x
    </text>,
    <text
      key="decArrow"
      x={(xMidR + xRight) / 2}
      y={42}
      textAnchor="middle"
      fontFamily="'IBM Plex Mono', monospace"
      fontSize={10}
      fill="var(--faint)"
    >
      x̂ = {useReLU ? 'ReLU(Wᵀh + b)' : 'Wᵀh + b'}
    </text>,
  );

  return (
    <svg
      viewBox={`0 0 ${W_SVG} ${H_SVG}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ display: 'block', width: '100%', height: 'auto' }}
    >
      {items}

      {Array.from({ length: n }, (_, i) => {
        const y = featY(i);
        const active = (xin[i] ?? 0) > 0;
        const col = HUES[i % HUES.length];
        return (
          <g key={`chip${i}`} onClick={() => toggle(i)} style={{ cursor: 'pointer' }}>
            <circle
              cx={xLeft}
              cy={y}
              r={11}
              fill={active ? col : 'var(--panel2)'}
              stroke={active ? col : 'var(--line)'}
              strokeWidth={1.4}
            />
            <text
              x={xLeft}
              y={y + 4}
              textAnchor="middle"
              fontFamily="'IBM Plex Mono', monospace"
              fontSize={11}
              fill={active ? 'var(--bg)' : 'var(--dim)'}
            >
              {i}
            </text>
          </g>
        );
      })}

      {Array.from({ length: n }, (_, i) => {
        const y = featY(i);
        const col = HUES[i % HUES.length];
        const v = xhat[i] ?? 0;
        const above = v >= 0;
        const h2 = Math.min(20, Math.abs(v) * 26);
        return (
          <g key={`out${i}`}>
            <line
              x1={xRight - 6}
              y1={y}
              x2={xRight + 24}
              y2={y}
              stroke="var(--line)"
              strokeWidth={0.6}
            />
            <rect
              x={xRight}
              y={above ? y - h2 : y}
              width={20}
              height={h2}
              rx={2}
              fill={above ? col : 'none'}
              stroke={col}
              strokeWidth={above ? 0 : 1.2}
              strokeDasharray={above ? undefined : '2 2'}
              opacity={above ? Math.min(1, Math.abs(v) * 1.2) : 0.7}
            />
            <text
              x={xRight + 28}
              y={y + 4}
              fontFamily="'IBM Plex Mono', monospace"
              fontSize={10}
              fill={col}
              opacity={0.85}
            >
              {i}
            </text>
          </g>
        );
      })}

      <text
        x={xLeft}
        y={H_SVG - 14}
        textAnchor="middle"
        fontFamily="'IBM Plex Mono', monospace"
        fontSize={10}
        fill="var(--dim)"
        letterSpacing="0.14em"
      >
        ENTRÉE x
      </text>
      <text
        x={xRight + 10}
        y={H_SVG - 14}
        textAnchor="middle"
        fontFamily="'IBM Plex Mono', monospace"
        fontSize={10}
        fill="var(--dim)"
        letterSpacing="0.14em"
      >
        RECONSTRUCTION x̂
      </text>
    </svg>
  );
}

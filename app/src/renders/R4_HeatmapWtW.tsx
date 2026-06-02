import { useExplorer } from '../state/useExplorer';
import { WtW } from '../engine/model';
import { HUES, cellColor } from '../engine/palette';

export function R4_HeatmapWtW() {
  const W = useExplorer((s) => s.W);
  const n = useExplorer((s) => s.n);

  const G = WtW(W);
  const pad = 46;
  const cell = (400 - pad - 20) / n;
  const showVal = cell > 34;

  const elements = [];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const x = pad + j * cell;
      const y = pad + i * cell;
      const v = G[i][j];
      const diag = i === j;
      elements.push(
        <rect
          key={`c${i}-${j}`}
          x={x}
          y={y}
          width={cell - 2}
          height={cell - 2}
          rx={2}
          fill={cellColor(v, diag)}
          stroke={diag ? '#5a4f33' : '#22252c'}
          strokeWidth={diag ? 1.6 : 0.8}
        />,
      );
      if (showVal) {
        const dark = Math.abs(v) > 0.45;
        elements.push(
          <text
            key={`v${i}-${j}`}
            x={x + cell / 2 - 1}
            y={y + cell / 2 + 3}
            textAnchor="middle"
            fontFamily="'IBM Plex Mono', monospace"
            fontSize={Math.min(12, cell * 0.3)}
            fill={dark ? 'var(--bg)' : 'var(--dim)'}
          >
            {v.toFixed(2)}
          </text>,
        );
      }
    }
    const col = HUES[i % HUES.length];
    elements.push(
      <text
        key={`ly${i}`}
        x={pad - 12}
        y={pad + i * cell + cell / 2 + 4}
        textAnchor="end"
        fontFamily="'IBM Plex Mono', monospace"
        fontSize={11}
        fill={col}
      >
        {i}
      </text>,
      <text
        key={`lx${i}`}
        x={pad + i * cell + cell / 2}
        y={pad - 12}
        textAnchor="middle"
        fontFamily="'IBM Plex Mono', monospace"
        fontSize={11}
        fill={col}
      >
        {i}
      </text>,
    );
  }

  return (
    <svg viewBox="0 0 400 400" preserveAspectRatio="xMidYMid meet" style={{ display: 'block', width: '100%', height: 'auto' }}>
      {elements}
    </svg>
  );
}

export function R4_Legend() {
  const swatch = (color: string): React.CSSProperties => ({
    width: 13,
    height: 13,
    borderRadius: 2,
    background: color,
    display: 'inline-block',
    flexShrink: 0,
  });
  const item: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 10.5,
    letterSpacing: '0.04em',
    color: 'var(--dim)',
  };
  return (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--line)' }}>
      <span style={item}><i style={swatch('var(--rep)')} />diagonale = représentation</span>
      <span style={item}><i style={swatch('var(--pos)')} />interf. positive</span>
      <span style={item}><i style={swatch('var(--neg)')} />interf. négative</span>
    </div>
  );
}

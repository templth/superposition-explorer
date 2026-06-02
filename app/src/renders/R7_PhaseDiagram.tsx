import { useRef } from 'react';
import { useExplorer } from '../state/useExplorer';
import { HUES } from '../engine/palette';
import { classifyFeatures, norms } from '../engine/model';

const W_SVG = 520;
const H_SVG = 360;
const PAD_L = 56;
const PAD_R = 24;
const PAD_T = 20;
const PAD_B = 44;

const D_MIN = 0.03;
const D_MAX = 1.0;
const R_MIN = 0.4;
const R_MAX = 1.0;

function logMap(v: number, lo: number, hi: number): number {
  const ll = Math.log(lo);
  const lh = Math.log(hi);
  return (Math.log(v) - ll) / (lh - ll);
}
function logUnmap(t: number, lo: number, hi: number): number {
  const ll = Math.log(lo);
  const lh = Math.log(hi);
  return Math.exp(ll + t * (lh - ll));
}

const REGIME_FILL: Record<string, string> = {
  absent: 'var(--faint)',
  dedicated: 'var(--rep)',
  superposed: 'var(--pos)',
};

export function R7_PhaseDiagram() {
  const W = useExplorer((s) => s.W);
  const n = useExplorer((s) => s.n);
  const S = useExplorer((s) => s.S);
  const r = useExplorer((s) => s.r);
  const setS = useExplorer((s) => s.setS);
  const setR = useExplorer((s) => s.setR);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const innerW = W_SVG - PAD_L - PAD_R;
  const innerH = H_SVG - PAD_T - PAD_B;

  const density = Math.max(D_MIN, Math.min(D_MAX, 1 - S));
  const px = PAD_L + logMap(density, D_MIN, D_MAX) * innerW;
  const py = PAD_T + (1 - logMap(r, R_MIN, R_MAX)) * innerH;

  const dragging = useRef(false);

  const applyPointer = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const sx = ((clientX - rect.left) / rect.width) * W_SVG;
    const sy = ((clientY - rect.top) / rect.height) * H_SVG;
    const tx = Math.max(0, Math.min(1, (sx - PAD_L) / innerW));
    const ty = Math.max(0, Math.min(1, (sy - PAD_T) / innerH));
    const newDensity = logUnmap(tx, D_MIN, D_MAX);
    const newR = logUnmap(1 - ty, R_MIN, R_MAX);
    setS(Math.max(0, Math.min(0.97, 1 - newDensity)));
    setR(Math.max(R_MIN, Math.min(R_MAX, newR)));
  };

  const onDown = (e: React.PointerEvent<SVGSVGElement>) => {
    dragging.current = true;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    applyPointer(e.clientX, e.clientY);
  };
  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragging.current) return;
    applyPointer(e.clientX, e.clientY);
  };
  const onUp = (e: React.PointerEvent<SVGSVGElement>) => {
    dragging.current = false;
    (e.target as Element).releasePointerCapture?.(e.pointerId);
  };

  const regimes = classifyFeatures(W);
  const nrm = norms(W);

  const xTicks = [0.05, 0.1, 0.3, 1.0];
  const yTicks = [0.4, 0.6, 0.8, 1.0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W_SVG} ${H_SVG}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ display: 'block', width: '100%', height: 'auto', cursor: 'crosshair', touchAction: 'none' }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <rect x={PAD_L} y={PAD_T} width={innerW} height={innerH} fill="var(--panel2)" stroke="var(--line)" strokeWidth={1} />

        {(() => {
          const bands: React.ReactNode[] = [];
          const RES = 28;
          for (let ix = 0; ix < RES; ix++) {
            for (let iy = 0; iy < RES; iy++) {
              const tx = (ix + 0.5) / RES;
              const ty = (iy + 0.5) / RES;
              const d = logUnmap(tx, D_MIN, D_MAX);
              const ri = logUnmap(1 - ty, R_MIN, R_MAX);
              let color = 'var(--faint)';
              let op = 0.04;
              if (d < 0.12 && ri > 0.7) {
                color = 'var(--pos)';
                op = 0.10;
              } else if (d > 0.5 && ri > 0.8) {
                color = 'var(--rep)';
                op = 0.10;
              } else if (d < 0.08 && ri < 0.6) {
                color = 'var(--faint)';
                op = 0.12;
              }
              bands.push(
                <rect
                  key={`bg${ix}_${iy}`}
                  x={PAD_L + (ix / RES) * innerW}
                  y={PAD_T + (iy / RES) * innerH}
                  width={innerW / RES + 0.5}
                  height={innerH / RES + 0.5}
                  fill={color}
                  opacity={op}
                />,
              );
            }
          }
          return bands;
        })()}

        <text x={PAD_L + 12} y={PAD_T + 22} fontFamily="'IBM Plex Mono', monospace" fontSize={9} fill="var(--pos)" letterSpacing="0.12em" opacity={0.85}>
          SUPERPOSITION
        </text>
        <text x={PAD_L + innerW - 12} y={PAD_T + 22} textAnchor="end" fontFamily="'IBM Plex Mono', monospace" fontSize={9} fill="var(--rep)" letterSpacing="0.12em" opacity={0.9}>
          DÉDIÉE
        </text>
        <text x={PAD_L + 12} y={PAD_T + innerH - 12} fontFamily="'IBM Plex Mono', monospace" fontSize={9} fill="var(--dim)" letterSpacing="0.12em" opacity={0.85}>
          NON REPRÉSENTÉE
        </text>

        {xTicks.map((d) => {
          const x = PAD_L + logMap(d, D_MIN, D_MAX) * innerW;
          return (
            <g key={`xt${d}`}>
              <line x1={x} y1={PAD_T + innerH} x2={x} y2={PAD_T + innerH + 4} stroke="var(--dim)" strokeWidth={0.8} />
              <text x={x} y={PAD_T + innerH + 16} textAnchor="middle" fontFamily="'IBM Plex Mono', monospace" fontSize={9} fill="var(--dim)">
                {d}
              </text>
            </g>
          );
        })}
        {yTicks.map((rv) => {
          const y = PAD_T + (1 - logMap(rv, R_MIN, R_MAX)) * innerH;
          return (
            <g key={`yt${rv}`}>
              <line x1={PAD_L - 4} y1={y} x2={PAD_L} y2={y} stroke="var(--dim)" strokeWidth={0.8} />
              <text x={PAD_L - 8} y={y + 3} textAnchor="end" fontFamily="'IBM Plex Mono', monospace" fontSize={9} fill="var(--dim)">
                {rv.toFixed(1)}
              </text>
            </g>
          );
        })}

        <text x={PAD_L + innerW / 2} y={H_SVG - 10} textAnchor="middle" fontFamily="'IBM Plex Mono', monospace" fontSize={9} fill="var(--dim)" letterSpacing="0.14em">
          DENSITÉ (1 − S) — LOG
        </text>
        <text
          x={14}
          y={PAD_T + innerH / 2}
          fontFamily="'IBM Plex Mono', monospace"
          fontSize={9}
          fill="var(--dim)"
          letterSpacing="0.14em"
          transform={`rotate(-90 14 ${PAD_T + innerH / 2})`}
          textAnchor="middle"
        >
          IMPORTANCE r — LOG
        </text>

        {Array.from({ length: n }, (_, i) => {
          const col = HUES[i % HUES.length];
          const reg = regimes[i];
          const fill = REGIME_FILL[reg];
          const op = Math.min(1, Math.max(0.18, (nrm[i] ?? 0) * 1.1));
          const ix = Math.cos((i / n) * 2 * Math.PI) * 8;
          const iy = Math.sin((i / n) * 2 * Math.PI) * 8;
          return (
            <g key={`feat${i}`}>
              <circle cx={px + ix} cy={py + iy} r={4} fill={fill} stroke={col} strokeWidth={1.2} opacity={op} />
            </g>
          );
        })}

        <circle cx={px} cy={py} r={11} fill="none" stroke="#e9e6dc" strokeWidth={1.6} opacity={0.9} />
        <circle cx={px} cy={py} r={3.5} fill="#e9e6dc" stroke="var(--bg)" strokeWidth={1.2} />
      </svg>

      <div style={{ display: 'flex', gap: 22, fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--dim)', flexWrap: 'wrap' }}>
        <span>S = {S.toFixed(2)}</span>
        <span>r = {r.toFixed(2)}</span>
        <span style={{ color: 'var(--rep)' }}>● dédiée</span>
        <span style={{ color: 'var(--pos)' }}>● superposée</span>
        <span style={{ color: 'var(--faint)' }}>● absente</span>
      </div>
    </div>
  );
}

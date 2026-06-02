import type { Matrix2xN } from '../engine/types';
import { HUES } from '../engine/palette';

type Props = {
  W: Matrix2xN;
  n: number;
  size?: number;
  scale?: number;
  showLabels?: boolean;
  showAxes?: boolean;
  showUnitCircle?: boolean;
  dimInactive?: number[];
};

export function PlaneArrows({
  W,
  n,
  size = 400,
  scale,
  showLabels = true,
  showAxes = true,
  showUnitCircle = true,
  dimInactive,
}: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const sc = scale ?? size * 0.275;
  const axisIn = size * 0.1;
  const axisOut = size - axisIn;

  const arrows = [];

  if (showUnitCircle) {
    arrows.push(
      <circle
        key="ring"
        cx={cx}
        cy={cy}
        r={sc}
        fill="none"
        stroke="var(--line)"
        strokeWidth={1}
        strokeDasharray="3 4"
      />,
    );
  }
  if (showAxes) {
    arrows.push(
      <line key="ax" x1={axisIn} y1={cy} x2={axisOut} y2={cy} stroke="var(--faint)" strokeWidth={1} />,
      <line key="ay" x1={cx} y1={axisIn} x2={cx} y2={axisOut} stroke="var(--faint)" strokeWidth={1} />,
    );
  }

  for (let i = 0; i < n; i++) {
    const wx = W[0][i] ?? 0;
    const wy = W[1][i] ?? 0;
    const ex = cx + wx * sc;
    const ey = cy - wy * sc;
    const nrm = Math.hypot(wx, wy);
    const dimmed = dimInactive ? dimInactive[i] <= 0 : false;
    const baseOp = Math.min(1, Math.max(0.12, nrm * 1.15));
    const op = dimmed ? Math.min(0.22, baseOp) : baseOp;
    const sw = dimmed ? 1 : 2.6;
    const col = HUES[i % HUES.length];

    arrows.push(
      <line
        key={`l${i}`}
        x1={cx}
        y1={cy}
        x2={ex}
        y2={ey}
        stroke={col}
        strokeWidth={sw}
        opacity={op}
      />,
    );

    if (!dimmed && nrm > 0.05) {
      const ang = Math.atan2(ey - cy, ex - cx);
      const ah = 8 * (size / 400);
      const a1 = ang + 2.7;
      const a2 = ang - 2.7;
      const p1x = ex + ah * Math.cos(a1);
      const p1y = ey + ah * Math.sin(a1);
      const p2x = ex + ah * Math.cos(a2);
      const p2y = ey + ah * Math.sin(a2);
      arrows.push(
        <path
          key={`a${i}`}
          d={`M ${ex} ${ey} L ${p1x} ${p1y} L ${p2x} ${p2y} Z`}
          fill={col}
          opacity={op}
        />,
      );
    }

    if (showLabels && nrm > 0.18) {
      const ang = Math.atan2(ey - cy, ex - cx);
      const lx = ex + 10 * Math.cos(ang);
      const ly = ey + 10 * Math.sin(ang) + 4;
      arrows.push(
        <text
          key={`t${i}`}
          x={lx}
          y={ly}
          fill={col}
          opacity={op}
          fontFamily="'IBM Plex Mono', monospace"
          fontSize={Math.max(10, 11 * (size / 400))}
        >
          {i}
        </text>,
      );
    }
  }

  return <>{arrows}</>;
}

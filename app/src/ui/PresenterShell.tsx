import type { ReactNode } from 'react';
import { useExplorer, type RenderId } from '../state/useExplorer';
import { R1_Architecture } from '../renders/R1_Architecture';
import { R2_PlaneGeometry } from '../renders/R2_PlaneGeometry';
import { R3_Loss } from '../renders/R3_Loss';
import { R4_HeatmapWtW, R4_Legend } from '../renders/R4_HeatmapWtW';
import { R5_ReluCompare } from '../renders/R5_ReluCompare';
import { R6_Injection } from '../renders/R6_Injection';
import { R7_PhaseDiagram } from '../renders/R7_PhaseDiagram';
import { representedCount, shapeName } from '../engine/model';

type RenderEntry = {
  title: string;
  node: ReactNode;
  controls: ReactNode;
  footer?: ReactNode;
};

function SparsitySlider() {
  const S = useExplorer((s) => s.S);
  const setS = useExplorer((s) => s.setS);
  return (
    <label style={inlineLabel}>
      <span style={tagSm}>sparsité S</span>
      <input
        type="range"
        min={0}
        max={0.97}
        step={0.01}
        value={S}
        onChange={(e) => setS(+e.target.value)}
        style={{ width: 220 }}
      />
      <span style={numSm}>{S.toFixed(2)}</span>
    </label>
  );
}

function NSelector() {
  const n = useExplorer((s) => s.n);
  const setN = useExplorer((s) => s.setN);
  return (
    <div style={inlineLabel}>
      <span style={tagSm}>n</span>
      {[2, 3, 4, 5, 6].map((v) => (
        <button
          key={v}
          onClick={() => setN(v)}
          style={{
            ...chipBtn,
            background: n === v ? 'var(--pos)' : 'var(--panel2)',
            color: n === v ? 'var(--bg)' : 'var(--text)',
            borderColor: n === v ? 'var(--pos)' : 'var(--line)',
          }}
        >
          {v}
        </button>
      ))}
    </div>
  );
}

function ReluToggle() {
  const useReLU = useExplorer((s) => s.useReLU);
  const setReLU = useExplorer((s) => s.setReLU);
  return (
    <button
      onClick={() => setReLU(!useReLU)}
      style={{
        ...chipBtn,
        background: useReLU ? 'var(--pos)' : 'var(--neg)',
        color: 'var(--bg)',
        borderColor: useReLU ? 'var(--pos)' : 'var(--neg)',
        padding: '8px 14px',
      }}
    >
      ReLU {useReLU ? 'ON' : 'OFF'}
    </button>
  );
}

export function PresenterShell() {
  const id = useExplorer((s) => s.presenterRender);
  const setId = useExplorer((s) => s.setPresenterRender);
  const paused = useExplorer((s) => s.paused);
  const setPaused = useExplorer((s) => s.setPaused);
  const W = useExplorer((s) => s.W);
  const n = useExplorer((s) => s.n);
  const xin = useExplorer((s) => s.xin);

  if (id === null) return null;

  const rep = representedCount(W);
  const activeCount = xin.filter((v) => v > 0).length;

  const entries: Record<RenderId, RenderEntry> = {
    1: {
      title: 'R1 · Architecture minimale',
      node: <R1_Architecture />,
      controls: (
        <>
          <NSelector />
          <ReluToggle />
        </>
      ),
    },
    2: {
      title: `R2 · Plan caché ℝ² · ${rep} représentées · ${shapeName(rep)}`,
      node: <R2_PlaneGeometry />,
      controls: (
        <>
          <SparsitySlider />
          <NSelector />
        </>
      ),
    },
    3: {
      title: 'R3 · Perte vs pas',
      node: <R3_Loss />,
      controls: <NSelector />,
    },
    4: {
      title: `R4 · WᵀW · ${n}×${n}`,
      node: <R4_HeatmapWtW />,
      controls: (
        <>
          <SparsitySlider />
          <NSelector />
        </>
      ),
      footer: <R4_Legend />,
    },
    5: {
      title: 'R5 · ReLU on/off',
      node: <R5_ReluCompare />,
      controls: <SparsitySlider />,
    },
    6: {
      title: `R6 · Injection · ${activeCount} active${activeCount > 1 ? 's' : ''}`,
      node: <R6_Injection />,
      controls: <ReluToggle />,
    },
    7: {
      title: 'R7 · Phase importance × sparsité',
      node: <R7_PhaseDiagram />,
      controls: <NSelector />,
    },
  };

  const entry = entries[id];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--bg)',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 32px 28px',
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
          paddingBottom: 14,
          borderBottom: '1px solid var(--line)',
          marginBottom: 18,
        }}
      >
        <div
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 14,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--text)',
          }}
        >
          {entry.title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => setPaused(!paused)}
            style={{
              ...chipBtn,
              background: paused ? 'var(--pos)' : 'var(--panel2)',
              color: paused ? 'var(--bg)' : 'var(--text)',
              borderColor: paused ? 'var(--pos)' : 'var(--line)',
              padding: '8px 14px',
            }}
          >
            {paused ? '▶ reprendre' : '⏸ pause'}
          </button>
          <button
            onClick={() => setId(null)}
            style={{
              ...chipBtn,
              padding: '8px 14px',
            }}
            title="Vue complète (0 / Esc)"
          >
            ✕ vue complète
          </button>
        </div>
      </header>

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'stretch',
          maxWidth: 1200,
          margin: '0 auto',
          width: '100%',
        }}
      >
        <div style={{ flexShrink: 0 }}>{entry.node}</div>
        {entry.footer && <div style={{ marginTop: 14 }}>{entry.footer}</div>}
      </div>

      <footer
        style={{
          display: 'flex',
          gap: 28,
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
          paddingTop: 16,
          borderTop: '1px solid var(--line)',
          marginTop: 18,
        }}
      >
        {entry.controls}
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 9,
            letterSpacing: '0.16em',
            color: 'var(--faint)',
            marginLeft: 'auto',
          }}
        >
          1–7 isoler · 0/esc complet · espace pause
        </span>
      </footer>
    </div>
  );
}

const tagSm: React.CSSProperties = {
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: 9,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: 'var(--dim)',
};
const numSm: React.CSSProperties = {
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: 13,
  color: 'var(--text)',
  minWidth: 44,
  textAlign: 'right',
};
const inlineLabel: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
};
const chipBtn: React.CSSProperties = {
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: 11,
  letterSpacing: '0.06em',
  background: 'var(--panel2)',
  color: 'var(--text)',
  border: '1px solid var(--line)',
  padding: '6px 11px',
  borderRadius: 3,
  cursor: 'pointer',
};

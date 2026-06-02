import { useExplorer } from './state/useExplorer';
import { useTrainingLoop } from './state/useTrainingLoop';
import { useKeyboardShortcuts } from './state/useKeyboardShortcuts';
import { Readout } from './ui/Readout';
import { Controls } from './ui/Controls';
import { Panel } from './ui/Panel';
import { PresenterShell } from './ui/PresenterShell';
import { R1_Architecture } from './renders/R1_Architecture';
import { R2_PlaneGeometry } from './renders/R2_PlaneGeometry';
import { R3_Loss } from './renders/R3_Loss';
import { R4_HeatmapWtW, R4_Legend } from './renders/R4_HeatmapWtW';
import { R5_ReluCompare } from './renders/R5_ReluCompare';
import { R6_Injection } from './renders/R6_Injection';
import { R7_PhaseDiagram } from './renders/R7_PhaseDiagram';
import { representedCount } from './engine/model';

function App() {
  useTrainingLoop();
  useKeyboardShortcuts();

  const W = useExplorer((s) => s.W);
  const n = useExplorer((s) => s.n);
  const xin = useExplorer((s) => s.xin);
  const rep = representedCount(W);
  const activeCount = xin.filter((v) => v > 0).length;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', padding: '32px 24px 64px' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <header style={{ marginBottom: 28, borderBottom: '1px solid var(--line)', paddingBottom: 18 }}>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'var(--dim)',
              marginBottom: 8,
            }}
          >
            Toy model — Anthropic 2022 · entraîné en direct
          </div>
          <h1 style={{ fontSize: 34, lineHeight: 1.05, margin: 0 }}>
            L'explorateur de <em style={{ color: 'var(--pos)', fontStyle: 'italic' }}>superposition</em>
          </h1>
          <div
            style={{
              marginTop: 14,
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--faint)',
            }}
          >
            1–7 isoler · 0/esc complet · espace pause
          </div>
        </header>

        <div style={{ marginBottom: 18 }}>
          <Panel title="R1 · Architecture minimale" tagValue={`n=${n} → m=2 → n`} hotkey={1}>
            <R1_Architecture />
          </Panel>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
            gap: 18,
          }}
        >
          <Panel title="R2 · Plan caché ℝ² — colonnes de W" tagValue={`${rep} représentées`} hotkey={2}>
            <R2_PlaneGeometry />
          </Panel>
          <Panel title="R4 · Matrice WᵀW — interférences" tagValue={`${n}×${n}`} hotkey={4} footer={<R4_Legend />}>
            <R4_HeatmapWtW />
          </Panel>
        </div>

        <div style={{ marginTop: 18 }}>
          <Panel title="R3 · Perte vs pas" tagValue="entraînement live" hotkey={3}>
            <R3_Loss />
          </Panel>
        </div>

        <Controls />

        <div style={{ marginTop: 8 }}>
          <Readout />
        </div>

        <div style={{ marginTop: 18 }}>
          <Panel title="R5 · Comparaison ReLU on/off" tagValue="toggle contrefactuel" hotkey={5}>
            <R5_ReluCompare />
          </Panel>
        </div>

        <div style={{ marginTop: 18 }}>
          <Panel title="R6 · Injection d'un vecteur creux" tagValue={`${activeCount} active${activeCount > 1 ? 's' : ''}`} hotkey={6}>
            <R6_Injection />
          </Panel>
        </div>

        <div style={{ marginTop: 18 }}>
          <Panel title="R7 · Diagramme de phase importance × sparsité" tagValue="point pilote S,r" hotkey={7}>
            <R7_PhaseDiagram />
          </Panel>
        </div>
      </div>

      <PresenterShell />
    </div>
  );
}

export default App;

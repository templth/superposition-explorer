# Superposition Explorer

An interactive, pedagogical web app for visualizing **feature superposition** in neural networks — the phenomenon where a model packs more features than it has dimensions by representing them as overlapping, non-orthogonal directions.

Built around the toy autoencoder from Anthropic's [*Toy Models of Superposition*](https://transformer-circuits.pub/2022/toy_model/index.html) (Elhage et al. 2022). The model trains **live in the browser** — every render reflects the actual state of the weights, not a scripted animation.

## What you see

The model is a tiny autoencoder: `n` features → bottleneck `m=2` → reconstruction. Training uses a manual Adam optimizer, and the UI publishes a fresh snapshot of `W` and `b` on every animation frame.

| Render | What it shows |
|---|---|
| **R2 · Hidden plane** | The columns of `W` plotted as 2D arrows. Watch them organize into a triangle, square, pentagon… as `n` grows. |
| **R4 · WᵀW heatmap** | The interference matrix. Diagonal = self-encoding; off-diagonal = leakage between features. |
| **R5 · ReLU toggle** | Flip ReLU on/off mid-training. With ReLU, superposition is viable; without it, the model collapses to orthogonal features. |
| **R6 · Sparse injection** | Inject a one-hot input. See the hidden vector `h`, then the reconstruction `x̂`. Ghost bars (dashed) reveal interference suppressed by ReLU. |

Sliders for sparsity `S` and importance decay `r` are **warm-start**: the model reorganizes live without retraining from scratch. That's the core of the demo — superposition as a continuous reorganization, not a discrete switch.

## Stack

- **Vite + React 19 + TypeScript** — single-page app, no backend
- **Zustand** — store holds published snapshots; the trainer lives in module scope
- **SVG** — every visualization is hand-drawn SVG, no canvas/WebGL
- **Vitest** — numerical-parity tests against the prototype

## Running locally

```bash
cd app
npm install
npm run dev       # http://localhost:5173
npm run build     # production build → app/dist
npm test          # vitest run
```

## Project layout

```
app/
├── src/
│   ├── engine/        # model, training, palette (no React)
│   │   ├── model.ts       # forward pass, WᵀW, geometry helpers
│   │   ├── train.ts       # manual Adam, createTrainer factory
│   │   └── __tests__/     # numerical-parity tests
│   ├── state/         # Zustand store + rAF training loop
│   ├── renders/       # R2, R4, R5, R6 + shared PlaneArrows
│   ├── ui/            # Panel, Controls, Readout
│   └── App.tsx
explorateur-superposition.html   # single-file HTML prototype (reference behavior)
SPEC-explorateur-superposition.md
```

The standalone HTML prototype (`explorateur-superposition.html`) is the **reference for numerical behavior** — the React port is verified to match it.

## Hyperparameters

```
m = 2          hidden dimensions
B = 256        batch size
K = 24         training steps per animation frame
lr = 0.012     Adam learning rate
β1 = 0.9, β2 = 0.999, ε = 1e-8
```

A feature is counted as "represented" when `‖Wᵢ‖ > 0.32`.

## Status

- **M1** — Engine, store, rAF loop, readout ✓
- **M2** — Renders R2, R4, R5, R6 with numerical parity ✓
- **M3** — R1 (architecture), R3 (loss curve), R7 (importance × sparsity phase diagram) — planned
- **M4** — Presentation mode (keyboard shortcuts, polish) — planned

## License

MIT.

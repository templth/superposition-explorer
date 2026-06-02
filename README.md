# Superposition Explorer

An interactive, pedagogical web app for visualizing **feature superposition** in neural networks — the phenomenon where a model packs more features than it has dimensions by representing them as overlapping, non-orthogonal directions.

Built around the toy autoencoder from Anthropic's [*Toy Models of Superposition*](https://transformer-circuits.pub/2022/toy_model/index.html) (Elhage et al. 2022). The model trains **live in the browser** — every render reflects the actual state of the weights, not a scripted animation.

**Live:** https://templth.github.io/superposition-explorer/

## What you see

The model is a tiny autoencoder: `n` features → bottleneck `m=2` → reconstruction. Training uses a manual Adam optimizer, and the UI publishes a fresh snapshot of `W` and `b` on every animation frame.

| Render | What it shows |
|---|---|
| **R1 · Architecture** | The whole pipeline at a glance: `n` features → bottleneck `m=2` → reconstruction `x̂`. Toggle features on/off (shared with R6). |
| **R2 · Hidden plane** | Columns of `W` as 2D arrows. Watch them organize into a triangle, square, pentagon… as `n` grows. |
| **R3 · Loss curve** | Loss vs training step, ring-buffered. Pause/resume training, retrain from scratch, convergence indicator. |
| **R4 · WᵀW heatmap** | The interference matrix. Diagonal = self-encoding; off-diagonal = leakage between features. |
| **R5 · ReLU toggle** | Flip ReLU on/off mid-training. With ReLU, superposition is viable; without it, the model collapses to orthogonal features. |
| **R6 · Sparse injection** | Inject a one-hot input. See the hidden vector `h`, then the reconstruction `x̂`. Ghost bars (dashed) reveal interference suppressed by ReLU. |
| **R7 · Phase diagram** | Log×log plane of importance × density `(1−S)`. Three regime bands (absent / dedicated / superposed). Drag the point to drive `S` and `r`. |

Sliders for sparsity `S` and importance decay `r` are **warm-start**: the model reorganizes live without retraining from scratch. That's the core of the demo — superposition as a continuous reorganization, not a discrete switch.

## Presentation mode

The app is designed to be driven live on camera. Each panel can be isolated full-screen for filming.

| Key | Action |
|---|---|
| `1`–`7` | Isolate render R1…R7 (press again or `0`/`Esc` to exit) |
| `0` / `Esc` | Back to full view |
| `Space` | Pause / resume training (also works in full view) |

In isolated mode, only the controls relevant to the current render are shown (e.g. R5 keeps the sparsity slider; R6 keeps the ReLU toggle). Transitions are hard cuts — no fades.

A typical filming sequence:
1. `1` — present the architecture
2. `2` — let the polygon emerge as sparsity rises
3. `4` — same moment in the WᵀW heatmap
4. `5` — flip ReLU off, watch the collapse to orthogonal
5. `6` — inject a feature, point at the ghosts
6. `7` — pull back to the regime map
7. `Space` to freeze whenever you want to talk over a stable frame

## Stack

- **Vite + React 19 + TypeScript** — single-page app, no backend
- **Zustand** — store holds published snapshots; the trainer lives in module scope
- **SVG** — every visualization is hand-drawn SVG, no canvas/WebGL
- **Vitest** — numerical-parity tests against the prototype
- **Fonts** — Fraunces (display), IBM Plex Mono (numerics), Spectral (prose), via `@fontsource`

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
│   │   ├── model.ts       # forward pass, WᵀW, geometry helpers, regime classifier
│   │   ├── train.ts       # manual Adam, createTrainer factory
│   │   └── __tests__/     # numerical-parity tests
│   ├── state/         # Zustand store, rAF training loop, keyboard shortcuts
│   ├── renders/       # R1, R2, R3, R4, R5, R6, R7 + shared PlaneArrows
│   ├── ui/            # Panel, Controls, Readout, PresenterShell
│   ├── design/        # tokens.css (palette, fonts)
│   └── App.tsx
.github/workflows/deploy.yml     # build + deploy to GitHub Pages on push to main
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

## Deployment

Pushed to `main` triggers `.github/workflows/deploy.yml`, which runs the test suite, builds with `base: '/superposition-explorer/'`, and publishes `app/dist` to GitHub Pages.

## Status

- **M1** — Engine, store, rAF loop, readout ✓
- **M2** — R2, R4, R5, R6 with numerical parity to the prototype ✓
- **M3** — R1, R3, R7 ✓
- **M4** — Presentation mode (keyboard shortcuts, isolated layout, fonts) ✓
- **M5** — R8 (m=3 in 3D, fractional dimensionality) — stretch, not shipped

## License

MIT.

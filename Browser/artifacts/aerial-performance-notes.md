# Aerial rendering comparison — 17 September 2026

Baseline: `82e6094`. Chrome, 1300 × 900, device scale 1, SwiftShader software WebGL. Each view runs five warm-up frames followed by 30 small orbit steps, including the normal road-label and location-marker updates. Draw calls and triangles exclude the initial cached-shadow render. Screenshots restore the exact saved camera for comparison.

| View | Draw calls before → after | Submitted triangles before → after |
| --- | ---: | ---: |
| Default aerial | 6,767 → 2,711 | 1,215,535 → 960,491 |
| Main/admin grounds | 5,542 → 1,712 | 1,328,708 → 1,016,828 |
| Front lawn, close view | 199 → 89 | 286,108 → 299,784 |

Default aerial submissions fall 60%, and Main/admin submissions fall 69%. Full-detail copies now use the same larger beech template, so the close view has slightly more foliage triangles; it still has fewer draw calls. The screenshots show the new rotated trees, unchanged buildings, and less detailed foliage at aerial distances. The close view retains individual leaves.

Across the entire tree layer, before view culling, the default aerial camera selects 134,848 tree triangles instead of 548,888 (75% fewer). Building preparation combines 7,771 static meshes into 1,209 batches. Batches retain material, UVs, normals, shadow flags, render order, parent visibility and spatial cells. Individually toggled road/ground objects and the trees stay outside building batches. Walking uses the original unbatched building geometry.

Elapsed render times are saved in the JSON files for diagnosis, but software WebGL timing should not be interpreted as the frame rate on the user's GPU. The reproducible workload counts above are the useful comparison.

## Verification

- `test-aerial-performance.mjs`: shared tree geometry and GPU buffers, positions and dimensions, copper/green colours, foliage detail transitions and hysteresis, identical material triangle totals in all four layouts, idempotent batching, cached transforms, dynamic labels and tree hiding.
- Live browser: shader warm-up, actual frame loop, WASD, pointer orbit, wheel zoom, all layout combinations, tree visibility, reset, portrait resize and 20-pixel road labels. No browser errors.
- Visually inspected default aerial, Main/admin grounds and close lawn-tree renders before/after.
- Ran the full package test command, then every remaining test after its first failure. Two existing road checks fail identically with the original tree/layout modules loaded from `82e6094`: `test-annexe-photo-placement.mjs` compares an outdated fixed-road snapshot, and `test-historic-roads.mjs` reports the Admin north service road at `[228.88947100550808, -4.523245293100267]`. All other package tests pass. Road geometry and fixtures are unchanged.

Run these scripts from the repository root. The browser scripts use the installed local Chrome and bundled Playwright runtime:

```powershell
node Browser/artifacts/benchmark-aerial.mjs before
node Browser/artifacts/benchmark-aerial.mjs after
node Browser/artifacts/check-aerial-performance-ui.mjs
node Browser/test-aerial-performance.mjs
```

The benchmark's optional third argument selects another baseline revision. `aerial-baseline-loader.mjs` can reproduce the two pre-existing failures with Node's `--import` option.

Batching and foliage texture baking currently run once at page setup. Serializing these prepared batches and templates during a build would reduce setup time further; it would not, by itself, reduce the draw calls or triangles needed each frame. Shader warm-up is specific to the browser/GPU and is performed locally before the first navigation frame.

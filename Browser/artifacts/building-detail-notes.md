# Automatic aerial building detail

This trial preserves the original models for walking and close aerial views. It identifies ordinary rectangular glass panes and their nearby cuboid frames, glazing bars and sills, then bakes their existing positions and colours into atlas tiles. Each distant window uses one textured quad. No wall or roof replacement is involved, and unsupported curved windows remain as their original geometry.

The measured scene contains 2,702 eligible windows assembled from 42,329 components. Repeated patterns share 373 atlas tiles on three 1024 × 1024 textures (about 16 MiB on the GPU including mipmaps). Preparation takes place once at page setup; a local CPU check took approximately 0.2 seconds. This is an added startup/memory cost in exchange for less geometry during navigation.

Building facade groups select full detail above 40 CSS pixels of estimated window height and textured windows below that. Below 12 pixels, remaining very slender fittings in the affected batches are also omitted. The return thresholds are 48 and 15 pixels to prevent flicker. The estimate uses view-space depth, the closest edge of the facade bounds, viewport height and camera projection, including zoom. Cached shadow refreshes use full building geometry and do not repeat as detail switches. The near meshes retain their original geometry, materials, names and shadow settings.

## Comparison

Chrome/SwiftShader, 1300 × 900. Full and automatic modes in each benchmark run use the same frozen snapshot of the modelling source. Four warm-up frames are followed by 20 small orbit steps; the initial shadow render is excluded. Screenshots use the original saved camera. The current comparison is in `building-detail-benchmark.json`.

| View | Triangles: full → automatic | Reduction | Draw calls: full → automatic |
| --- | ---: | ---: | ---: |
| Default aerial | 1,052,779 → 683,329 | 35.1% | 2,693 → 2,659 |
| Main/admin grounds | 1,095,071 → 623,153 | 43.1% | 1,702 → 1,665 |
| Annexe | 567,502 → 309,162 | 45.5% | 727 → 718 |
| Close front view | 566,543 → 472,403 | 16.6% | 1,294 → 1,287 |

The close front screenshots are byte-for-byte identical; its geometry reduction comes from distant groups. Walls, rooflines and landmark silhouettes remain unchanged in the aerial comparisons.

The software-renderer elapsed times are mixed: the default view improved, while several other samples were slower. They do not establish an FPS gain on the user's GPU. Geometry work falls substantially, while draw submissions only fall slightly; the benefit will depend on the device's rendering bottleneck. Use the full-detail URL to compare movement on the actual device before drawing an FPS conclusion.

## Hardware check

The browser also exposes the local NVIDIA RTX 3090 Ti through ANGLE/D3D11. A second comparison used hardware rendering, 30 warm-up frames and 120 measured orbit frames per view at the same resolution. Results are in `building-detail-benchmark-gpu.json` (reproduce with `--hardware`).

| View | Observed frame cadence: full → automatic | Median render-and-finish time: full → automatic |
| --- | ---: | ---: |
| Default aerial | 59.0 → 59.4 FPS | 9.7 → 9.6 ms |
| Main/admin grounds | 59.8 → 56.3 FPS | 8.3 → 12.0 ms |
| Annexe | 59.5 → 59.3 FPS | 7.3 → 5.8 ms |
| Close front view | 59.2 → 60.0 FPS | 5.6 → 5.6 ms |

This does **not** demonstrate a consistent FPS improvement on this GPU. Most views remain close to the browser's 60 Hz cadence, and Main/admin was slower in this run. The test explicitly synchronizes GPU work with `gl.finish()` and shares the desktop GPU, so it is a diagnostic rather than an isolated device benchmark. Keep this as a reversible trial: it reduces geometry substantially, but the additional texture work and existing draw-call/CPU costs can limit or offset that benefit.

## Verification and comparison controls

- `node Browser/test-building-detail.mjs`: full-detail surfaces and shadow flags across all layouts; atlas deduplication and actual glazing-colour pixels at a ray-cast window; transformed placement; viewport and optical zoom; hysteresis; close-detail restoration; cached shadow refreshes; independent tree visibility.
- Existing aerial performance, layout, gesture, cached-shadow/collision and walking-control tests all pass.
- `node Browser/artifacts/check-building-detail-ui.mjs`: real frame loop, shader startup, movement, orbit, zoom, all layouts, tree toggle, reset, close view, portrait resize/fit and full-detail fallback. No browser errors.
- `node Browser/artifacts/benchmark-building-detail.mjs`: full/automatic measurements and screenshots. Add `--hardware` to use the local GPU and a longer sample. Run from the repository root using the installed Chrome and bundled Playwright paths in the script.

Automatic detail is the aerial default. To bypass it, use `aerial.html?buildingDetail=full`, or `aerial.html?view=annexe&buildingDetail=full`. Other game modes do not call the building-detail preparer. The renderer only bakes ordinary opaque, untextured cuboids with compatible transforms; individually toggled objects, trees, custom shapes and structural geometry are retained.

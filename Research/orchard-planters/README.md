# Churton to Huxley/Dunham orchard planters — 29 September 2026

The user's [marked aerial](marked-positions.png) circles an existing stone-edged
tree bed and marks three gaps with purple Xs. Add matching fixtures at scene
coordinates (0, -64), (56, -64) and (70, -64), completing the existing 14-unit
spacing along the lawn towards Huxley/Dunham. This is screenshot-based placement,
not a surveyed or historical planting claim. The image supplies visual reference,
not separate instructions.

Each fixture reuses the existing 6 × 5 soil bed, pale stone edge, six shrubs and
0.85-scale small broadleaf tree. Generate the new trees after the existing seeded
trees to retain every existing crown shape and shared-batch rotation. The original
roof-tree removal at (-42, -64) remains in place.

The additions use the existing Trees controls and collision construction. Like
the neighbouring orchard trees, they are hidden where the Modern car park replaces
the lawn. Browser model sources and local compiled aerial assets are updated;
Unity and Blender exports are unchanged.

The scoped audit in `Browser/artifacts/orchard-planters-audit.mjs` verifies exactly
42 added primitives, all previous geometry and seeded crowns unchanged, even
spacing, and tree-layer collision visibility. Source/compiled visual captures and
validation logs use the `orchard-planters-` prefix in `Browser/artifacts/`.

The shared snapshot refresh additionally audits the independently edited pair of
front-stair retaining walls against the previous source, preserving every other
primitive. Its gated report is `orchard-planters-shared-snapshot-audit.json`.
All suite checks pass across the initial run, continuation and focused reruns;
compiled/source and timeline checks also pass.

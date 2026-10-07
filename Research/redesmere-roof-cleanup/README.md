# Redesmere roof protrusions — 7 October 2026

The owner's [marked walking view](owner-marked.png) identifies a brick strip
above the rear-return roof and a white piece above the small stair-enclosure
roof. The screenshot locates the defects; the accompanying request is to
remove them and check the rest of Redesmere for similar overlaps.

`Browser/dist/rear-court-photo-detail.mjs` removes the redundant five-unit brick
strip at x=60.7, z=-32.87. The exposed brick pier beneath it remains. The white
piece was the main roof's rendered eave return above the lower lean-to cap.
The lean-to now joins the main slate at x=83.8, y=9.53. Its solid cap stops at
that edge, and the stair enclosure follows its underside while retaining the
same ground footprint. The roof therefore conceals the old return without
slate cutting through the middle of the render or leaving open sky below it.

The remaining roof survey identified two smaller overlaps. On the garden
pavilion, the raised central cornice crown extended above the shallow October
roof. Its lower step remains, while the crown is trimmed to y=14.53 and all
upper render ends at the slate's x=70.15 edge. On the outer entrance, the main
range's projecting brick trim now stops beside the lower entrance hip, with
0.01-unit clearance at each end. These corrections are in
`redesmere-garden-photo-detail.mjs` and `redesmere-photo-detail.mjs`.

The photographed stepped parapet and chimney/ventilator assemblies are
intentional roof projections and remain. This correction supersedes the
earlier garden cornice heights in the frontage-proportion notes; the main
roof pitches, pavilion footprint, windows and fire escapes are retained.

`Browser/test-support/redesmere-roof-probes.mjs` checks frozen points on the
former brick projections, ground rays through the former white return, and
the actual stair-wall and garden-cornice top vertices. It runs with
`test-roof-wall-joins.mjs` for both source and compiled models. The source has
94 render-top probes; timeline/detail splitting yields 244 in the compiled
scene. The existing 278 independent eave-gap rays also remain closed.

Hardware-rendered ground views cover the marked rear return, stair corner,
outer elevation, garden frontage and side, courtyard and roof overview.
Captures, the wider wall-top survey and validation receipts are under
`Browser/artifacts/redesmere-roof-cleanup/`. Local rendering uses the verified
NVIDIA GeForce RTX 3090 Ti through ANGLE/Direct3D11.

Scope: shared browser geometry and rebuilt local compiled aerial assets.
Unity, Blender and packaged desktop/Android exports are not regenerated.

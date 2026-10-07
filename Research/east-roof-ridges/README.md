# Eastern cross-range ridge continuation — 7 October 2026

The owner's [marked model view](reference.png) locates gaps beside the eastern
1829 cross-range and supplies the intended roof arrangement. The written request
continues the red ridge along the yellow branches at a common height, with the
blue edges descending to the existing walls. This supersedes the disconnected
16.2-high crown and clipped intersection in the October 5 eastern brick-join note.
Coordinates below are model estimates from that annotation, not surveyed dimensions.

`Browser/dist/east-entrance-roof-join.mjs` now builds adjoining roof faces across
the entrance, cross-range, two polygonal bays and end pavilion. The existing
15.66 entrance ridge continues at z=12 to x=66.7. Branch ridges run over the
garden bay at x=53.1, courtyard bay at x=59.8 and end pavilion at x=66.7, all
at 15.66. The three marked descending edges reach the court corner and both
garden-side returns. Outer eaves follow the existing cornices at 14.53–14.6.
The entrance's retained pitches still meet the replacement at x=38.

Both short rising eaves have outward-facing brick and white render below the
slate. The previous faces pointed inward and disappeared when viewed from
outside. A short return and solid soffit close the frontage's 0.4-unit overhang
to its actual wall. Brick triangles stop at the existing cornice without folding
over the white strip. Solid cap returns prevent duplicate automatic fascia
faces. White render ends at the slate edge. The shared roof-tile
and underside finish runs after these changes, before period splitting and
material batching. Windows, doors, paths and ground-level wall outlines retain
their definitions; no runtime scene movement or obstacle update is introduced.

`test-east-roof-brick-joins.mjs` protects the level ridges, descending seams,
178 roof contacts, 138 outward wall/render contacts, the earlier twelve marked
viewing rays and 20,139 coverage/overlap probes. It also accepts `--compiled`.
The general roof-wall audit retains its frozen rays; vertical probes of the
former internal eastern eaves reach the newly raised roof underside.

Before/after views, source snapshots, regression cases, GPU captures and logs
are in `Browser/artifacts/east-roof-ridges/`. Reproduce captures from the repo
root with `node Browser/artifacts/east-roof-ridges/capture.mjs after source`
or `node Browser/artifacts/east-roof-ridges/capture.mjs verified compiled`.
The launcher requires a verified hardware GPU. Final validation is recorded in
`DEVELOPMENT.md`.

Scope: shared browser exterior sources and rebuilt local compiled aerial assets.
Unity, Blender and packaged desktop/Android exports are not regenerated.

# Redesmere lower frontage band — 9 October 2026

The owner's [marked walking view](owner-marked.png) identifies the existing
thin band in orange, its missing continuation around the blank projection
in yellow, and the disconnected appearance beneath the bay in blue. The
annotations locate the defects; the written request authorizes the repair.

One closed, mitred course now follows the flush frontage, canted bay,
doorway recess, blank projection's west return and front, and square
pavilion frontage. It matches the orange section at y=4.08, with height
0.16 and width 0.14. Its underside is y=4, meeting the existing rendered
ground storey. These are existing model coordinates, not survey dimensions.

The bay's former 0.20-high course used a prism without an underside. It is
replaced by the shared closed course, and the old overlapping front bars
are removed. The main range and pavilion's original lower slabs end behind
their front wall planes, retaining the court and side trim. The masonry,
openings, doorway canopy and roofs keep their existing definitions.

`test-support/redesmere-floor-band-probes.mjs` surveys the actual complete
visible model at frozen facade positions. Its 92 rays verify the pale wall
below the band, its projection, one level top, and a closed underside.
`test-facade-courses.mjs` runs this check and also surveys every new mitre.
The browser inspection repeats those rays against source and rebuilt
compiled batches; restoring the saved original builders fails the check.

The independent comparison against those builders matches all 1,446,222
primitives outside the lower-band area and all 540 tiled-roof primitives.
Only the eight original local trim primitives become seven fitted pieces.

Matching before/after, low-angle, opposite, garden and phone views are in
`Browser/artifacts/entrance-floor-band/`. See DEVELOPMENT.md for validation.
Shared browser sources and local compiled aerial assets are updated.
Unity/Android, Blender and packaged exports are not regenerated.

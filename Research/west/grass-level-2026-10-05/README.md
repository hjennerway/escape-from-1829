# Continuous west garden grass (5 October 2026)

The owner's [marked view](marked-reference.png) identifies a step through the
open lawn beside the 1829 west wing. Grass must remain continuous across the
surface. This supersedes the retained raised garden panel in the earlier
west photo refinement.

The former 22.5 by 17 grass box had a top at y=0.37 and started at z=25.5,
while the adjoining grass was estate terrain at y=-0.15. Removing the box
exposes the same continuous terrain throughout the garden. The old underlying
access slab is cut beneath the rectangle and its narrow return to the garden
wall, preserving grass in gameplay as well as aerial and Explore layouts.

The lean-to doorway approach retains its y=0.46 top. Its solid gravel sides
now extend below the lawn to y=-0.17, avoiding daylight beneath the path.
Building, door, stair and surrounding paving top positions are retained.

Changes are in `Browser/dist/west-front-photo-detail.mjs` and
`Browser/dist/escape-exterior.mjs`. The existing gameplay, timeline and browser
ground checks probe both sides of the former z=25.5 seam and the larger lawn.
GPU-verified before/after source and compiled captures and validation logs use
`Browser/artifacts/west-garden-level/`. Unity, Blender and packaged exports
are not regenerated.

Validation: the saved source/compiled scene passes the complete model and
all-period browser checks with verified NVIDIA hardware rendering. The full
125-command browser suite has 122 passes, with the concurrent west-roof join
and the two whole-estate protected fingerprints failing. Details and the
saved-scene validation receipts are in DEVELOPMENT.md and the evidence folder.
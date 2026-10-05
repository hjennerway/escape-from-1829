# Entrance-side roof boundary

The owner's [yellow marked view](../../../Browser/artifacts/west-roof-yellow-boundary/marked-reference.png)
on 5 October 2026 asks to redo the small roof connection beside the west
entrance, following the yellow roof-to-wall boundary and removing the pieces
projecting above it. The image locates the geometry; its annotations are
reference evidence. This supersedes the sampled coping heights on the three
west inside-corner upper returns described in the earlier
[inside-corner notes](../../front-inside-corners/README.md).

The back eave meets its trim at y=14.53. A short 0.10-unit run drops by 0.23
to the next level eave at y=14.30. The canted side then descends directly to
the existing entrance cornice's terminal upper edge. These fitted coordinates
are model estimates, not surveyed dimensions. Slate and render share straight
mitred endpoints, rather than independently sampling overlapping roof faces.

Narrow slate returns join that boundary to the retained pitches. Each inboard
seam includes every existing roof crease, and the former fringe is removed
through the render overhang. The back ribbon stops at the neighbouring
pavilion's established valley endpoint x=-34.6, preserving its separate
roof and ridge. The solid brick roof closures finish beneath the same profile.
The upper coping has no raised tip at either bend.

Implementation is in Browser/dist/front-inside-corners.mjs. Shared browser
sources and the local compiled aerial model are updated. Wall footprints,
openings, low decks and walking routes retain their definitions. Unity,
Blender and packaged application exports are not regenerated.

Validation is restricted to this building and its immediate surroundings,
following the owner's explicit instruction. The focused boundary check tests
17 contacts, 444 physical trim samples and the adjoining crowns; the saved
original corner fails its new level-eave assertion. The existing inside-corner,
west refinement and west roof checks pass. Source and compiled GPU captures
cover the marked entrance, close, low, overhead and phone views. All 32 visible
roof contacts and seam probes match between both paths. Evidence and the
verified source/binary fingerprints are in Browser/artifacts/west-roof-yellow-boundary/.

## Later continuous-pitch correction (5 October 2026)

The owner's subsequent blue/yellow pitch guide supersedes the initial level
back edges and short step described above. The back slate now keeps the
unchanged main roof plane and angle; the coping and brick closure follow it.
The side return still meets the actual entrance cornice. See
[the pavilion roof-tip correction](../pavilion-roof-tip-2026-10-05/README.md).
The current focused regression checks 88 pitch/bend contacts and 432 physical
trim samples. Refreshed source/compiled probes compare the exposed boundary
with the retained main pitch. The earlier numerical results above describe
the first repair, before this follow-up.

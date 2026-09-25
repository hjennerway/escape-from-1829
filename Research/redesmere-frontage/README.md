# Redesmere-facing frontage of 1829 — 25 September 2026

The owner supplied marked-model.png, marked-photo.png and reference.png.
The colours locate the corrections; they are not proposed surface colours.
The owner explicitly clarified that the blue-marked recess must be removed
and the wall aligned with its adjoining frontage.

The narrow strip at x=41–45.1 now reaches z=19.5 on all three storeys.
Its white base, brickwork, sashes and cornice move together. A stepped slate
roof joins the original range without extending its rear courtyard walls.
The earlier courtyard recess on the opposite face remains in place.

The red/yellow area now has a two-storey blank projection at x=59.2–61.25,
between the entrance and the square pavilion. Its front aligns at z=25.
White ground-floor walls, upper brickwork, pale coping and a level grey roof
follow the photograph. A narrow pale upper door with divided glazing meets
the roof at y=9.645. The neighbouring middle window is broader, and the
entrance/upper sash move slightly left to clear the projection. The pale
floor courses continue across the adjoining frontage.

Dimensions, roof depth and concealed joins are visual estimates. These are
construction-time changes in Browser/dist/east-photo-detail.mjs and
escape-exterior.mjs, shared by aerial, Explore and gameplay. Walking
obstacles derive from the new masonry; no runtime visibility logic changes.
Unity and Blender exports have not been regenerated.

Browser/test-redesmere-garden.mjs checks the actual wall planes, exposed
glazing, upward-facing slate, roof coverage and level, upper door threshold,
blank projection and player-width access. The existing exterior, forward-end,
roof-contact and historical-period checks protect adjoining geometry.
Before/after source and compiled visual evidence uses
Browser/artifacts/redesmere-frontage-*.

The pre-edit model passes both whole-estate snapshots. Exact comparison of
1,485,398 primitives outside the local correction bounds confirms no changes
elsewhere. The two snapshot geometry hashes were refreshed for the 26 net
added primitives only after that check; Leighton/Newton ranges are retained.
The local compiled model passes source/rendering equivalence, full detail,
fallback, timeline and walking-collision checks.

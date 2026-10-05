# West roof eaves and entrance-bay ridge

The owner's three follow-up views on 5 October 2026 identify
[circled corner gaps](circled-corners.png), the
[required wall-top eaves](wall-top-eaves.png), and an
[additional entrance-bay ridge](entrance-ridge.png). The written requests
preserve the earlier drawn ridges, lower the marked long pitches to the blue
wall-top lines, and add a perpendicular ridge on the last red line. The
annotations locate those changes and are modelling reference evidence.

The earlier [yellow ridge plan](../roof-ridges-2026-10-05/README.md) stays in
force: the main crown remains y=17.08, z=9.25, x=-68..-30.6, with all four
original branches and their endpoints unchanged. This follow-up supersedes
the earlier raised straight eave edges between the bays. Those pitches now
reach y=14.53 on the main cornice at z=13.9. Short shared slate returns connect
to the higher bay and outer-pavilion cornices. The stepped outer court corner
has a small pitched return over its protruding wall; lowering that whole
shoulder would let the existing taller masonry pierce the roof.

The red entrance-bay branch follows x=-27.3, z=12..18.3 at y=15.66, meeting
the retained main roof envelope at its root and ending in a hip. Its pitches
are clipped at the exact intersections with the retained roof planes. Their
underlying old triangles are removed where the new surface replaces them,
without raising or moving the existing yellow entrance ridge. The registered
coordinates are visual estimates, not surveyed dimensions.

`Browser/dist/west-cross-range-roof.mjs` builds the changes in the shared
browser exterior. Wall sources, windows, stairs, low flat decks and the
mirrored rear roof keep their definitions. The local compiled aerial model is
regenerated. Unity, Blender and packaged desktop/Android exports are not
regenerated.

`Browser/test-west-roof-join.mjs` retains the complete original ridge and
valley checks, adds wall-top eave probes, tests the actual circled pixels
against the complete model, checks the red ridge and its valley joins, and
verifies the taller corner masonry stays under slate. The earlier raised-edge
masonry probes now sit below the lowered cornice. The saved former roof fails
the new level-eave assertion. Hardware-rendered source and compiled captures,
visible-scene roof probes, baseline source and test/build logs are in
`Browser/artifacts/west-roof-eaves/`. Validation results are in `DEVELOPMENT.md`.

# West wing roof ridge reconstruction

The owner supplied the [circled oblique view](problem-areas.png) and
[yellow overhead ridge guide](ridge-plan.png) on 5 October 2026. The written
request asks to redo the west wing roof, pitching it from the yellow lines.
The annotations locate the requested geometry; they are reference evidence.
This supersedes the separate upper hips and sampled patch in the earlier
[roof-join correction](../roof-join-2026-10-04/README.md).

The main ridge follows z=9.25, from x=-68 to -30.6, at y=17.08. Four level
branches meet it: the outer pavilion at x=-68 to z=17, the courtyard bay at
x=-58.4 to z=3.7, the garden bay at x=-52.5 to z=14.5, and the inner pavilion
at x=-37.5 to z=18.5. These fit the marked plan in the existing browser
coordinates and are estimates, rather than surveyed dimensions.

Straight slate pitches run from these ridges to the existing eaves. Shared
valley edges connect each T junction to its inside corners. The canted bays
retain their outlines, and each branch finishes with a hip. Old intersecting
roof faces are removed within the new surface. The eastern hip follows every
crease of the retained lower roof envelope; the mirrored rear wing keeps its
transform and unmarked rear ridge. Matching brick closes raised perimeter
edges down to the supporting walls and adjoining slate.

The independent low courtyard deck, inside-corner flat roof, wall footprints,
windows, stairs and walking routes retain their definitions. The new roof
uses the shared browser exterior in aerial, Explore and gameplay. The local
compiled aerial model is regenerated. Unity, Blender and packaged application
exports are not regenerated.

Implementation is in `Browser/dist/west-cross-range-roof.mjs`, called from
`escape-exterior.mjs`. `Browser/test-west-roof-join.mjs` checks the complete
main ridge, all four branches, descending pitches, shared valleys, lower
roof seam, solid perimeter masonry and retained low deck. The original
builder fails the new main-ridge regression. The older exterior ridge check
now limits the west level-ridge invariant to its unmarked rear section.

Baseline sources, matching overhead/court/garden/end views, actual compiled
ridge probes and validation logs are in `Browser/artifacts/west-roof-ridges/`.
Final validation results are recorded in `DEVELOPMENT.md`.

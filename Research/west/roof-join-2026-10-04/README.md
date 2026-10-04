# Raised west cross-range roof join

The owner's [purple/yellow roof annotation](marked-reference.png), supplied
on 4 October 2026, asks to slightly raise and smooth the small recessed roof
so the two circled brick strips disappear. The image locates the correction;
the owner's written request defines its scope.

The former small hip between the main cross range and outer pavilion now
continues the main ridge at y=17.08, approximately 0.6 above its former crown.
The garden shoulder meets the outer pavilion's existing slate. The court-side
pitch meets the polygonal bay's rear slate edge above its brick and cornice.
Shared borders follow the retained roofs' upper surfaces, including the
middle garden branch's valley, rather than leaving a vertical slate step.

These coordinates fit the current browser model and are not surveyed heights.
The surrounding wall outlines, windows, garden bay and walking routes retain
their definitions. The preceding footprint, rear-corner and inside-corner
corrections remain in effect.

The shared browser helper is `Browser/dist/west-cross-range-roof.mjs`, called
by `escape-exterior.mjs`. `Browser/test-west-roof-join.mjs` checks coverage of
both marked strips, upward-facing slate, ridge continuity and border heights.
Disabling this helper reproduces the original uncovered-pavilion failure.
Matching views and validation logs are in
[Browser/artifacts/west-roof-smoothing](../../../Browser/artifacts/west-roof-smoothing/).
Browser sources and local compiled aerial assets are updated. Unity, Blender
and packaged application exports are not regenerated.

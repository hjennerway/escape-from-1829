# West garden staircase door wall and walkway width

The owner's 5 October 2026 request moves both landing doors from the side
return to the recessed garden-facing wall and makes the platform to each
door a uniform width matching the stairs. The [ground photograph](ground-reference.png)
shows the doors behind the flights, beside the recessed window bank. It is
visual modelling evidence; the written request defines the change. This
supersedes the earlier E-shaped-plan description that turned the doors onto
the pavilion's inner side wall.

`Browser/dist/west-garden-stair.mjs` now places both doors at x=-63,
z=13.57, facing +Z from the wall at z=13.5. Their existing threshold levels
remain y=4.25 and 8.5. Both door walkways are 1.2 units wide, matching the
treads. The upper approach is a constant-width L; the middle walkway follows
the wall to a 1.2-deep turning landing. Parallel stair lanes at x=-61.65
and -60.3 leave the wall-side walkway clear of the upper flight. Continuous
guards close exposed edges and keep the doorway and flight mouths open.
These dimensions fit the current model and are not surveyed measurements.

The first-floor F4 outside arrival moves to (-63,4.25,14.3) in both shared
JSON plans. The established interior doorway anchor stays in place; the
8.5-high exterior door remains outside the two-floor wing proposal. The
outside stair polyline follows the new walkway and lower flight. Other
facade details, the ground-floor inset sash and the completed grass/roof
changes retain their sources.

The shared browser exterior supplies aerial, Explore and gameplay.
`test-west-garden-stair.mjs` checks actual door leaves on the new wall,
removal of the side-wall leaves, full-width floor support, both plan arrivals,
stopped/restarted climbing and descent, guards, batching and period removal.
Existing west, outside-arrival, railing, door-support and clearance checks
also cover the repair. The old source fails the new door-wall assertion.
Hardware browser views, the saved former source, movement traces and
build/suite logs are in `Browser/artifacts/west-garden-stair/`. Validation
results are recorded in `DEVELOPMENT.md`.

Browser sources and the local compiled aerial model are updated. Unity,
Blender and packaged application exports are not regenerated.

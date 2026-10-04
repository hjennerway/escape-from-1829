# West inside-corner stepped wall and flat roof

The owner's [yellow-line screenshot](../../../Browser/artifacts/west-flat-corner/marked-reference.png),
supplied on 4 October 2026, asks for the wall to continue along the marked
step and for the new section to have a flat roof. The written request defines
the change; the image locates it and supplies estimated proportions.

The lower addition joins the garden pavilion at x=-35 to the retained low
forward wing at z=21.2. Its exposed perimeter follows x=-33.65 from z=15.5
to 18.5, turns to x=-32, then continues to z=21.2. Matching brickwork rises
to y=8.6, with a level dark roof at y=8.83 and joined pale edge coping.
These coordinates fit existing model joins and estimate the yellow guide;
they are not surveyed dimensions. This supersedes the open lower strip in
the earlier [roof/face correction](../roof-face-2026-10-04/README.md).
The aligned upper back wall and removal of the earlier shoulder hip remain.

The four existing lower return sashes move onto the addition's two exposed
longitudinal walls. Their sizes, divisions, heads and sills are retained.
The landing windows and doorway remain exposed, and the remaining court
provides walking access. The solid addition's footprint supplies collisions.

The shared browser model is in `Browser/dist/front-inside-corners.mjs`,
used by aerial, Explore and the game. The local compiled aerial model is
regenerated. Unity, Blender and packaged applications are not regenerated.
Baseline sources, before/after views, actual-page views and validation logs
are saved in [Browser/artifacts/west-flat-corner](../../../Browser/artifacts/west-flat-corner/).

Validation passes the focused wall/roof, pane, physical walking and current
compiled-asset checks. The broader combined browser run passes 122 of 124
checks, retaining the two historical estate snapshot failures that also
reproduce with the original corner. Final complete compiled/timeline reruns
were interrupted by concurrent model edits and a shared screenshot lock;
the final rebuilt asset passes its scoped geometry, collision and checksum
checks and matches the current source. See DEVELOPMENT.md for the details.

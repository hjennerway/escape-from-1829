# West-wing upper access staircase — 5 October 2026

Superseded by the owner's later [single-stair request](../single-library-stair-2026-10-05/README.md).
The retained initial flight, diagonal return and middle landing described here
are now removed from the Library connection.

The owner's [marked interior view](reference.png) requests removal of the
yellow wall and return flight, with the replacement flight connecting to the
surrounding corridors approximately along the blue line. The written request
defines the change; the marks supply its position and direction.

This supersedes the enclosed S5 continuation in
[the Library-storey notes](../../west-library/README.md). S5's first-to-second
floor connection (plan IDs 1 → 3, Y=4.2 → 8.4) retains its initial flight and
square shaft. Its upper return now rises diagonally from the middle of the
return landing toward the west side of the north corridor landing. The old
wall-side flight is removed. The return landing has a fitted diagonal edge,
and a small arrival deck meets the existing upper slab without a gap.

The new upper-flight centre runs from (-31.15,6.3,12.3) to
(-33.35,8.4,9.7). Its landing departure is (-33.35,8.4,8.55), adjoining C26.
The walking route turns at Z=13.15 to clear the angled inner railing. These
coordinates and the 1.3-wide flight are gameplay modelling estimates from the
annotation, not surveyed architectural dimensions.

R51 is now an open stair hall on both adjoining levels. Its internal west,
east and rear partitions are removed; the upper storey's actual perimeter
retains its external walls. Both shared plans, flights, closed concrete
undersides, carpet treads, guards, navigation, collision and developer overlay
consume the same connection-specific geometry. The basement-to-ground and
ground-to-first flights retain their previous routes and geometry.

The first-floor and Library SVG/PNG plans are regenerated. Hardware-rendered
before/after Explore views, the saved former plan and validation results are
under `../../../Browser/artifacts/west-upper-stair/`. The furnished game and
Explore Library checks are under `../../../Browser/artifacts/west-library/`.
Detailed checks are recorded in `../../../DEVELOPMENT.md`.

Only browser interior sources, shared plans, checks and review drawings change.
The aerial compiler excludes these interiors and its current binary still
matches its sources. Unity, Blender and packaged application exports are not
regenerated.

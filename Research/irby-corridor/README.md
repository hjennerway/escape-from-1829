# Water tower to Irby corridor

The September 17, 2026 [marked screenshot](marked-reference.png) identifies the
new corridor in red, the existing gravel path in yellow, the three workshops
in blue, and the tower-facing end of Irby/Ashley in green.

The later [front-footprint correction](front-footprint-reference.png) replaces
the first Irby junction: blue defines a straight rectangular ward end, red
extends the corridor to that same end, and yellow removes the projecting cap.
The final [blue workshop-back line](workshop-backs-reference.png) extends all
three workshop backs to the opposite side of the corridor.

The new low brick corridor runs from the tower gallery at (156.3, -66.6) to
(221.7, -66.6), making a 90-degree junction with that gallery. Its centreline
aligns with the gravel path's service-court endpoint. The existing path retains
its slight 1.8-degree skew towards the avenue. Corridor width, eaves and roof
rise match the existing galleries: 5.4, 3.6 and 0.64 scene units.

The three blue-circled workshops first move towards Main/admin (+Z), with the
widest shortened to preserve the pharmacy approach. Their backs then extend
2.4 units to z=-63.9, directly against the new corridor. The front walls remain
at z=-47.5, giving all three a depth of 16.4 units. The widest retains its
21-unit width; the other two remain 14 units wide. Heights, front doors,
front windows and roof-dormer positions are retained. Masonry, gables, slate
roofs, ridges, gutters and collisions follow the extended backs. Buried
corridor windows are omitted at the workshop contacts.

Irby's 9.8-unit-wide tower-side return (x=211.9 to 221.7) extends towards
Main/admin to z=-69.3, directly against the corridor's ward-side wall. Both
fronts finish at x=221.7. The earlier tower-facing cross wing and added end cap
are removed, including their roofs, sashes, trim and collisions. The retained
return has two-storey masonry and a continuous hipped slate roof. Ground-floor
windows are omitted on both sides of the covered joint, and the exposed
corridor end has a closed brick gable. Service-court asphalt wraps around the
new footprint. Grafton/Edge retains its independently refined shape.

Choose **Water tower / Irby corridor** in Locations, or open
`aerial.html?view=irby-corridor`, `aerial.html?view=irby-corridor-plan` or
`explore.html?view=irby-corridor`. The new construction follows the Historic
layout's visibility and walking collisions. Browser geometry is updated;
Unity and Blender exports are unchanged.

`Browser/test-ward-corridors.mjs` checks the right angle, path-mouth alignment,
flush ward and workshop contacts, removed yellow section, roof coverage,
workshop dimensions, fixed fronts, walking start and layout visibility.
`Browser/test-irby-ashley.mjs` checks the revised bounds, roofs, sash exposure
and the retained garden details.
`Browser/test-irby-roads.mjs` checks that asphalt follows the revised front
without running beneath the corridor or ward.

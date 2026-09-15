# Water tower: four-sided photo refinement

References: the user's `1.jpg`–`4.jpg`, photographed upwards from ground level, and `locationa.png`. The screenshot numbers are orientation guides only.

| Side | Outward scene axis | Distinguishing features |
| --- | --- | --- |
| 1 | +Z | Pale framed arched entrance, large blocked arch above, small blocked opening to the left, pale repair at lower right, intersecting roof scars only toward side 4 (right), left downpipe |
| 2 | -X, toward 1829 | Tall arched glazed window, small blocked opening with stone lintel above, no triangular ghosts, downpipe at right |
| 3 | -Z | Two blocked arches, roof scars only toward side 4 (left); plain brick at the edge meeting side 2 |
| 4 | +X, toward annexe | Two blocked arches, crossing roof scars, pale repair at lower left |

All four faces share the upper blind arcade: three pairs of bricked slit recesses, twin small round heads inside concentric brick arches, corner strips, a dark string course and corbelled eaves. The lower plain stage is now about three fifths of the wall height. The upper stage no longer extends almost to the ground.

Roof abutments are represented by shallow stepped brick bands and different infill brickwork. They cross independently beneath the later blocked openings. The user’s correction takes precedence over inferred photo staining: side 2 has no triangles, and neither do the adjoining edges on sides 1 and 3. These are traces of removed roofs, not extant roofs projecting from the tower.

The existing square footprint, position, roof pitch and total height (39.05 scene units including the finial) remain. The photos do not show the roof surface; their perspective convergence is not interpreted as structural taper. Elevation dimensions and weathering boundaries are visual estimates, not surveyed dimensions.

Implementation: `Browser/dist/water-tower.mjs`. Ground-level comparison views: `aerial.html?view=tower-1` through `tower-4`, linked from the tower aerial. The model is shared by the browser aerial and walking scenes. Unity and Blender assets were not regenerated.

Validation: `Browser/test-water-tower.mjs` checks world orientation, exposed openings and scars, finite geometry and projected framing. Existing exterior and full browser checks also apply. `Browser/artifacts/inspect-tower.cjs` captures all four sides and checks browser errors.

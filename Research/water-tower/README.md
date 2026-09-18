# Water tower: four-sided photo refinement

References: the user's `1.jpg`–`4.jpg`, photographed upwards from ground level, and `locationa.png`. The screenshot numbers are orientation guides only.

| Side | Outward scene axis | Distinguishing features |
| --- | --- | --- |
| 1 | +Z | Pale framed arched entrance, large blocked arch above, small blocked opening to the left, pale repair at lower right, one inward-falling roof scar and red repair brickwork toward side 4 (right), left downpipe |
| 2 | -X, toward 1829 | Tall arched glazed window, small blocked opening with stone lintel above, no triangular ghosts, downpipe at right |
| 3 | -Z | Two blocked arches, one inward-falling roof scar and red repair brickwork toward side 4 (left); older brown brick at the edge meeting side 2 |
| 4 | +X, toward annexe | Two blocked arches, two inward-falling roof scars over red brickwork with patchy pale mortar, pale repair at lower left |

All four faces share the upper blind arcade: three pairs of bricked slit recesses, twin small round heads inside concentric brick arches, corner strips, a dark string course and corbelled eaves. The lower plain stage is now about three fifths of the wall height. The upper stage no longer extends almost to the ground.

## Brick colour correction, 18 September 2026

The user's `brick-colour-correction.png` identifies the descending red line as correct and the rising yellow line as absent from the photographs. This supersedes the earlier interpretation of crossing roof scars: all upward-to-centre gable outlines and their triangular colour patches are removed from sides 1, 3 and 4.

The retained shallow stepped bands use the unchanged profiles in `Browser/dist/tower-roof-profiles.mjs`, shared with the adjoining service roofs. The redder repair brickwork now ends at those inward-falling contacts, with a flat centre behind each blocked arch. It occupies the right of side 1, left of side 3 and both sides of side 4. The corners adjoining side 2 retain their older brown brick.

Dedicated red brick and pale mortar textures replace the tinted brown triangular overlays. Irregular lime residue follows individual courses, strongest at the lower right of side 4, and the blocked arches mix red, buff and darker bricks with pale joints. These weathering patterns are visual interpretations of `1.jpg`, `3.jpg` and `4.jpg`, not a photographic texture projection. The existing white repairs remain.

The correction changes colouring and removes the erroneous overlay geometry. The tower footprint, openings, retained roof scars and adjoining roof geometry stay fixed.

The existing square footprint, position, roof pitch and total height (39.05 scene units including the finial) remain. The photos do not show the roof surface; their perspective convergence is not interpreted as structural taper. Elevation dimensions and weathering boundaries are visual estimates, not surveyed dimensions.

Implementation: `Browser/dist/water-tower.mjs`. Ground-level comparison views: `aerial.html?view=tower-1` through `tower-4`, linked from the tower aerial. The model is shared by the browser aerial and walking scenes. Unity and Blender assets were not regenerated.

Validation: `Browser/test-water-tower.mjs` checks world orientation, exposed openings and scars, finite geometry and projected framing. Existing exterior and full browser checks also apply. `Browser/artifacts/inspect-tower.cjs` captures all four sides and checks browser errors.

The 18 September validation passed the full `npm test` suite, `npm run build:models` and `npm run test:compiled`. Source and compiled renders of all four sides are saved as `Browser/artifacts/water-tower-colours-{before,after,compiled}-{1,2,3,4}.png`. The before/after inspector verifies identical retained roof-scar vertex arrays, colours and tower transforms; compiled views confirm the rebuilt asset loads without fallback or browser errors. Logs are `water-tower-colours-suite.txt`, `water-tower-colours-build.txt` and `water-tower-colours-compiled.txt` in the same artifacts directory. Browser sources and generated aerial models were updated; Unity and Blender exports were not regenerated.

## Red and yellow lower arches, 18 September 2026

The follow-up `striped-arches-correction.png` marks the ground-level blocked doorways on sides 3 and 4. Photos `3.jpg` and `4.jpg` show alternating red and buff-yellow bricks radiating around their semicircular heads. Those two arch rings now have individually coloured radial bricks and aligned mortar joints, with light surface weathering. The 21-brick division is a visual estimate. The jambs, blocked infill, upper arches, earlier wall-colour correction and shared roof contacts are retained. The arch-ring geometry, opening sizes and positions are unchanged.

Arch validation: `npm test`, `npm run build:models` and `node test-precompiled-models.mjs` all pass. `Browser/artifacts/inspect-water-tower-arches.mjs` confirms exactly two striped arch rings, unchanged arch vertices and positions, unchanged roof scars, and no browser errors in the source and compiled views. The paired close-up is `Browser/artifacts/water-tower-arches-compiled-corner.png`; before/after views and validation logs share the `water-tower-arches-` prefix. Browser source and the generated aerial model were updated; Unity and Blender exports remain unchanged.

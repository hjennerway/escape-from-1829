# Church grounds

The supplied `googleearth.png` identifies the church in red and shows four short
approach paths, a rounded walk behind the vestry, and curved grass areas beside
Parsons Lane. `render-before.png` records the previous grounds.

`Browser/dist/church-grounds.mjs` replaces the old L-shaped porch path with two
approaches on each long side, a continuous horseshoe perimeter walk, and two
short curved links to the lane. The enclosed lawns and roadside grass pockets
use the existing estate terrain, with narrow edging and muted grey paving.
The porch approach meets its existing stone step.

The photographic layout is fitted to the fixed church and existing road edges;
it is not a surveyed reconstruction. The clock-end walk terminates at Parsons
Lane. Church dimensions, position, orientation, and road centrelines are retained.
Modern cars and parking bays are outside this grounds refinement.

The grounds share the church's Historic/Modern visibility and appear in the
exterior walk and gameplay. Select **Church grounds** in Locations, or open
`aerial.html?view=church`, `aerial.html?view=church-plan`, or
`explore.html?view=church`. Unity and Blender exports are unchanged.

Checked rendered aerial, plan, ground and Modern views, the real aerial page,
and the existing Upton/church alignment, layout, walking and exterior tests.
Review images are in `Browser/artifacts/church*.jpg`.

## Clock-facing front, September 17 refinement

`clock-front-reference.png` is the user's ground-level photograph. It supersedes
the earlier generic front window and clock detailing. The visible front has two
individually pointed lancets with diamond leadwork, layered sandstone arch
mouldings, a narrow central mullion, a shared projecting sill, and plain brick
below. The apparent small window to the left is on the nave's side wall, not a
third front opening.

`Browser/dist/church-front.mjs` supplies the paired lights, stepped frontal
buttresses with weathered caps, dark plinth, small putlog holes, shouldered clock
stage, blue Roman-numeral dial, steep brick pediment with slate side pitches,
stone copings and terminal cross. Dimensions and colours are visual estimates
from the oblique photo; church registration, nave, porch and grounds are retained.
The facade uses its own muted brick material without recolouring other buildings.

Open `aerial.html?view=church-front`, or select **CLOCK FRONT** from the church
view. Front and oblique review renders are in
`Browser/artifacts/church-front-*-after.png`; the corresponding `*-before.png`
files record the previous geometry. Unity and Blender exports are unchanged.

The same unedited `clock-front-reference.png` is included in the Church's
**Building photos** gallery as **Church · clock-facing front**, alongside the
existing aerial photograph. `Browser/build-building-photos.mjs` generates the
689 × 918 WebP asset and records its source in the photo manifest.

## Centred road and completed perimeter — 5 October 2026

The owner's [blue-road/red-path annotation](road-loop-marked-2026-10-05.png)
asks for the church-front road to sit halfway between Churton and the church,
and for the perimeter walk to form a complete loop. This supersedes the open
horseshoe and clock-end termination described above. The image is placement
reference for the request, not a separate source of instructions.

The shared Parsons Lane frontage now lies at z=-93.55, halfway between the
projecting Churton lawn bay at z=-82.65 and the church's clock-end feet near
z=-104.45. Its western bend eases into that straight section, and the Upton
Lea T-junction moves with it. The registered buildings and saved geographic
road vertices retain their positions. Churton's entrance and mast-side gravel
approaches end at the moved lane, without exposed paving on the church side.

The clock-end arc closes the two-metre perimeter walk at local z=19. Periodic
ribbon tangents join both paving edges and edging exactly at the closing seam.
A short front link meets the relocated lane; both existing side links reach
asphalt. The local merged western junction is regenerated from the updated
road outlines, so the vacated road returns to terrain.

Run `node Browser/test-church-grounds.mjs` for midpoint, full-width loop/seam,
walking clearance, road/junction continuity, lane-link contact and removed-road
checks. Local review captures and receipts are in
`Browser/artifacts/church-road-loop/`. Browser sources and the local compiled
aerial model are updated; Unity, Blender and packaged exports are unchanged.

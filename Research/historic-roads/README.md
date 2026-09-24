# Historic road layout — 16 September 2026

## Service-road clearance correction — 17 September 2026

The previously failing building-clearance assertion identified the old Admin
north service ribbon crossing the refined tower ranges. The six-unit route
now passes between the tower and Estates at x=232.67, then eases to x=235 to
clear the wider workshop. Its northern turn passes Irby's fixed front at
z=-68.8; the five-unit Tower north court lane moves to z=-69.6. Both roads
retain their widths and pale borders. Building footprints remain unchanged.

The full-width and rounded-end clearance checks now pass. The removed annexe
loop's old grass sample at local [75,121] lay on the relocated frontage avenue's
kerb; it now samples [75,128], beyond that approved road. The annexe-placement
test protects the actual annexe routes instead of unrelated estate roads.
Before/after service-court renders are saved as
`Browser/artifacts/irby-red-orange-road-before-clear.png` and
`Browser/artifacts/irby-red-orange-road-after-clear.png`.

## Frost drive lawn spur removed — 17 September 2026

The user's red-circled screenshot removes the dead-end extension below the
Main/admin semicircle. Frost drive now ends at its frontage-drive junction
(the seventh mapped point); its last two points are omitted from the rendered
centreline. Asphalt, borders and label anchors all use the shortened path.
The original Google Earth coordinates remain archived in `modern-road-data.mjs`.
This affects the Modern road shown in aerial and exterior walking layouts,
including when both layouts are visible. The Historic frontage drive remains.
See `Browser/artifacts/frost-drive-after.png` for the checked result.

## Main/admin frontage correction — 17 September 2026

The latest [red outline](admin-frontage-closer.png) brings the frontage drive
directly outside Main/admin. The semicircle and its D-shaped lawn move 5.5 scene
units towards the building, with no rotation or scaling: the road centreline
radius remains 18 units and its width remains 5.5 units. The six-unit frontage
drive joins both ends of the semicircle along its straight diameter, clears the
projecting bays and entrance steps, and turns into the existing teardrop side
road. Its western approach blends back into the existing lane junction.

This supersedes the previous frontage position. The teardrop and buildings
retain their geometry. The change is in the browser Historic layout.

## Pine-road reroute — 17 September 2026

The latest [blue-circle/red-path screenshot](pine-road-reroute.png) removes the
lower Main/admin drive beneath the pines. Its replacement curves across the
lawn east of the trees and joins the existing annexe inner east road farther
along. The former northern arm and its junction apron are removed, exposing
the terrain. The southern drive retains an open three-way junction.

The replacement retains the six-unit asphalt width and pale borders. Pine
positions, the semicircular forecourt, the upper teardrop and the existing
east road stay in place. This road belongs to Historic, including exterior
walking. The screenshot is fitted approximately to the garage roof and lawn;
the new endpoint snaps to the existing east road's centreline.

`Browser/artifacts/pine-road-preview.mjs` renders the fitted view with and
without trees. The `pine-road-before` and `pine-road-after` images record the
change. Annexe access, aerial layouts and Modern entrance checks pass. The
annexe check samples the new road for continuous asphalt and the removed
section for exposed grass. The broader historic-road test has the same
pre-existing north-service-road building-clearance failure at
`[228.88947100550808, -4.523245293100267]` before and after this change.

The initial road-network reference is the user's [clean layout](layout.png) and [annotated layout](layout.-annotated.png). These supersede the earlier alarm-board and aerial road corrections in this directory.

Red selects the roads. Blue identifies the semicircular forecourt outside Main/admin; yellow identifies the narrow teardrop. Purple identifies Main/admin, green the water tower, and pink the existing tower service buildings. The annotation colours identify features and do not become surface colours.

The road curves are fitted around the established buildings because the photographed plan is skewed and the buildings have been refined independently. The northern boundary, western ward approach, Churton links, tower service courts, annexe avenue, eastern connection and long southern drive follow the selected network. The Main/admin drive forms a D around a semicircular lawn, with its straight side along the frontage. The teardrop is slender, with its point towards the northern junction.

The previous full roundabout, annexe garden/end loops, parking and entrance aprons, extra diagonal extension and outer eastern spur have been removed. Following the user's clarification, the sweeping Reception driveway from Vivienne Smith Lane is shared by Historic and Modern, alongside the pedestrian approach and building forecourt.

Saved Parsons Lane and Vivienne Smith Lane vertices remain unchanged. Every historic ribbon is trimmed against the complete saved lane paths, allowing for both asphalt widths, pale borders and rounded caps. The later explicitly requested junctions use local paved mouths to join their ends continuously. The southern drive resumes on the far side of Parsons Lane. The established Historic/Modern visibility of Vivienne Smith Lane's eastern tail is retained; clearance also accounts for that tail when both layouts are displayed.

The tower and its service ranges retain their positions. Service lanes clear their walls, ramp and the neighbouring Estates department. The service court is one filled apron with an open mouth, avoiding a duplicate curved strip or a kerb across the entrance.

Implementation:

- `Browser/dist/historic-road-layout.mjs`: selected paths, curves, islands and source provenance.
- `Browser/dist/historic-road-clearance.mjs`: shared-lane clearance and route splitting.
- `Browser/dist/historic-roads.mjs`: the shared-material surface renderer. Brown OS building outlines are removed; reference metadata remains available for placement and clearance checks.
- `Browser/test-historic-roads.mjs`: full-width lane/building clearance, rounded ends, D-shaped forecourt, closed teardrop, removed surfaces and layout visibility.

Open `aerial.html?view=historic-roads` for the whole network or `aerial.html?view=historic-admin-grounds` for the forecourt and service roads. Geometry remains a visual reconstruction, not surveyed coordinates.

## Annexe access and later junction corrections

The subsequent [red/yellow/purple screenshot](../annexe-placement/front-roads-annotated.png)
relocates the frontage avenue and teardrop and adds a gravel link to the service
court. The teardrop is translated intact; only its connecting approaches are
reshaped. The central sweeping entrance follows the relocated annexe, while
both front-side roads and the east roadside hardstanding are removed. Rear
access remains. This supersedes the front-side access details below; see the
[latest layout and checks](../annexe-placement/README.md#frontage-roads-from-the-later-redyellowpurple-annotation).

[The annexe annotation](annexe-access-annotated.png) adds a sweeping approach from the existing front avenue. [The latest entrance revision](annexe-entrance-revision.png) reduces the complete sweep to 60% of its initial width, removes the pale strips across the frontage and all gate geometry, and replaces the red-selected central apron with the same asphalt as the road. This supersedes the earlier 20% gate and 80% pale forecourt. The central apron reaches the entrance steps. Yellow adds the asymmetric front-side approaches, roadside and rear hardstandings, and two rear roads from Parsons Lane around the projecting rear wing. These additions supersede the earlier removal of all annexe approaches; other unmarked loops remain absent.

The Parsons rear junctions meet its saved asphalt edge and cover the pale border only within their open mouths. All route ribbons retain full-width building and lane clearance. The entrance remains open for walking, without gate piers or invisible collisions. New annexe features belong to Historic. Use `aerial.html?view=annexe-access` for an overview or `?view=annexe-entrance` for the narrowed sweep and asphalt forecourt.

[The admin correction](admin-junctions-annotated.png) joins the western frontage drive to Vivienne Smith Lane and opens the four-way junction beside the teardrop. Smooth, local junction aprons cover the former disconnected round caps without changing the saved lane vertices. A single continuous inner grass boundary and kerb replace the teardrop's scalloped inner edge.

[The northern connection](parsons-north-connection.png) joins the circled end of the northern estate boundary to the open end of Parsons Lane (North), curving outside the annexe. It belongs to Historic and has an open, continuous junction at the saved Parsons endpoint.

Implementation for these additions is in `Browser/dist/annexe-access.mjs` and `Browser/dist/admin-road-junctions.mjs`. `Browser/test-annexe-access.mjs` verifies the 60% width, removal of pale paving and gates, asphalt and walking continuity, rear junction edges, joined admin/northern roads, smooth teardrop and layout visibility. The original annotation colours identify features, not surface colours.
## Estates and Irby/Ashley service court

The later [purple court annotation](../estates/service-court-alignment.png) joins
the tower-side service lane, Irby/Ashley front recesses and both sides of
Estates into continuous grey asphalt. The former internal kerbs are covered.
Only a small rounded grass island remains between the buildings, and the
existing cobbled Estates court is a hole in the asphalt. The Estates model
slides towards the tower so its blue edge meets the yellow guide, retaining
its 19-degree rotation. The geometry is in `Browser/dist/estates-service-court.mjs`.

The latest [blue/red grass revision](../estates/grass-road-revision.png) removes
the outer road and kerbs east and south of Estates. The asphalt court follows
the north and entrance edges, retaining tower-side access. The island doubles
in depth towards Irby/Ashley, from 7 to 14 units, with its Estates-facing edge
fixed. The north service route clears the enlarged island; the former east
return and southern cross-lane are removed.

## Parsons Lane yellow retrace

The 16 September yellow/blue annotation (parsons-yellow-retrace.png) replaces the northern detour with a sweep from the western boundary past Irby/Ashley, across the frontage avenue and into the saved Parsons Lane north endpoint. The yellow southern fork joins the frontage avenue. The blue outer loop and upper service/frontage spurs return to grass. This supersedes the earlier northern connection. Ground-plane picks are fitted to the screenshot; road width and materials stay consistent. The saved Modern road vertices are unchanged. Verify with node Browser/test-parsons-retrace.mjs.

## Gravel alignment and northern fork � 24 September 2026

The red/blue/yellow screenshot moves the service-court gravel link six units
north, retaining its 2.4-unit width and slight skew. Its mouth starts on the
existing side-road edge. The Irby corridor remains fixed at z=-66.6; its former
dependency on the gravel endpoint is removed to preserve all attached buildings.

The Parsons southern fork now leaves the unchanged northern carriageway beyond
the tree crowns. This removes the overlapping parallel strip and returns its
old inside edge to grass. The new curve retains six-unit asphalt width and
pale borders; sampled segment clearances include the full mapped tree crowns.
This supersedes the old fork in the annexe road snapshot.

## Annexe outer loop and frontage revision — 24 September 2026

The [red/yellow/blue reference](annexe-outer-loop-marked.png) straightens the
outer access road between the existing frontage corner and the saved northern
Parsons endpoint. The complete annexe plan is reduced to 85% of its previous
size and placed at site (375, -3), with plan scale 0.612. Heights and all local
ward geometry are retained. The Larkton approach reconnects to the straight
road; the old outer detour returns to grass. This supersedes earlier notes
requiring that historic road trace and annexe root to remain fixed.

The [later frontage annotation](annexe-frontage-junction-marked.png) then moves
the frontage avenue nine scene metres toward the annexe, from green to orange.
The entrance has two true quarter-circle edges, about 13.5 metres in radius,
with a straight narrow neck. The gravel route moves twelve metres along the
court to yellow and meets the relocated triangle. Its court end extends to
the actual asphalt edge. The complete original triangular junction moves to
the blue area with its size, angles and curved arms retained. The former
purple triangle and the pink northern approach are removed. Small avenue
trees follow the moved road; mapped mature tree trunks stay fixed.

The immutable annexe shape digest still matches all 21,176 detail primitives.
Historical snapshots containing absolute placement, world-fixed legacy
drives or roadside trees were refreshed only after that comparison. Their
range dimensions and independently checked detail geometry are retained.
The older entrance snapshot's rigid-sweep requirement is superseded by the
explicit circular-edge request; current surface, radius and walking checks
protect the new entrance. Browser sources and aerial assets are updated;
Unity and Blender exports are unchanged.

## Parallel annexe frontage — 24 September 2026

The [latest red frontage annotation](annexe-parallel-frontage-marked.png)
turns the long frontage carriageway onto the annexe's local frontage axis.
It moves six scene metres, one full road width, toward the building at the
central doorway axis. More than 70% of the complete frontage trace is now
exactly straight and parallel; short end links retain the fixed teardrop and
outer-loop connections. This supersedes the previous orange-line angle.

The triangular junction receives the same rigid turn and inward move, keeping
its size, angles, curved arms and grass centre. The five small avenue trees
retain their offsets from the carriageway. The entrance keeps its circular
edges and shortened connection, while the gravel keeps its alignment and
extends to the moved triangular arm. Buildings, the remaining two small trees,
and mature trees stay fixed. The earlier road layout is recorded in
annexe-parallel-before.json for independent angle, offset and shape checks.
The annexe's immutable local shape digest remains unchanged.

Browser model sources and compiled aerial assets change; Unity and Blender
exports do not. Final validation is recorded in DEVELOPMENT.md.


## Irby tree-gap road, outer triangle and gravel diagonal — 24 September 2026

The latest [red/blue/yellow screenshot](irby-tree-junction-marked.png) adds a
six-unit approach from the Irby/Ashley side court through the existing oak and
beech gap to the outer road. The closest mapped trunk is 5.52 units from the
centreline, leaving the 3.6-unit half-width including kerb clear. Mature trees
retain their recorded positions; canopy overhang is intentional.

The triangle moves to the outer-road side of the frontage avenue. Its near
arm uses the existing diagonal connection, its far arm follows the straight
outer road, and the avenue extends on its unchanged axis to meet it. The former
upward loop returns to grass. This supersedes the older triangle-position and
rigid-proportion constraints. The yellow gravel path keeps its 2.4-unit width
and skews across the lawn from the service court to the frontage. Buildings,
other approaches, the annexe entrance and saved Modern lane vertices are fixed.

Ground-plane fitting and before/after views are recorded in
`Browser/artifacts/irby-junction-*`. The revised checks cover continuous
asphalt, all triangle sides and its grass centre, removed surfaces, full-width
building clearance, fixed-tree trunk clearance and both gravel endpoints.


## Rounded Irby junction edges — 24 September 2026

The [red curve and three red crosses](irby-junction-rounding-marked.png) soften
only the lawn-side bend and the triangular island corners. A cubic verge joins
the existing avenue and tree-gap approach tangentially, with a parallel pale
border. Local resurfacing covers the old angular kerbs. The island retains its
straight sides with 1.3-unit circular corner radii and a closed 0.6-unit kerb.
Buildings, trees, gravel, road centreline connections and the outer road remain
fixed. The browser uses the same ground materials and layers as its existing
teardrop island. Preview and validation files use the irby-rounding prefix.

## Annexe entrance kerbs and obstructing tree — 24 September 2026

The [yellow/red screenshot](annexe-entrance-overlaps-marked.png) removes the two
straight-border slivers beside the curved entrance and roadside tree 4 from
the carriageway. This supersedes the earlier requirement to retain all seven
small roadside trees. The other six keep their positions and exact crowns.

The avenue border is cut only across the building-facing entrance mouth.
The circular asphalt edges end on the avenue asphalt edge; the curved kerbs
sit toward the lawn and meet the straight 0.6-metre border tangentially. The
opposite verge, entrance radius, narrow neck and forecourt remain in place.
The removed trunk contributes no walking obstacle and its five crown instances
are omitted. Random draws and original crown rotations are preserved.

Browser sources and the generated aerial model change; Unity and Blender
exports remain unchanged. Validation is recorded in DEVELOPMENT.md.


## Parsons far-end curve and side-road nub — 24 September 2026

The [red curve and yellow circle](parsons-end-bend-marked.png) replace the
historic far-end elbow with an eleven-unit centreline radius, retaining the
six-unit carriageway and 0.6-unit borders. Both ends meet the existing straight
roads tangentially. The fixed second lamppost and former pointed corner sit
on grass. The saved northern lane endpoint is a separate Modern tail, visible
from 2010; its original coordinates remain intact. Historic/Modern toggles and
the timeline both control that tail, including compiled scenes.

The Larkton approach now begins at its actual intersection with the outer
road. Trimming the initial overshoot removes the round nub beyond the far kerb
without moving the remaining approach or courtyard. This supersedes the old
requirement to pave all the way to the saved northern endpoint in Historic.
Implementation is in parsons-north-bend.mjs and annexe-access.mjs.

## Annexe and frontage toward 1829 — 24 September 2026

The [red-line reference](annexe-inward-marked.png) moves the frontage and complete
annexe ten scene metres toward the 1829 buildings, perpendicular to the accepted
frontage. The shared displacement is (-6.9372974603, -7.2023540560) in world X/Z.
The entrance apron, quarter-circle sweep and frontage trees retain their offsets.
The two trees beside the fixed outer boundary retain their positions. Short
curves reconnect the straight avenue to the fixed teardrop and outer triangle;
the gravel path meets the new avenue and the rounded junction edge follows it.

The blue-circled east connecting section fits without shortening. All 21,647
local annexe primitives retain the approved geometry fingerprint. The far-left
Larkton entrance room overlaps the outer road, explicitly deferred by the owner.
The clearance checks allow only that bounded overlap (world X 434–445, Z -86–-77
on the Northern Parsons connection); all other road/building checks stay active.
This supersedes prior fixed-annexe placement requirements. Baseline coordinates
are retained in annexe-inward-before.json. Browser source and compiled aerial
assets change; Unity and Blender exports are unchanged.

## Main/admin teardrop outer sweeps — 24 September 2026

The [red road edges and blue paving annotation](admin-teardrop-sweeps-marked.png)
replace the two bumpy outer joins with continuous cubic verges tangent to the
existing approach roads. Local asphalt fills cover the former internal kerbs;
the exterior pale borders retain their 0.6-unit width. The central teardrop
lawn, its position and its inner kerb retain every approved vertex.

The building-side asphalt now reaches the east pavilion, stepped shoulder and
low rear link, including the small wedge at the service-court connection.
Building geometry, trees, road centrelines and the semicircular forecourt stay
fixed. The red lines are approximate edge guides, not a surveyed alignment.
This supersedes the previous exposed grass strip and angular outer junctions.

Implementation is in Browser/dist/admin-teardrop-paving.mjs. The dedicated
Browser/test-admin-teardrop.mjs verifies the preserved island fingerprint and
position, asphalt/kerb/lawn samples along both sweeps, and paving immediately
beside each wall step. Existing road tests continue to check full-width building
clearance. Previews and validation logs use Browser/artifacts/admin-sweep-*.
Browser sources and compiled aerial assets change; Unity and Blender exports
are not regenerated.


## Enlarged annexe grass triangle and straight frontage — 24 September 2026

The [red island outline](annexe-enlarged-island-marked.png) first enlarged the
small triangular lawn. The [later red/yellow/blue/purple correction](annexe-straight-frontage-marked.png)
then restores one straight frontage axis all the way to the outer road,
removing the angle change at the blue mark. It supersedes the intermediate
189.8-square-metre island and angled lower road arm.

The purple arm is now a separate six-metre curved road with normal 0.6-metre
borders. Removing the broad resurfacing beside it restores grass around
Beech2. Both the carriageway and kerbs clear a 1.8-metre circle around the
fixed tree base, including its low root buttresses. The closest fork verge
is about 2.75 metres from the tree centre; its approach remains clear too.

The final grass island is about 73 square scene metres, still substantially
larger than the former small island. Three rounded tips join its straight
frontage/outer-road edges and curved fork edge. The frontage entrance again
meets the straight road with its original circular kerbs. Buildings, planting
and the gravel link are retained. Browser source and compiled aerial assets
change; Unity and Blender exports do not. Evidence uses annexe-island.


## Outer Parsons road at the first lamp — 24 September 2026

The [red road, yellow lamp and purple junction reference](parsons-lamp-alignment-marked.png)
turns the long outer road about its saved northern endpoint by approximately
0.58 degrees. Its outer 0.6-metre kerb touches the square base of Surviving
Lamp Post #1; both mapped lamps retain their coordinates. The northern bend,
Larkton mouth and triangular junction reconnect to the new straight. The
annexe frontage, buildings and planting retain their positions.

The former outer-road anchor remains the independent input for the accepted
annexe frontage alignment. This prevents the boundary-road adjustment from
moving the avenue or entrance. The triangle expands slightly, and the fork
still clears the fixed beech roots. This supersedes the former outer-road
angle and the old grass sample at (350.4, -90.5), now within the moved road.

Junction asphalt, island lawn and inner kerbs have distinct drawing-depth
biases, so buried road borders do not compete with the resurfaced junctions
at aerial viewing distances. This applies to the northern bend and the fork
marked purple. Browser sources and generated aerial assets change; Unity and
Blender exports are not regenerated. Preview evidence uses lamp-road.

## Short fork angle and blue gravel guide — 24 September 2026

The [red/yellow/blue annotation](fork-angle-gravel-marked.png) pivots the short
road arm beside the triangular lawn toward the yellow line. Its frontage join
moves from world X 314 to 322.4 on the fixed avenue axis, while the outer-road
apex remains fixed. The cubic control nearest the frontage follows the new
angle. The island and its three rounded corners regenerate from those edges;
the lawn retains about 80 square scene units and the fixed beech root base
remains clear.

The gravel link follows the blue direction with a world Z/X slope of 0.07,
pivoting about its existing service-court endpoint and intersecting the fixed
frontage avenue. Its 2.4-unit width and open asphalt connections are retained.
This supersedes the earlier yellow gravel diagonal and short fork alignment.
Buildings, trees, the entrance sweep and long outer/frontage roads stay fixed.
Browser source and compiled aerial assets change; Unity and Blender exports
are not regenerated. Registered before/after views use the fork-angle prefix
in Browser/artifacts. The screenshot fit is approximate, with ground landmark
residuals under one pixel; elevated objects are not registration constraints.

## Annexe rear roads and Oakmere paving — 24 September 2026

The owner's [blue routes and yellow paving mark](annexe-rear-network-marked.png)
restore four connected rear-annexe approaches: the curved outer link, the short
Leighton/Newton spur, the long side road and its second through-road connection.
The yellow Oakmere court is paved to the actual long wall, projecting bays and
service-head recesses. This supersedes the earlier instruction to leave these
specific rear areas as grass; other removed approaches remain absent.

The new carriageways are six scene metres wide with the existing 0.6-metre pale
edges. The merged asphalt outline has no internal road overlaps. It is clipped
to the existing carriageways and junction aprons, and to the exact wall outlines.
The pale border follows exposed lawn edges only, leaving both road mouths and
the building edges open. Buildings and tree locations are unchanged.

All new asphalt and borders follow the Annexe section, appearing at **1915,
1916 and 1938 only**. The stored input includes the screenshot fit, four traces,
wall outlines and existing road boundaries. It records a visual interpretation
of the owner's sketch, not new historical survey evidence.

`Browser/build-annexe-rear-roads.py` (Python with Shapely 2) regenerates the merged
browser polygons from `annexe-rear-network-input.json`. Runtime rendering has no
new dependency. After any relevant building or adjacent-road edit, refresh the
input outlines before regenerating; the input records the approved geometry at
this revision. Browser source and compiled aerial assets are updated; Unity
and Blender exports are unchanged.

## Western Parsons junctions — 24 September 2026

The owner's west-parsons-marked.png identifies the Northern estate boundary
connection to Parsons Lane and North west ward approach to Parsons Lane
(Upton Lea). The saved shared lanes and historic centrelines remain fixed.
Local merged asphalt bridges the clipped road ends; continuous 0.6-metre borders
follow the exposed edges with rounded corners. Both joins and borders follow
The Main, matching the adjoining historic roads, so they disappear together.

Browser/build-west-parsons-junctions.py regenerates the outlines using Shapely 2
from west-parsons-input.json, which records the four existing road centrelines
and the nearest lane connection points. Refresh that input after moving these
roads. Browser sources and compiled aerial models change; Unity and Blender
exports remain unchanged.

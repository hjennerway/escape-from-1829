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

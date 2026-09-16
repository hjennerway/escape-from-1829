# Historic road layout — 16 September 2026

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

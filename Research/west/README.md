# West wing refinement

The five photographs and `locations.png` were supplied on 17 September 2026.
They are architectural evidence; the user's request and colour mapping define
the task. In the locator, red = img1, yellow = img2, blue = img3, purple = img4,
and pink = img5. These refer to the outer western cross range and its garden
and court, rather than just the rearward arm named `west-wing-photo-detail`.

| Reference | Camera direction | Model evidence |
| --- | --- | --- |
| img1 / red | Garden looking east toward the forward range | Paired upper sashes, three broad low windows before the blue door and one beyond it, sloping lean-to roof, two chimney stacks and a short railed approach |
| img2 / yellow | Garden looking toward the south face | Three-storey canted bay with one flat central face, broad flanking windows with sidelights, upper paired sashes, external return stair and glazed garden entrance |
| img3 / blue | West end looking east | Level cornice and continuous hip, white ground storey, shallow central pier, two narrow upper windows on the left, central paired upper sashes, broad middle window, central glazed doorway and blank brick on the right |
| img4 / purple | Court looking south | Canted bay, single sash and paired windows to its left, paired recess windows to its right, lower projecting bay and blank upper outer corner |
| img5 / pink | Court looking south-west obliquely | Confirms those projections and the recessed link with its glazed lean-to |

Dimensions and camera registration are estimates. The principal footprint and
the established entrance and rear wings remain the reference. The outer end
is raised to a consistent 15.2-unit cornice; the garden bay moves along its
facade to x=-50.8. Both former octagonal bays now have three exposed faces and
roof/band geometry generated from the same outline. Their canted footprints
also supply walking collision polygons.

`Browser/dist/west-front-photo-detail.mjs`, `west-court-photo-detail.mjs` and
`west-refinement.mjs` contain the refinements. The shared exterior builds these
in aerial, Explore and gameplay, in both layouts. The garden tree moves to the
end of the lean-to, retains Trees-layer membership and follows tree visibility
for shadows and collisions. The lawn, gravel and simple hedges retain the
established period treatment; current vehicles, signs, refuse containers and
the parking barrier are not part of this architectural reconstruction.

Choose **1829: West wing Â· Photo 1** through **Photo 5** in Locations, or use
`aerial.html?view=west-1` through `west-5`; Explore has the same five presets.
`aerial.html?view=west-refinement` gives the aerial overview. These references
supersede the earlier repeated west end windows and two-facet bay fronts.
Blender and Unity exports are unchanged.

Validation includes `node Browser/test-west-refinement.mjs`, the existing
exterior and tree-toggle checks, and the full browser suite. The inspection
script `Browser/artifacts/inspect-west-refinement.mjs` captures all five photo
directions and an aerial view; before/after images use the `west-` prefix.

The local compiled model was rebuilt and its source fingerprint verified.
Compiled/source image comparison, the west geometry checks, the live aerial
and Explore pages, and building selection checks pass. Of 49 browser-suite
checks, 46 pass. The remaining failures are outside this refinement:

- `test-annexe-photo-placement.mjs`: the existing saved-road snapshot differs.
- `test-historic-roads.mjs`: the existing Main/Admin north service-road clearance.
- `test-farndon.mjs`: its hidden-ward collision sample at (190, -160.6) is now
  occupied by the independently imported Oak14. Hiding Trees removes this
  collision; no west-wing geometry reaches this area.

The suite was continued after its first failure. Logs are `west-suite.txt`,
`west-suite-remaining.txt`, `west-building-photos.txt`, `west-build.txt` and
`west-compiled.txt` under `Browser/artifacts/`. The location-catalog check was
rerun successfully after registering the six new menu entries. The available
Node npm CLI was invoked directly because the shell's npm shim resolves to a
missing per-user installation.

## Court wall and lean-to correction

The subsequent `court-wall-alignment.png` marks the paired-window court face
in yellow, the fixed corner face in red, the former lean-to edge in blue and
its new extent in green. The yellow masonry now meets the red plane at z=-1,
5.5 units behind its former position along the building's front/rear axis.
Its windows, door, bands, pipes and roof follow the wall; the opposite garden
face stays at z=19.5. The attached canted bay follows the court elevation,
with a solid roofed return to the retained outer recess. The old corner side
windows and covered low roof/cornice are removed.

The lean-to retains its connection at the red wall and extends to z=-4.5,
giving a 3.5-unit projection from that fixed datum. Its brick sides follow
the glazed roof slope, and the lowered doorway fits below the front eaves.
Dimensions of the green guide are visual estimates; the red/yellow wall
alignment is exact. Rendered geometry also supplies the updated collisions.

`test-west-refinement.mjs` checks matching wall planes, the fixed garden face,
exposed red-face glazing, roof coverage, lean-to attachment and solid collision
throughout its new depth. `inspect-west-alignment.mjs` records the same corner
and overhead views before and after the correction. Browser sources are
updated; Unity and Blender exports remain unchanged.

After this correction, visual checks, the rebuilt compiled/source comparison,
alignment/collision checks and the remaining browser checks pass. The current
suite run passes 48 of 49 checks; its only failure is the unrelated unmarked
annexe-road grounds assertion at (75, 121) in `test-historic-roads.mjs`. The
earlier Farndon and saved-road failures above no longer occur in the current
shared working tree. Logs for this revision use the `west-alignment-` prefix.

## Lean-to side gap and door

`lean-to-side-door.png` moves the lean-to right in the supplied view between
the two red guides, leaving a small gap beside the yellow-marked rear arm.
The complete structure moves 1.8 units along the court wall to x=-41.4, with
its sides at x=-43.8 and x=-39. Its width, depth, roof slope and attachment to
the aligned rear wall are retained. The gap to the neighbouring arm is about
1.9 units before roof overhang and window trim.

The door, transom and pale surround rotate onto the green-marked west side,
facing along the court toward the bay. The former front doorway is plain
brick. The existing alignment test now checks both side positions, open sky
and walking access through the gap, the exposed side door, its clear approach
and removal of the front entrance. The `lean-to-shift` inspection images show
the updated corner and plan. This changes the shared browser model; Blender
and Unity exports are unchanged.

The latest lean-to revision passes all 49 checks in `npm test`, including the
updated gap, door and collision assertions. Earlier unrelated failures listed
above no longer occur in this shared working tree. Validation logs for this
revision use the `west-lean-to-` prefix in `Browser/artifacts/`.
The local compiled model is rebuilt and current; compiled/source rendering,
controls and model-fallback checks also pass.

## West entrance landscape cleanup — 24 September 2026

The latest user annotation removes the two low hedges beside the outer west
entrance and the pair of short garden entrance railings beside the canted bay.
The west doorway path retains its width and axis at z=11.5 and extends straight
out to Parsons Lane, from x=-72.2 to -97.5. Its outer tip lies below the higher
road surface so the angled road edge provides a clean join. The existing trees
and fire escapes are retained. Removed hedges no longer create walking obstacles;
the extended path centreline is clear. Shared browser sources changed, with no
Unity or Blender regeneration.

## West apron planters and garden return (24 September 2026)

The latest red/blue annotation supersedes the earlier instruction to retain
these planting beds. Remove the three stone-edged beds at (-72,-23),
(-72,-10), and (-72,29), plus the long soil/shrub border at (-70,-11).
The other planting remains. Removed tree calls retain their random draws.

Extend matching entrance paving along the outer garden edge, z=42.5 to 45,
from the west apron at x=-72.5 to the existing stair-side walk at x=-47.
The path follows the lawn edge and joins both ends without altering masonry.
These are shared browser-builder changes; Unity and Blender are unchanged.

West geometry, exterior and walking checks pass. Source and compiled garden
views were inspected, and the rebuilt model passes source/compiled and full
detail checks. The full suite stops at the Jarman whole-estate preservation
snapshot, which includes changed landscaping; its baseline was not rebased.
Artifacts use the `west-planters-` prefix under `Browser/artifacts/`.

Timeline browser checks also pass, using separate screenshot output paths.

## Continuous outer path and gravel (25 September 2026)

The user's `path-gravel-annotation.png` requests a straight outer path following
its red line and a single gravel colour across the two blue-circled surfaces.
The court, west apron and garden return are now one surface in
`Browser/dist/entrance-walks.mjs`, using the existing entrance gravel material
(0xa39e88). Its outer edge is x=-73.5 from the Parsons Lane join at z=-38 to
the existing garden return at z=45. The narrow road link retains the adjacent
grass verge, and its tip lies beneath the higher road surface. Coordinates
are visual estimates from the annotation.

Removed the overlapping court slab and two apron slabs. The western doorway
approach and narrow garden-side walk use the same gravel colour. The garden
lawn and building geometry are retained. These changes affect the shared
browser source and local compiled model; Unity and Blender exports are unchanged.

The new route passes the existing player-width surface and walking-clearance
check in `Browser/test-modern-entrance.mjs`, including the approach beside the
retained stone doorway threshold. Source and rebuilt compiled previews match;
full-detail, fallback and timeline browser checks pass. Validation evidence
uses `Browser/artifacts/west-path-`.

The full suite's Jarman and Leighton/Newton whole-estate snapshots differ after
landscaping changes; their baselines were not refreshed for this edit. All other
suite checks pass when continued after the first snapshot failure.

## Rearward wing side semi-basement (27 September 2026)

The owner's [marked view](side-basement-annotation.png) places descending stairs
at the glazed rear end of the west wing. The red line identifies a sunken passage
along its outer wall, ending at a door, with a low retaining wall on the right
when entering from the stairs. This is the rearward arm at x=-37, rather than
the outer western cross range described by the earlier five photographs.

Browser/dist/west-side-basement.mjs adds five stone treads from z=-35.7 toward
the recessed corner at z=-1. The floor matches the front semi-basement level
(y=-0.615), below the courtyard at y=0.28. The brick retaining wall has stone
coping 0.32 units above the courtyard. It meets the existing lean-to, whose
flank forms the final side of the passage. A blue, pale-framed door ends the
route at the lowered floor. Coordinates and unseen door detail are estimates
from the annotation, using the building's existing materials.

The terrain, underlying access surface, broad rear approach and court paving
all clear the excavation. Foundations continue down beneath the existing
gallery cladding and window walls. The passage and stairs supply walking
heights, and the retaining wall and closed door supply collisions. Hiding both
estate layouts restores continuous lawn over the excavation. The existing
front stairs, windows and lean-to entrance retain their positions.

Shared browser sources and the locally generated aerial model are updated;
Blender and Unity exports are unchanged. Browser/test-west-side-basement.mjs
checks the exposed stairs and entire lower route, door threshold, low wall,
walking in both directions and layout visibility. Preview and validation
evidence uses Browser/artifacts/west-basement-*.

### Superseding direction, doorway and ground corrections

The subsequent side-basement-direction-correction.png places the blue door on
the gallery side at the blue X, with stairs descending across the passage from
the lawn towards +X. There is no door at the lean-to end. Six stone treads now
run from x=-42 to -39.6 at z=-34.7, with a lower landing outside the gallery door.
The continuous passage turns from this landing and ends at the existing blank
wall. The upper red-circled junction is closed with brickwork shaped beneath
the two existing roofs and a narrow slate seam between their edges.

The final side-basement-ground-brick-correction.png matches the foundation and
retaining masonry to the darker gallery brick colour (0xc5a38d), with the main
arm foundations using their own adjoining wall colour. The entire courtyard
is lowered to y=-0.145, only 0.005 above the existing lawn, removing the former
0.43-unit step at z=-26. A four-unit transition outside the courtyard connects
to the retained southern apron. The stair entrance uses the same lower grade;
the coping remains 0.32 above that grade. The lower floor follows the current
front semi-basement, now y=-1.02 after its independent deepening. The old
underlying access slab is cut out beneath the courtyard and stair approach.
These latest positions and levels supersede the first description above.

## Front garden E-shaped plan (27 September 2026)

The owner's [red outline](front-e-shape-marked.png) identifies the front west
garden, left of Reception. The [aerial reference](front-e-shape-aerial.png)
shows a broad outer arm, shorter middle canted bay and long inner forward arm.
This supersedes the earlier flush-front interpretation for the outer pavilion.
The initially mistaken rear/east-court edit was fully undone before this work.

The retained cross-range garden wall is z=19.5. The outer pavilion retains
x=-72..-59 and its rear connection at z=15.5, extending to z=29.5. The middle
arm retains its 6.2-unit width and x=-50.8 centre; a short rectangular stem
reaches z=23, followed by the original canted profile ending at z=25.8.
These depths are visual estimates from the supplied outline, not surveyed
measurements. The long forward wing and its glazed lean-to retain their geometry.

The outer arm has a hipped slate roof, and the middle branch roof joins the
cross-range ridge. The pavilion's six front windows and bands follow its new
front wall. The existing fire escape and doors turn onto its inner return,
within the recess between the outer and middle arms. Other front windows,
rear details, garden paths and landscaping retain their positions.

Browser sources and the local compiled aerial model are updated; Unity and
Blender exports are unchanged. Validation and views use the
Browser/artifacts/west-front-e-* prefix.

### Superseding front-depth alignment

The follow-up [four-colour annotation](front-e-alignment-marked.png) pulls the
red ground edge of the canted bay back to the yellow guide, and the blue ground
edge of the broad outer arm back to the purple guide. The outer front is now
z=26.5 (three units back); the bay root is z=21 and front z=23.8 (two units back).
These depths supersede those in the first E interpretation above. Widths,
heights, window counts, stair alignment and the long forward range are retained.
The roof and wall depths follow the revised ends, and walking collisions clear
the vacated strips of lawn.

### Superseding face-width proportions

The paired front-e-width-model-marked.png and front-e-width-photo-marked.png
identify the outer front face (yellow), left recessed face (purple), canted bay
(blue) and right recessed face (green). Comparing the photograph by storey
height shows that the outer face was too broad. Its fixed outside wall remains
x=-72, while its inner return moves from x=-59 to -64: an eight-unit front.
The two front sash columns now sit closer together with narrower frames.

The bay retains its 6.2-unit canted profile and moves to x=-52.5, leaving
8.4-unit recessed faces on both sides. Their glazing and garden doorway are
centred again; the iron stair, landing doors, trim and pipes follow their walls.
A closed brick and slate infill joins the widened left recess to the retained
cross range. The agreed front ends (26.5 and 23.8), wall heights, western end,
rear court, and long forward wing are retained. These estimated face widths
supersede the previous fixed-width description above.

The blue bay's flat central face is also narrowed from 3.1 to 2.3 units,
retaining the 6.2-unit overall root and all nine sashes. Its angled faces,
stone bands, roof and collision outline follow that revised profile. The
opposite east bay retains its original proportions. The new recessed roof
uses a low hip to avoid a prominent extra peak above the paired windows.

## Courtyard terrain flicker (28 September 2026)

The owner's [red circle](courtyard-flicker-marked.png) identifies the west
courtyard and adjoining rear wing. The lowered gravel was only 0.005 units
above the continuous terrain; distant camera views showed grass stripes
through it as the depth buffer could no longer separate the two surfaces.

The terrain cut now follows the court, narrow Parsons link, southern apron
transition, stair approach and existing basement in one continuous outline.
It retains the unpaved lawn north of the court and leaves paving heights,
stairs, walls and walking routes unchanged. A matching lawn patch restores
the later court's footprint before 1849; hiding both layouts restores the
entire cut to lawn. Browser source and the local compiled aerial model are
updated; Blender and Unity exports are unchanged.

The requested wider audit samples upward ground triangles within 0.025 units
of the terrain across Historic, Modern, combined and hidden layouts and
representative timeline years. No other paving conflicts were found. The
separate distant meadow joins the terrain at the same level; its intentionally
overlaid material now has depth bias to stabilise that join without lifting
the ground. Evidence uses Browser/artifacts/west-court-flicker-* and
Browser/artifacts/terrain-overlap-audit.json.

Final checks include every one of the 13 timeline years. Source and compiled
visuals, surface probes, the full compiled suite and the west-side regression
pass. The local compiled model matches the current browser source. The full
browser suite's two pre-existing whole-estate snapshot failures reproduce
with the original courtyard geometry as well; their baselines are unchanged.

## Basement sill-strip flicker (2 October 2026)

The owner's [marked view](basement-windows-flicker-marked.png) shows a flickering
strip beneath the west rear wing's lower sashes. The automatic ground-contact
edge of `West rear approach beside basement` occupied the same wall plane as
the brick facade, from y=-0.17 to 0.23. The paving's hidden boundary now sits
0.2 units inside the masonry at each step of the side wall, so the generated
face is occluded. The visible passage, retaining wall, steps, door and exterior
windows retain their positions.

The same request establishes six interior windows per corridor side, grouped
2, 2, 1, 1 from rear to front; see the updated 1829-interior-proposal notes.
The focused exterior check now samples 120 wall positions across four period
transitions and rejects coincident gravel faces. Browser source and the local
compiled exterior were updated; Unity, Blender and packaged exports were not
regenerated. Before/after views and validation use Browser/artifacts/basement-windows/.

## Gallery lower brick return (2 October 2026)

The owner's yellow-circled screenshot identifies the short lower return where
the glazed gallery meets the west wing, beside the first basement sash. The
separate foundation strips left this corner open, exposing pale backing and
a gravel contact face coincident with the gallery end at z=-30.5.

A matching gallery-brick return now spans x=-37.85..-37.39 and
z=-30.62..-30.5, from below the passage floor to y=0.3. It replaces the last
0.12 of the side foundation; the cream backing begins at its top. The paving
boundary's hidden crosswise step moves to z=-30.7, inside the masonry. The
cream gallery framing above, sash, door and passage retain their positions.
Dimensions close the existing model join rather than establishing new survey
measurements. Browser source and the local compiled aerial model are updated;
Unity, Blender and packaged applications are not regenerated. Before/after
and compiled comparison views are in Browser/artifacts/gallery-brick/.

Reference: [owner's yellow-circled view](gallery-lower-return-marked.png).
The full browser suite, rebuilt compiled/source comparison, timeline checks
and focused wall/walking checks pass; see the development notes for evidence.

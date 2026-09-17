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

Choose **1829: West wing · Photo 1** through **Photo 5** in Locations, or use
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

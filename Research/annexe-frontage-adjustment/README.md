# Annexe frontage adjustment

After reviewing the rear aerial fit, the user requested a slightly larger
annexe closer to the long red frontage line in
`../annexe-placement/front-roads-annotated.png`. The accepted placement uses
horizontal scale 0.72 and root (378, -34): 12.5% larger in width and depth than
the first aerial fit. The approved ward shapes, central frontage details and
building heights are retained. The projecting wards limit the remaining
setback from the avenue; the annexe stays inside the Parsons loop and clear
of the teardrop and Main/admin.

`remove-rear-roads.png` authorizes removal of the four rear access routes,
their two Parsons Lane junction mouths, kerbs and rear hardstanding. Their
former definitions are preserved in `rear-access-before.mjs.txt`. The
surrounding shared Parsons Lane remains intact.

The user accepted this placement and then supplied `narrow-entrance.png`.
Its red outline protects the central asphalt apron; its yellow outline
narrows only the sweeping connection. The revised entrance has a straight
neck about 16% of the apron width and a smooth flare to a mouth about 98%
of the apron width. The curves join the existing oblique avenue. The apron
and step approach retain their exact world coordinates and surface, checked
against `protected-forecourt.json`. Exposed apron kerbs extend to the narrower
opening. No building or named road is moved by this entrance edit.

The annexe access checks pass, including an unbroken walking route, protected
teardrop geometry, road clearance and removal of the rear access group.
Browser plan, access and entrance views render without page errors. The
older photo-placement road snapshot currently differs from Vivienne Smith
Lane and its connected historic route outside this entrance edit; it has
not been overwritten to hide that mismatch. The earlier general Historic
roads test also reported an Admin north service road overlap outside the
annexe work.

The September 17 test maintenance supersedes that snapshot-failure note:
`test-annexe-photo-placement.mjs` now protects the named annexe loop, avenue,
teardrop and Parsons routes and checks removal of all four rear roads. It no
longer freezes unrelated roads merely because one vertex is east of x=240.
The archived reference is unchanged. The separate service-road overlap is
corrected in the [Historic road notes](../historic-roads/README.md).

Open `aerial.html?view=annexe-access` for the layout or
`aerial.html?view=annexe-entrance` for a closer view. This changes the browser
model; Blender and Unity exports are unchanged.

## September 21 annexe scale and centring

The later annotated aerial requests the annexe at 90% of its preceding size,
without changing its shape, and centres its front on the paved approach. The
building now receives a uniform 0.9 scale on all three axes. Its transform is
translated about the centre of the entrance facade, so that facade centre
retains the exact world point on the established forecourt centreline. The
asphalt forecourt, sweeping entrance, frontage avenue, teardrop and all other
site geometry remain fixed. Browser sources only are changed; Blender and
Unity exports remain unchanged.

![Narrow entrance and preserved forecourt](annexe-access.png)

## September 24: equal grass strips beside the annexe forecourt

The supplied `equal-grass-reference.png` and the user's clarification require
an equal amount of green on either side of the paved apron. This supersedes
the September 21 doorway-centred placement above: the two projecting court
wings are asymmetric, with inward masonry faces at map x=-27 and x=20.

The whole annexe moves sideways by 3.676 scene units, placing the midpoint
between those faces (map x=-3.5) on the fixed apron centreline. Both grass
strips now measure 5.309 scene units from paving edge to masonry. The uniform
90% size, all local building geometry and the frontage setback are retained.
The central doorway is consequently slightly off the paving centreline; equal
side grass widths are the user's clarified alignment criterion.

The original apron and entrance-step approach match `protected-forecourt.json`
exactly. Roads and other buildings remain fixed. Annexe cameras, masonry
collisions and the rear kitchen follow its placement. Browser sources and the
compiled aerial model are updated; Unity and Blender exports are unchanged.

Validation: the full browser suite, source/compiled comparison and browser
timeline checks pass. Source and compiled front and overhead views were
captured under `Browser/artifacts/annexe-centre-*`; visual inspection confirms
the balanced grass strips. Existing local geometry snapshots remain unchanged.

## September 24: paving meets the recessed frontage

The later `front-paving-gaps.png` marks the grass strips directly against the
front walls. Matching asphalt now fills the gap between the original apron
and the stepped frontage: both pavilion faces, the lower entrance range and
the narrow recessed strips beside it. The added polygon follows those ranges
in their current placed coordinates, with a small overlap beneath masonry to
avoid visible seams. The old transverse kerb is removed from the join; the
exposed side kerbs extend to the pavilion faces.

The original apron and step-approach polygons remain in place. The building,
its equal grass strips beside the apron, and the sweeping entrance are unchanged.
`test-annexe-access.mjs` samples the paved surface from the actual wall faces
back to the apron, and checks retained side grass and Historic visibility.
Browser sources and the generated aerial model change; Unity and Blender
exports are unchanged.

Validation: the dedicated access and equal-grass checks pass, as do the rebuilt
source/compiled comparison and timeline tests. Close views are saved under
`Browser/artifacts/annexe-paving-*`. The full suite stops at an unrelated rear
ward's old zero-position assertion in `test-annexe-wards.mjs:18`.
All remaining browser checks were also run separately and pass.

## September 24: restore the right entrance corridor

The later `front-link-reference.png` requests a reflected copy of the short
left-hand corridor in the red-marked gap, with both yellow-circled right-hand
blocks moved outward. This supersedes the earlier direct junction between the
east courtyard wing and central pavilion.

`annexe-front-links.mjs` reflects the complete west entrance-link assembly,
including its two-storey brickwork, slate roof, windows, gutters and chimney.
Picton/Carden and the shared east outer ward assembly each translate seven
source-map units (7.351 scene metres) to the right. All 13 existing ranges retain
their geometry, heights, window spacing and relative positions. The corridor
joins the pavilion at x=20 and overlaps the courtyard wall at x=27, matching the
west link and its inward courtyard face at x=-27.

The annexe root, central entrance, left wings, forecourt and estate roads stay
fixed. Consequently the right grass strip widens; the earlier equal-grass
requirement is superseded for this correction. Saved views of the moved wards
follow their new position. Construction places these groups before the aerial
batches and walking obstacles are generated, so geometry, shadows and collisions
share the new placement.

`test-annexe-front-link.mjs` compares 21,929 original primitives after undoing
only the two permitted translations. It also checks the reflected link, both
joins, symmetric inward faces, exposed windows, collisions and Historic
visibility. The concurrent Carden photo task owns its new elevation and the two
raised-spine meshes, which are excluded from this corridor preservation check.
The complete initial fingerprint was independently reproduced before narrowing
that scope. Historical snapshots were refreshed only after this preservation
check passed. Browser sources and compiled aerial assets change; Unity and
Blender exports are unchanged.

Validation: all 61 browser checks pass, along with the final corridor/Carden preservation checks, source/compiled rendering comparison and every timeline stop. The compiled source fingerprint is current. Front and overview images under `Browser/artifacts/annexe-front-link-final-compiled-*` were visually reviewed. Timeline validation used its own artifact folder after concurrent runs collided while writing a shared screenshot; the isolated rerun passes.

## September 24: deepen and align the central entrance

The later `entrance-alignment-reference.png` supersedes the fixed apron and
setback requirements above. The yellow-marked low entrance range retains its
rear at map z=10, width and height, while its front advances from z=15 to z=21
to meet the green guide. Its roof, front sashes, portal, pediment and steps
follow the new depth. The hall, pavilions and all other annexe geometry remain
unchanged by this correction.

The purple guides place the paving edges at map x=-10.5 and x=10.5. The apron
and narrow recessed side infill now share the doorway axis. Both grass strips
are 17.327 scene units wide. The sweep and both kerbs translate 3.676 scene
units right along the frontage, with a 0.202-unit adjustment parallel to the
oblique avenue so both lips retain their road connection. Every sweep vertex,
neck/mouth width and curve shape is preserved. The apron meets the translated
neck without a transverse kerb or gap.

`annexe-entrance-alignment-scope.mjs` first compared all original primitives:
112 removed and 208 added primitives were confined to the low entrance range.
Its compact pre-edit fingerprint protects the other 21,719 primitives and the
original sweep/kerb vertices. Broad historical geometry snapshots were updated
only after this independent preservation check passed. The original
`protected-forecourt.json` remains an archived record of the superseded layout.
Construction changes occur before batching and collision extraction; the
normal source and compiled paths therefore share the updated geometry.

Validation: entrance access, road joins, walking clearance, alignment,
source/compiled comparison and all timeline stops pass. The full browser suite
stops at the broad Jarman snapshot; it also fails in an isolated process with
the original entrance depth restored (860,556 primitives against 861,075 in
that snapshot), so this includes an independent workspace mismatch. Every test
after Jarman was run separately and passes. Logs and visually reviewed source
and compiled front/overview/plan images are under
`Browser/artifacts/annexe-entrance-alignment-*`. Browser sources and the compiled
aerial model are updated; Unity and Blender exports are unchanged.

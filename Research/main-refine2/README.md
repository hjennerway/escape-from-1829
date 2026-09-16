# Main/admin annexe end and rear court

## Superseded corner interpretation

The later [paired, colour-marked photographs](../main-refine3/README.md) supersede
the low-wing and roof interpretation recorded below. The pitched room connects
through a recessed link to the existing red court block; no separate square
end room is retained. Both comparison directions now include the Historic
service buildings and court in Explore. The following notes preserve the
earlier interpretation and reference history.


The four images in this directory were supplied on 16 September 2026 from
`main_redfine2`. The photographs are architectural references. Red dots and
arrows on the location images identify the camera positions and directions;
they are not building outlines. The blue-circled foreground structure in
`img2.jpg` is explicitly excluded from this refinement.

`img1.jpg` refines the main/admin end closest to the annexe. The later
`marked-bay-roof-correction.png` supersedes the first reconstruction: the
blue-circled forward canted projection does not exist and is removed, including
its windows, trim, roof and walking collision. Its old forward connection is
also removed. The red-circled roof sections share one slate roof with no flat decks or parapets. The
wall tops support the continuous eaves; the retained wing connects
to the rear shoulder through a recessed link. This leaves the blue footprint
as open ground. The tall pavilion's stepped rear roof, chimney breasts and
stacks remain in place.

The later `marked-three-sided-roof.png` moves the high point from the blue dot
to the stair-bay wall at the red dot. Three sloping planes now run from this
wall junction to the wing eaves. The fourth slope facing the main building and
the separate small connector roof are removed; the shared roof also covers
the recessed connection. The wing footprint stays in place. The eaves are lowered with the wall
junction so the apex sits below the existing stair-window sill, matching the
red mark and keeping that window visible.

`img2.jpg` replaces the inferred rear window grid with a broad hipped projection
and three close upper sashes, a smaller canted stair bay with a pitched roof,
and a flat court block with a brick parapet, two upper windows and a glazed
ground entrance. It also refines the east edge of the tower service buildings:
taller two-storey masonry, high sash windows, sparse ground-floor windows,
a recessed door, segmental brick heads, rainwater goods and a raised end gable.
The established tower roof contacts, dormers and chimney position are retained.

Geometry is in `Browser/dist/main-admin-building.mjs` and
`Browser/dist/tower-buildings.mjs`. The adjacent Historic service-road bend in
`historic-roads.mjs` moves locally around the enlarged square room, rejoining
its existing tower-side route. Its full carriageway and border clear the new
masonry. The historical layer and existing front facade keep their ownership.
Main/admin also appears in the existing walking/exterior scene; tower service
buildings remain specific to the Historic aerial layer. Unity and Blender
exports are unchanged.

The new photographs refine elevations and local projections; they do not
provide surveyed dimensions. Heights, concealed roof junctions and the exact
projection depths are visual estimates registered to the existing OS footprint.
This supersedes the earlier extra low east bay and regular rear window grid. It does not reconstruct the separately blue-circled structure.

Open `aerial.html?view=main-admin-annexe-end` or
`aerial.html?view=main-admin-rear-court` for the photo comparisons. Both presets
are available through Main/admin navigation. The annexe-end preset also works
in `explore.html`; the rear-court walking view contains Main/admin but follows
the existing omission of the aerial-only tower service buildings.

Validation: `npm test` in `Browser`, including
`test-main-admin-refine2.mjs` for the stepped masses, real roof intersections,
full window-pane exposure, walking collisions, marked camera starts and the
excluded blue block. The existing tower and road tests check the retained roof
contacts, dormers, chimney clearance and road widths. Before/after renders are
saved as `Browser/artifacts/admin-refine2-*-before.jpg` and `*-after.jpg`.

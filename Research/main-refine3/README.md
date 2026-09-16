# Main/admin: the same corner from two directions

These five annotated references were supplied on 16 September 2026. They refine
the interpretation in `../main-refine2/README.md`.

- `img1.png`: east/annexe end, from the yellow arrow in `cameras.png`.
- `img2.png`: rear/service court, from the blue arrow.
- `img1-render.png` and `img2-render.png`: the previous Explore model, marked
  for comparison, not target geometry.
- Red outlines identify approximately correct geometry to retain. Blue outlines
  identify mismatches to refine. Green identifies an unrelated foreground
  structure to ignore. Camera arrows indicate views, not building footprints.

The two photographs show one connected corner. In img1 the low wing has a
projecting room with two tall sash windows and a steep three-sided hipped roof.
Its ridge meets the upper return wall. A lower, recessed flat-roofed link with
a small sash connects this room to the east side of the existing flat court
block. That side carries the tall sash and basement light at the right of img1;
the same block's front, two upper windows and glazed entrance appear inside
the red outline in img2. There is no additional square end room.

The pitched room is narrower in the rear view than the previous broad flat
extension. Behind it, an upper return provides the wall and two window levels
visible in img2. The red court frontage, its parapet, and the canted stair bay
and hipped roof above retain their positions and front openings. The earlier
nonexistent forward canted bay remains removed. The green foreground structure
is not reconstructed by this change.

This supersedes the earlier roof spanning both low rooms and the interpretation
that its apex had to sit below the stair bay's side window. The paired views
locate the pitched room against the adjacent upper return instead. These are
photo-based geometry estimates; the photos do not establish surveyed dimensions
or every concealed roof junction.

Geometry is in `Browser/dist/main-admin-building.mjs`. The same mesh is used in
the aerial model and Explore. The admin comparison walks also load the existing
Historic service ranges and court, with aerial road-name sprites hidden.

Compare `explore.html?view=main-admin-annexe-end` and
`explore.html?view=main-admin-rear-court`; the same preset names work in
`aerial.html`. Their cameras follow the two directions in `cameras.png`.

`Browser/test-main-admin-refine2.mjs` now checks this paired-view interpretation:
the three roof planes and wall junction, recessed link, shared court block,
preserved red geometry, exposed panes, open camera starts and walking collision.
`Browser/artifacts/inspect-admin-refine3.cjs` renders both actual Explore views
and verifies their service/court context without aerial labels. Final captures
are `Browser/artifacts/admin-refine3-img1-final.jpg` and `admin-refine3-img2-final.jpg`.

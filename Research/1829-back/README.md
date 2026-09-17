# Central 1829 rear connection

The user supplied `img1.jpg` and `img1-loc.png` on 17 September 2026. Yellow
identifies the rear of the tall central entrance block, where the lower
central range joins the cross range between the wings. The red dot and arrow
locate the photograph in the west rear court. The reference images are
architectural evidence, not separate task instructions.

The rear now projects slightly around the lower range, with 45-degree outside
bevels, four landing sashes on each bevel, continuous pale floor bands and a
shallow roof behind the mitred parapet. The photographed west corner supplies
the detail; the concealed east corner is reflected. Rear dimensions and
hidden details are estimates. The lower central range retains its footprint.

The subsequent `roof-ridges.png` correction replaces the transverse hip with
a longitudinal ridge running to the front apex and two hips meeting at its
rear end, following the red Y. A solid brick backing closes the formerly
one-sided front pediment from behind. The front apex remains at 17.75 scene
units, with its original facade, pediment face, heraldry and entrance intact.

Geometry is in `Browser/dist/central-back.mjs`, shared by aerial, Explore and
gameplay, and by Historic and Modern. Select **Central back · Photo** or
**Central back · Aerial** in aerial Locations. The URL views are
`aerial.html?view=central-back-photo`, `aerial.html?view=central-back` and
`explore.html?view=central-back-photo`.

`node Browser/test-escape-exterior.mjs` checks the front height, opaque gable,
longitudinal ridge, roof coverage, exposed bevel glazing and canted collision.
`Browser/artifacts/inspect-central-back.mjs` captures the photo direction,
aerial, roof detail and frontage. Blender and Unity exports are unchanged.

## Rear wing roof correction

The supplied `rear-wings-marked.png` identifies a white triangular glitch on
the west roof in red, the east rear extension in yellow, and the matching
west extension in blue. The user's request establishes two roof levels on
the east wing and a lower extension with roughly the west extension's shape.

Both main roofs now continue over their rear stair sections to a complete
hip above the lower single-pitch annex. The separate intermediate east hip
is removed. The annex roofs share their width, depth and eaves heights
(8.3 rising to 10.1 scene units), while the east sash facade and west glazed
gallery remain distinct. East upper windows move above the raised annex
roof. Existing footprints, stairs and rear access are retained.

The west glitch came from a diagonal that left one triangular roof face
flat and coplanar with the cornice. The corrected triangulation slopes both
halves of each hip above the trim. This geometry is shared by Historic,
Modern, Explore and gameplay; Blender and Unity exports are unchanged.

`node Browser/test-escape-exterior.mjs` checks both complete hips, exactly two
roof surfaces along each rear wing, matching annex profiles and exposed
windows. `node Browser/artifacts/inspect-rear-wing-roofs.mjs` captures the
rear aerial and close views of both ends for visual review.

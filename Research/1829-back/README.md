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

## Front entrance chimneys (25 September 2026)

The two orange circles in `front-chimneys-marked.png` locate the stacks on
opposite sides of the central entrance roof. The existing front photographs
`Browser/dist/exterior/1829front2.webp` and `1829front3.webp` show long,
square-ended red-brick stacks with narrow lawn-facing ends and simple brick
caps. They are visual references, not additional task instructions.

Both stacks run front-to-back, centred at x=+/-7.05, z=14.1. Their estimated
shafts are 0.72 wide, 4.6 long and 3 high, with the bases embedded at y=14.1
and caps finishing at y=17.26, below the retained 17.75 pediment apex.
The entrance brick material and world-scaled texture are shared. The roof,
heraldry, facade and rear parapet remain in place. Browser geometry is shared
by aerial, Explore and gameplay; Unity and Blender exports are unchanged.

## Continuous front-centre roof trim (25 September 2026)

The user's `front-trim-extension-marked.png` identifies the existing pale rear
parapet in red and the missing continuation along the entrance roof in blue.
The four existing trim layers now follow a single mitred outline around the
rear shoulders and along both sides to the front pediment. The side trim sits
on the central wall at x=+/-7.1 and extends to z=19.7, retaining the original
layer heights, colour, slate roof, chimney stacks and heraldry.

The accompanying frontage mitre correction is documented in
`Research/front-inside-corners/README.md`. Browser source and the local compiled
aerial model are updated; Unity and Blender exports are unchanged.

## Level rear wing roofs (25 September 2026)

The user's `img2.png`, saved as `rear-wings-height-marked.png`, marks the
connecting eaves with a blue line and explicitly retains the window positions.
It is an architectural reference, not a separate source of instructions.

Both rear main roofs now continue at that connecting level: eaves at 13.06
and ridges at 15.66 scene units, replacing 14.53 and 18.13 on the raised rear
sections. Wall tops are 12.8. Their rear hips, widths, footprints and lower
single-pitch annexes remain in place. Stair-section wall tops, pale trim and
affected rainwater pipes meet the lowered roof. The west end cornice stays
behind the existing high sashes; windows retain all positions and dimensions.
The separate inner projecting enclosures retain their high windows and caps.

This supersedes the raised main-roof heights in the earlier rear-wing notes.
Browser sources and the local compiled model are updated; Blender and Unity
exports are unchanged. Evidence uses `Browser/artifacts/rear-height-*`.

# West-wing outline correction

The owner's follow-up on 4 October 2026 identifies a missing square projection
in [the marked photograph](projection-photo.png) and [aerial game shot](projection-game.png).
The [marked plan](depth-game.png) asks for the yellow court-facing side to move
right and the blue garden-facing side to move left, making the range slimmer.
These corrections supersede the retained footprint dimensions in the earlier
[four-pair proportion notes](../proportions-2026-10-04/README.md).

The linked [Google Earth viewpoint](https://earth.google.com/web/@53.2112896,-2.89851492,23.70718065a,214.60683921d,35y,-38.873579h,0.19268479t,-0r/data=CgRCAggBMikKJwolCiExalh1NDlPZTNpWFdvSExBUzFHZFM4bFVoS2NwZzhjVWsgAUICCABKCAjG56rDBxAB?pli=1&authuser=0)
was opened and inspected directly. It displays the same stepped outline as
[the supplied overhead image](earth-supplied.png), including the square garden
return beside the lower forward range. The Earth capture retains its Google
attribution; the viewer labels this imagery 17 May 2023. Architectural photos
establish the visible masonry and window faces; roof imagery establishes the
outline. Neither supplies a surveyed dimensional registration to the model.

`west-range-plan.mjs` supplies a shared outline to the base range and its
garden, court and end details. The two long wall planes move inward by four
model units each. Both rendered masonry and their associated openings move;
roof depths, cornices, bands and collision footprints follow them.

| Part | Previous model | Corrected model |
| --- | --- | --- |
| Court wall | z=-1 | z=3 |
| Garden recessed wall | z=19.5 | z=15.5 |
| Main cross-range depth | 20.5 | 12.5 |
| Outer end rear/front limits | z=3 / 26.5 | z=7 / 22.5 |
| Complete outer-end depth | 23.5 | 15.5 |
| Garden bay root/front | z=21 / 23.8 | z=17 / 19.8 |
| Inner square return | Missing | x=-44.8 to -38, z=15.5 to 21.2, height=14.3 |

The new square return has a blank west wall, two upper sashes on its garden
end, continuous floor bands and a low slate roof. It shortens the adjoining
recess while retaining an exposed entrance with flanking lights. The garden
fire escape follows the shifted outer return. The court bay, lower projection
and attached lean-to follow the moved court face; the lean-to retains its
3.5-unit depth. The long lower forward range and its lean-to retain their
footprints. The west-end entrance stays at z=14.3 with its existing path axis
and 5.8-unit central pier, inside the narrower complete white ground storey.
The sunken west-side basement, stairs and end wall retain their geometry.

The exterior arrivals for D2, D3, D5, D6 and F4 follow the physical doorways in
both `Research/1829-interior-proposal/plan-data.json` and its browser copy.
The interior room outlines and door anchors retain the existing proposal;
only the outside transfer destinations change. Rays from all five arrivals
must reach the actual blue door leaves. Outside stair routes and their guard
probes follow the shifted garden stair, including the upper third-storey route.

Matched before/after plan, aerial and garden views, the live Earth capture,
actual-page screenshots and validation logs use
[Browser/artifacts/west-outline](../../../Browser/artifacts/west-outline/).
The before capture uses saved copies of the four source files immediately
before this follow-up, preserving the earlier window/roof refinement.
Browser sources and the local compiled aerial are updated. Unity, Blender
and packaged exports are not regenerated.

Validation covers both source and compiled stair support/headroom, complete
up/down routes, 1,264,760 outside movement probes, real Explore railing collision,
desktop/phone rendering, model compilation, timeline controls and all periods.
The scope comparison preserves every one of the 1,443,014 primitives outside
the west outline and approach bounds, with 35 net added primitives inside.

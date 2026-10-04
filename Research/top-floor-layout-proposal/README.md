# Reception top-floor layout concept — 4 October 2026

The approved layout is now implemented in the browser game. The original
rough plan was requested for review before changing the game model. The interactive
`top-floor-plan.html` compares the concept with the current two-room layout.
This is a proposed arrangement within the model's existing envelope, not a
surveyed or historically verified floor plan.

## Suggested arrangement

- Three rooms occupy the existing windowed bay. Partitions at x=-2 and x=2
  fall between the straight sashes, giving a 2–1–2 window distribution.
  Suggested uses are a staff sitting room, a records office and a staff office.
- Their corridor-facing wall moves from z=11.6 to z=11.2. All three doors open
  into their rooms from a passage between z=11.2 and z=13.2, approximately
  2 metres wide before accounting for masonry thickness.
- A windowless archive/store takes the strip from x=-8.6 to x=8.6,
  z=13.2 to z=16. Its door opens inward from the passage. Regularly occupied
  rooms use the available windows; the unwindowed strip provides storage.
- A linen store uses the west pocket between x=-16 and x=-8.6,
  z=7 and z=9.6. It opens inward from S1's existing front landing.
- S1's 5.2-square footprint, well, flights and existing departure stay fixed.
  The approach turns into the eastward passage through the existing 1.7-wide
  space between x=-10.3 and x=-8.6. There is no new wall across that approach.

The retained boundary is the complete current second-floor outline, including
the canted bay and west stair extension. The five sash centres remain
(-4,4.4), (0,4.4), (4,4.4), (-7.4,5.6) and (7.4,5.6). Widths, heights,
sills and diagonal orientations also remain as in the shared plan.

## Sources and scope

- `../../Browser/dist/asylum-plan.json`, floor ID 3, rooms R41/R42 and stair S1.
- `../1829-interior-proposal/README.md`, Reception second-floor entry and later
  window-clearance/stair corrections.
- `../room-furnishings/README.md`, current second-floor records/staff-office uses.
- `../../DEVELOPMENT.md`, Reception second-floor and later stair/door entries.

The original interactive concept remains frozen for comparison. Its diagram
numbers map to game rooms as follows: 1=R43 staff sitting room, 2=R41 records
office, 3=R42 staff office, 4=R44 archive/stores, 5=R45 linen store. Both shared
plan copies now carry these rooms, their labelled doors and C24/C25 circulation.
The architectural and furnished second-floor SVG/PNG drawings are regenerated.
Existing furniture fills each room according to its use; the smaller records
office has a desk, chair and one bookcase, with bulk storage in the archive.

The west sitting-room doorway is centred at x=-5.5, 0.2 west of the rough
sketch, so the existing navigation grid has a clear doorway column. The four
passage doors have 1.3-unit openings; the linen door has a 1.2-unit opening.
Lower-floor doors keep the existing 1.9-unit width. Both faces of each upper
door carry its room name at height 1.75. Labels follow the open leaf and use
one shared atlas; other floors have no new labels, as the owner requested.

The current browser sources, shared plans, tests and review drawings change.
The aerial compiler excludes these interiors; its existing compiled manifest
still matches the unchanged source hash. Unity, Blender and packaged exports
are not regenerated.

## Review checks

Before implementation, `../../Browser/artifacts/top-floor-layout-proposal/validation.json` recorded an
exact comparison of the concept's retained outline, stair footprint and all
five complete window records with the live shared plan. Its proposed window
distribution is 2–1–2–0–0. Desktop and phone captures in light/dark appearance
were reviewed, including current/proposed switching and checks for clipped or
overlapping labels. The original concept can still be reviewed against the
saved `implemented/before-plan.json`.

Current checks and screenshots are in
`../../Browser/artifacts/top-floor-layout-proposal/implemented/`. The focused
second-floor check walks 40 furnished/unfurnished cross-floor routes, verifies
all five sashes against the exterior generator, checks the compact passage
and storage boundaries, and raycasts both faces of all five nameplates.
Chrome walks all five furnished rooms from Reception and back, verifies the
same labels in Escape/Explore, and captures rooms, plaques, stairs, notebook
and phone views. Preservation checks compare all lower-floor walls, doors,
navigation and stair rails with the saved plan and verify the aerial hash.

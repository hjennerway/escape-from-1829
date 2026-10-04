# Reception top-floor layout concept — 4 October 2026

Requested rough plan for review before changing the game model. The interactive
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

Only this review concept is authored. Neither shared plan copy nor game code
has been changed. Browser compiled scenes, Unity, Blender and packaged exports
are not regenerated. Room numbers 1–5 in the small-screen drawing are diagram
labels, not assignments of game room IDs. Furniture marks indicate possible
shelving only; furniture placement is not implemented.

## Review checks

`../../Browser/artifacts/top-floor-layout-proposal/validation.json` records an
exact comparison of the concept's retained outline, stair footprint and all
five complete window records with the live shared plan. Its proposed window
distribution is 2–1–2–0–0. Desktop and phone captures in light/dark appearance
were reviewed, including current/proposed switching and checks for clipped or
overlapping labels. No game suite or compiled-scene rebuild is needed for a
review drawing; gameplay has not been changed or newly validated here.

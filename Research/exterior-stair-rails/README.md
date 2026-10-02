# Exterior staircase enclosure — 2 October 2026

The owner's [marked west-garden staircase](west-garden-reference.png) identifies
open edges on the upper and intermediate landings. The request applies to all
similar exterior staircases, with physical barriers as well as visible rails.

The browser model now uses continuous iron guards on the flights and exposed
landing edges of the west garden, west masonry return, east forward wing,
central court, both inner courts, east courtyard, rear return, both annexe
stairs and both pharmacy stairs. Wall faces close the remaining sides; doors
and flight mouths stay open. Reception's existing front balustrade also has a
continuous walking barrier. Rail heights and dimensions are gameplay estimates,
not a new historical survey.

The west-garden return landing is extended along the wall, and its upper flight
meets the edge of the doorway deck. Both flight mouths open onto the turning
landing rather than overlapping it. The east-courtyard outer turn and rear
return deck also have enough room to pass the rail ends. The lowest inner-court
landing extends to the full width of its flight. Both mirrored annexe landings
are L-shaped: a top turn connects to a guarded side walkway leading to the door,
leaving the rising flight uncovered. This supersedes their previous broad deck
which covered the stairs and left an opening above a lower part of the flight.

The original attachment is preserved without editing. Browser modelling sources
and local compiled aerial assets are the outputs of this repair; Unity, Blender
and packaged application exports are outside its scope. Implementation and
validation are recorded in `DEVELOPMENT.md`.

The annexe guard and landing replacement also changes 15 saved fingerprints in
14 older geometry fixtures. Before updating each, the historical test was run
with only this repair's stair sections restored: every affected annexe test
passed against its original fixture. The replacement values and original values
are retained in [snapshot-updates.json](snapshot-updates.json). Only primitive
counts and geometry hashes changed; roots, dimensions and placement expectations
were preserved. The new stair regression checks climbing and collision behavior
in addition to these exact geometry snapshots.

The whole-estate Jarman and Leighton/Newton fingerprints already differed when
the stair changes were removed (430 fewer primitives in each). Those fixtures
were left unchanged. Audit captures and normal test output are retained under
`Browser/artifacts/exterior-stair-rails/`.

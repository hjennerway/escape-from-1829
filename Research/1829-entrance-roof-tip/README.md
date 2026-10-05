# Entrance roof tip (5 October 2026)

The owner's blue-circled aerial image identifies a small slate triangle
projecting through the west Reception parapet beside the lower entrance roof.
The image is a defect reference, not an additional instruction source.
The supplied image is retained in
`Browser/artifacts/entrance-roof-protrusion/reference.png`.

The lower roof's cornice return sampled every slate surface, including the
higher Reception roof at its attached end. That raised the terminal seam
and formed the protruding triangle. In `west-cross-range-roof.mjs`, the
return now samples and trims the adjoining entrance roofs while retaining
Reception's separate roof surfaces. The return meets the lower pitch and
continues down to its existing cornice.

The shared browser model applies to aerial, Explore and gameplay. Validation
is limited to this building and its immediate roof joins, as requested.
`Browser/test-entrance-roof-tip.mjs` checks 24 surface heights and six seam
contacts; reverting only this repair fails the new regression. Hardware
source/compiled captures and validation metadata are retained with the
reference. Unity, Blender and packaged exports are not regenerated.

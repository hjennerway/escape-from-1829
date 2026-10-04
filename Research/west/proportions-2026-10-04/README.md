# West-wing paired-photo proportions

The later [35% / 30% / 35% end-section correction](../end-sections-2026-10-04/README.md)
supersedes this pass's centre-pier width and entrance axis.

The later [marked outline correction](../outline-2026-10-04/README.md)
supersedes this pass's retained footprint dimensions and restores the missing
inner square garden projection.

The owner supplied these four photo/game pairs on 4 October 2026. The photographs
provide the architectural evidence; the game shots identify the existing views
and proportions to correct. The adjustments are visual estimates, not surveyed
dimensions. Perspective and camera position differ between each photograph and
game shot.

| Pair | Photograph | Original game shot | Main evidence |
| --- | --- | --- | --- |
| 1 | [Photo](photo-1.png) | [Game](game-1.png) | Garden bay, recessed flanks and adjoining lower range |
| 2 | [Photo](photo-2.png) | [Game](game-2.png) | Outer pavilion sash margins, stair recess and roof silhouette |
| 3 | [Photo](photo-3.png) | [Game](game-3.png) | Shallow bay crown and sash proportions viewed across the court |
| 4 | [Photo](photo-4.png) | [Game](game-4.png) | Complete white ground storey and wider, better-centred end pier |

These corrections retain the established E-plan footprints, storey heights,
outer pavilion rear connection, recessed flank lengths, stairs and basement.
They supersede the earlier west-end doorway axis at z=11.5 and partial white
ground-storey finish ending at z=19.5.

| Feature | Previous scene dimensions | Revised scene dimensions |
| --- | --- | --- |
| Outer pavilion hip rise | 2.86 | 1.10 |
| Garden bay front ridge height | 18.33 | 15.62; retained rear junction at 18.32 |
| Pavilion sash height | 2.75 on all three floors | 2.30 ground, 2.40 middle, 2.55 upper |
| Bay central/side sash width | 1.25 / 0.72 | 1.10 / 0.60 |
| Bay sash height | 2.50 | 2.20 ground and middle, 2.30 upper |
| West lower-range chimney shaft | 5.40 | 4.10; caps and pots lowered by 1.30 |
| West-end central pier width | 5.05 | 5.80, with wider upper and middle glazing |
| West-end entrance/pier axis | z=11.50 | z=14.30 |
| White ground-storey extent | z=3 to 19.5 | z=3 to 26.5, across the complete end |

Dimensions are model units. The pier axis is estimated from the photographed
spacing between the two narrow upper windows, central glazing and blank right
wall. The end cornice, rainpipe and entrance path follow the revised pier; the
two narrow upper windows retain their previous positions. The saved `west-3`
view now approaches from the garden side of the end, matching the final pair.

The browser sources are `west-front-photo-detail.mjs` and `west-refinement.mjs`.
They are shared by the aerial, walking and game scenes. The local compiled
aerial model was rebuilt; Unity, Blender and packaged exports were not changed.

Matched camera comparisons, actual-page screenshots, scope evidence and logs
are in [Browser/artifacts/west-proportions](../../../Browser/artifacts/west-proportions/).
`capture.mjs before` reads the two original source files from Git HEAD in memory;
it does not replace the working files. `pages.mjs` checks the rebuilt compiled
aerial and procedural Explore pages on desktop and phone layouts.

# Three annexe lawn oaks — 24 September 2026

The owner's [marked screenshot](marked-locations.png) requests one oak at each
of three blue crosses, visible in the 1915, 1916 and 1938 layers only.

`placement-fit.json` records the approximate screenshot registration against
the six retained annexe roadside tree roots and Pine14. The three ground picks
are (357.89, 27.32), (349.38, 34.82) and (341.19, 44.89), in scene x/z coordinates.
These are visual placement estimates, not additional surveyed KML points.

`Browser/dist/annexe-period-oaks.mjs` copies the existing mature oak, including
its shared geometry, instance buffers, materials and foliage detail levels.
All three have the existing oak's 22-unit height and 10-unit crown radius,
with distinct fixed rotations. They are added during timeline preparation and
tagged separately as `Annexe lawn oaks`, with a 1915–2010 visibility interval.
That interval selects exactly the requested three available timeline stops;
it does not assert a historical planting or removal date.

The trees remain children of the Trees group. Period changes invalidate shadows
and the existing walking controls refresh obstacles; hidden trunks have no
collision. Timeline version 5 rejects older compiled assets without this planting.
Browser aerial, walking and landing timeline scenes include the additions.
The untimed escape-game scene, Unity and Blender exports are unchanged.

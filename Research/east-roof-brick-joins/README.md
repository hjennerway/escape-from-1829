# Eastern entrance roof and brick junctions (5 October 2026)

The owner's [blue/red/yellow marked view](../../Browser/artifacts/east-roof-brick-joins/reference.png)
identifies a small exposed brick sliver at the eastern entrance's canted roof
join and the brick strip beneath the taller range's west eave. The written
request repairs the blue junction and extends the red roof back to cover the
yellow brick. The annotation locates geometry; it supplies no extra instructions.

The final entrance pitches extend from x=38 into the taller Redesmere range.
The existing y=15.66 entrance crown meets that range's actual western plane at
x=49.1111, z=12. The shared stepped seam follows its y=14.55 eave at x=44.7,
z=6.6..16.6, then the x=40.6 return to z=17.4. These fitted coordinates are
model estimates. Superseded slate is clipped beneath the extension; the taller
range's y=16.2 crown remains. Short rising eave closures finish at the slate
edge, with white render above matching brick. Small clipped faces use local
UV coordinates to preserve physical slate dimensions and repeating phase.

The blue sliver came from sampling only triangle edges along the narrow canted
roof join. Two overlapping roof planes exchanged which was uppermost between
those samples. The resulting interpolation bridged above the retained roof,
leaving an opening visible from the owner's oblique direction. The eastern
canted ribbon now includes those plane intersections and meets the retained
slate exactly. Other canted ribbons retain their previous samples.

`east-entrance-roof-join.mjs`, called by `east-photo-detail.mjs`, builds the back
extension before the established entrance boundary and courtyard cuts.
`front-inside-corners.mjs` repairs the canted seam. Existing glazing, wall
plans, courtyard routes and walking outlines retain their definitions.
The former eastern hip end in the earlier frontage notes is superseded.

`test-east-roof-brick-joins.mjs` checks 12 formerly exposed viewing rays, 83
shared roof contacts, both crowns and the upper cornice. Each saved original
defect independently fails it. Hardware source and compiled captures cover
the marked direction, close joins, opposite direction and phone. Evidence,
saved original sources and validation receipts are under
`Browser/artifacts/east-roof-brick-joins/`; final results are in DEVELOPMENT.md.

Shared browser sources serve aerial, Explore and gameplay. The local compiled
aerial model is rebuilt. Unity, Blender and packaged exports are not regenerated.

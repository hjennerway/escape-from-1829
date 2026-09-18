# The Willows

The supplied `1829 (9).kml` is archived as `1829-9.kml`. Only the placemark
**The Willows** is used for this addition; its Point is longitude
-2.904876118400348, latitude 53.22313660074063. The saved LookAt describes a
camera and is not used for placement. Other placemarks in this file do not
request changes to the scene.

`earth-registration.mjs` projects the Point with the existing fixed 1829
anchor. The centre of the rectangular footprint sits at that projected point,
scene X=1294.861651925, Z=387.703896278.
The KML altitude is not applied to the game's flat terrain. The site is about
1.3 km north of 1829; it has not been moved closer for presentation.

Only the **lower half** of the unedited composite `img1.jpg` supplies the
building reference: a long single-storey red/buff brick outbuilding, one red
pitched roof, plain gable ends, pale worn lintels and jambs, and three dark
front openings including a wide bay near the right end. The roof is interpreted
as weathered red sheet roofing with fine ribs; the exact covering is uncertain.
The visible shell is hollow, with actual gaps in the front wall and a dark
interior. No chimney, upper storey or extra wing is inferred from the upper photo.

The 24 x 6.4 m footprint, 3.1 m eaves, 4.8 m ridge, opening sizes and east-west
long axis are photo-based estimates: the KML is a point, with no footprint or
building heading. Hidden rear and end details remain plain. The vegetation
obscures parts of the facade and is not treated as additional building geometry.

The browser exterior adds one shared copy for Historic and Modern, including
Explore walking collisions and building selection. Both layouts off hides the
building and its collisions. Locations includes The Willows; aerial presets
are `willows`, `willows-photo` and `willows-plan`, and Explore supports `willows`.
Navigation limits extend to this distant pin. The existing 4 km terrain already
covers it. The reference photograph is included in its building gallery.

Implementation: `Browser/dist/willows.mjs`. The browser model and local compiled
aerial asset are updated; Unity and Blender sources/exports are not changed.
Validation is recorded in `DEVELOPMENT.md`.

# KML tree and lamp placement

## Oak22–Oak30 and Pine14 (later September 24 import)

`1829-12.kml` preserves the supplied `1829 (12).kml` byte-for-byte.
Only ten new Point locations are added: nine oaks, Oak22–Oak30, and Pine14.
The export also repeats the earlier Oak22 and relabels an existing Oak16 as
Oak23 at exactly the same coordinates. Those existing locations are not
duplicated or renamed. The new Oak22 is distinct from the earlier Oak22.
There are now 58 mapped trees: 34 oaks, 14 pines, two beeches and eight willows.

Longitude/latitude use the existing earthToScene registration. Altitudes remain
source metadata, with trunks on flat ground. The nine oaks reuse the 22-unit oak
and Pine14 reuses the 24-unit pine. New points are appended so earlier rotations
and placements remain unchanged. All additions use the shared Trees layer in
Historic, Modern and every timeline period, with the Trees toggle and trunk
collisions. Browser sources and the local compiled aerial asset are updated;
Unity and Blender exports are unchanged.

The exact-point, shared-buffer, visibility, collision and all-period checks
pass. The source/compiled comparison and browser timeline checks pass, as do
new-tree previews in both modes. Jarman and Leighton preservation checks exclude
only these ten new locations and retain their existing geometry baselines.
Validation logs and 1829/2021 previews use `Browser/artifacts/kml-12-`.


## Willow planting and surviving concrete lamps (September 24)

`1829-11.kml` preserves the supplied `1829 (11).kml` byte-for-byte. Import only
Surviving Lamp Post #1/#2, Willow1–Willow8 and the additional Oak21 Point.
The earlier Oak21 also occurs unchanged in this export and is not duplicated;
the second, distinct Oak21 is retained. There are now 48 mapped trees.
Willow2/3 and Willow6/7 share longitude/latitude but retain separate named
objects and source altitude metadata. No points are moved to avoid overlap.

The willows are north of the estate, at the exact registered KML positions.
Their seeded 16-metre weeping template uses the existing shared tree-generator
utilities: instanced limbs and leaf sprays, shared copy buffers, narrow leaf
textures and three foliage detail levels. The new oak uses the existing oak
template. All nine additions appear on every period and follow the Trees toggle
and trunk collisions. Terrain already covers their positions; navigation bounds
now include them. Locations offers Willow planting and each lamp in both views.

The user’s correction and `concrete-lamp-reference.png` supersede the first
Victorian lantern interpretation. Both lamps share a 92-triangle prefab: a
plain tapered rectangular concrete column, swept curved arm and slim rectangular
head, with a seeded rough aggregate texture. Overall height (approximately six
metres), concealed base and arm bearing are estimates; positions use Point
coordinates, never LookAt camera values. Lamps use flat ground, preserve KML
altitudes as metadata, and have their own 1915–current rule independent of the
Annexe demolition date. They stay visible when trees are hidden. No dynamic
lights were added. Browser sources and the generated aerial asset are updated;
Unity and Blender exports are unchanged.

`test-kml-11.mjs` checks exact lamp coordinates, shared low-poly geometry, every
period boundary, collisions and distant navigation. The existing KML/performance
checks cover all 48 points, duplicate oak names, shared buffers and foliage LOD.
The Jarman preservation check excludes only these additive imports, retaining
its existing 859,968-primitive baseline unchanged. Validation logs and source/
compiled previews use the `Browser/artifacts/kml-11-` prefix. The rebuilt
source/compiled comparison and all browser timeline stops pass; final lamp and
willow source/compiled previews render without page errors.


## Oak13–Oak22 and Beech1–Beech2 (September 17)

The latest tree import preserves `1829 (6).kml` byte-for-byte as `1829-6.kml`.
Only the Oak13–Oak22 and Beech1–Beech2 Point placemarks are added from it.
There are two separate points named Oak16; both are retained, just as with
Oak8 in the previous import. This adds eleven oaks and two beeches, bringing
the mapped total to 39 trees: thirteen pines, twenty-four oaks and two beeches.
Original coordinates, altitude metadata and all earlier tree rotations remain
unchanged. Registration still uses `earthToScene`, with trunks on flat terrain.

The new oaks reuse the existing 22-unit oak. The new beeches reuse the mature
front-lawn beech geometry at 19.5 units high and 8.6 units crown radius, with
green foliage. These sizes and colours are model choices, not KML measurements.
The two photo-positioned front-lawn trees retain their positions, sizes and
copper/green colours. All four beeches share geometry and instance transforms.

Every mapped tree belongs to the shared Trees layer and appears once when
Historic, Modern or both are enabled. Both layouts off hides them. The Trees
toggle also removes their trunk collisions. No mapped tree is displaced by
the Modern car park. Source data and geometry are in `kml-tree-data.mjs` and
`front-lawn-trees.mjs`; the oak template is unchanged.

`node Browser/test-kml-imports.mjs` compares all 39 coordinate triples with
their KML Point elements and checks both duplicate names, rotations, preserved
front-lawn trees, layout visibility and walking collisions. The aerial
performance check verifies shared buffers and foliage detail; its default
view submits 433,316 tree triangles, under the 442,000 budget for the added
copies. The browser sources and local compiled aerial model are updated;
Unity and Blender exports are unchanged.

The precise mapped planting can overlap the independently reconstructed
Historic footprints (including the Farndon collision probe); no tree is moved
away from its KML position to compensate. Farndon's layout test checks Historic
walls separately from shared tree collisions. Browser visual checks cover both
layouts, the Trees toggle and compiled loading with no page errors. Images are
`Browser/artifacts/kml-imports-trees-historic.png` and `kml-imports-trees-modern.png`.

## Earlier imports

The supplied `1829 (2).kml` is preserved byte-for-byte as `1829.kml`.
The supplied `1829 (3).kml` is preserved byte-for-byte as `1829-3.kml`.
The original file supplies Pine1–Pine13 and Oak1–Oak2; the newer file adds
Oak3–Oak12. It contains two distinct Point placemarks named Oak8, so both
locations are retained: eleven additional oaks and thirteen oaks in total.
Only those named Point placemarks supply tree locations.
LookAt values describe saved cameras and are not tree positions.
Other placemarks and paths in the file do not change the existing scene.

`Browser/dist/kml-tree-data.mjs` retains all twenty-six original longitude,
latitude and altitude triples. Longitude/latitude use the same `earthToScene`
registration as the mapped roads. The scene has a flat terrain, so trunks are
grounded there; the KML altitude values are preserved as source metadata.

All eleven earlier screenshot-positioned pines are replaced by the thirteen
KML pines. Each uses the existing 24-unit pine model, sharing its geometry,
materials and instance buffers. The thirteen large oaks share one 22-unit model
with a broad crown, heavy spreading limbs and lobed leaf sprays. Copies have
identical sizes within each species. A seeded generator supplies distinct
random rotations which remain stable after reloading.

Pines and oaks belong to the shared Trees group. They appear once in Historic,
Modern or both together, and follow the Trees toggle and walking collisions.
The existing front-lawn beeches and other broadleaf trees remain unchanged.
Positions follow the KML exactly within the existing approximate registration;
they are not shifted to fit the independently reconstructed Historic roads.

The saved **Admin grounds** view shows Pine1–Pine12; Pine13 is farther west
beside Vivienne Smith Lane. The oaks are near Hale/Daresbury/Huxley/Dunham.
The browser model is updated; Unity and Blender exports are unchanged.

Validation compared all twenty-six coordinate triples to the KML Point elements,
checked replacement counts, identical model scale, distinct rotations and all
four layout states. The aerial layout, aerial performance, collision performance
and walking tests pass. Shared GPU buffers and foliage detail levels remain
active. With eleven added oaks, the default aerial view submits 299,196 tree
triangles, within the updated 301,000-triangle budget (11,000 extra per oak).

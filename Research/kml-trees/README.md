# KML pine and oak placement

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

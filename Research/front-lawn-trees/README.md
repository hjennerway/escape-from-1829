# Front lawn trees

The user supplied img1.jpg and the yellow-X placement plan img1-loc.png on 17 September 2026. Two large mature broadleaf trees stand on opposite sides of the central Reception approach, inside the front boundary wall. The red dot and arrow set a ground-level view from the east entrance wing looking south-west across the lawns.

## EZ-Tree replacement (28 September 2026)

The two lawn specimens now use [EZ-Tree](https://www.eztree.dev/) geometry.
Oak Large was selected after visually comparing Oak Large, Ash Large and Oak
Medium in the editor: its substantial branches and fuller crown are the closest
starting point. This is a visual preset choice, not a botanical reidentification.

The settings start from Oak Large, lower the first branches to 24% of trunk
length, use 15/7/4 child branches and 16 leaf sprays, and shorten the upper 38%
of the crown to 45% of its original vertical span for a rounder mature outline.
Seeds 1901/1902 give the pair different branching. Crown extents retain the
original 8.6/7.7-unit radii and 19.5/18-unit heights at the same marked roots.
The oak leaf texture's shading is neutralised before applying bronze and olive
tints to retain the photographed colour difference. Bark001 adds trunk grain.

The former front-lawn template remains on the two KML beeches, whose geometry,
instance buffers, placement and colours were compared exactly against the
previous module. Only the two photo-positioned trees are replaced. All remain
on the existing Trees layer and the saved photo viewpoints still apply.

Leaf tips use EZ-Tree's three slow wind harmonics with independent phases and
a restrained 0.16-unit strength. Matching depth shaders move the shadows too.
The roots and trunks stay fixed, with walking blocked at the trunks rather than
the combined branch meshes' canopy-sized bounding boxes. Reduced-motion mode
holds the leaves still; hidden and distant trees do not advance the wind.

Implementation: `Browser/dist/front-lawn-eztree.mjs`, `front-lawn-wind.mjs` and
the pinned MIT-licensed source under `Browser/dist/vendor/ez-tree/`. Browser
sources and the local compiled aerial asset were regenerated; Unity and Blender
exports were not changed.

The yellow crosses are interpreted at x=13, z=61 (east) and x=-13, z=62 (west). Estimated heights are 19.5 and 18 scene units, with broad irregular bronze-green crowns, substantial trunks, spreading limbs and small instanced leaf sprays. These are visual estimates rather than surveyed dimensions or a confirmed species identification.

Geometry is in Browser/dist/front-lawn-trees.mjs, parented entirely to the shared Trees layer. T hides/restores both trees with the rest of the estate trees; their trunks stop blocking walking when hidden. The central approach and foreground lawn routes remain open. The front-lawn-trees preset in both aerial and walking views follows the red camera marker.

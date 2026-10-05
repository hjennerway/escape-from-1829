# Buried white render at the west inside corner

The owner's [blue-circled screenshot](../../../Browser/artifacts/west-render-protrusion/marked-reference.png)
on 5 October 2026 requests removal of white render poking through the brick
side of the inner garden pavilion. The image locates the defect; the written
request defines its scope.

Two trim ends produced the visible tips: the old main-range cornice left by
the inside-corner cut, and the sampled back-wall coping. In
`Browser/dist/front-inside-corners.mjs`, those trim pieces now exclude the
taller pavilion's roof projection. The exclusion uses that roof's actual
bounds and preserves the remaining trim's normals and texture coordinates.
Only intersecting white trim is clipped. Masonry, windows and roof outlines
retain their definitions.

Before/after source views, the saved corner source, actual compiled views and
the hardware-browser capture are in
[Browser/artifacts/west-render-protrusion](../../../Browser/artifacts/west-render-protrusion/).
Validation is limited to this building and its immediate surroundings at the
owner's request. Browser geometry and the local compiled aerial are updated;
Unity, Blender and packaged application exports are not regenerated.

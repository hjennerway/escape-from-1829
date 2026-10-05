# Entrance-side ridge relocation and render edge

The owner's [yellow/orange/blue marked view](../../../Browser/artifacts/entrance-ridge-shift/marked-reference.png)
on 5 October 2026 asks to keep the yellow ridges, move the orange branch to
the blue guide, and stop the slate at the white wall-top render. The marked
lines are modelling reference evidence. This supersedes the entrance branch
position in the earlier [roof-eaves revision](../roof-eaves-2026-10-05/README.md).

The perpendicular entrance ridge moves east by 1.5 model units, from x=-27.3
to x=-25.8. Its y=15.66 crown and z=12..18.3 limits remain. These fitted
coordinates are visual estimates. The long entrance ridge, higher cross-range
ridge and four existing branches retain their coordinates and heights.

The entrance cornice exposes its actual inner upper-cap boundary to the roof
builder. Narrow slate returns connect that boundary to the existing roof
planes, sampling every crease along their inboard seams. The former roof
fringe is removed through the entire overhang. The front hip now ends at
z=19.625, y=13.69, rather than passing through the cornice and projecting
beyond it. The rising side and left return use the same boundary. Cornice,
wall, window, door and walking outlines are retained.

Shared browser geometry is updated for aerial, Explore and gameplay, and the
local compiled aerial model is rebuilt. Unity, Blender and packaged exports
are not regenerated. Baseline roof source, the supplied guide, matched views
and validation evidence are under Browser/artifacts/entrance-ridge-shift/.

The roof regression checks the retained ridges, removal of the former branch,
the relocated ridge, shared valley, hip, exposed cornice and 404 physical
roof/render samples. The saved prior roof fails the relocated-ridge check.
Validation is limited to 1829 and its directly adjoining junctions, following
the owner's instruction. Final results are recorded in DEVELOPMENT.md.

# Oakmere lawn elevation

`img1.jpg` supplies the gabled two-storey elevation; `img1-loc.png` locates it
on the west side of the annexe's central rear spine. The user's later
clarification confirms that the purple/blue circle is the existing front
belfry and the green circle is the existing square tower. They are orientation
references, not requests to alter either landmark.

The local refinement adds the taller two-storey face, a central brick pediment
with circular vent and raking bands, an intersecting slate roof, four / five /
four window bays, the two pale blocked upper openings, masonry string courses,
dark downpipes, and lower end rooms. The window divisions follow the supplied
photograph. Dimensions and the concealed joins are estimates within the existing
registered estate; the photograph is not treated as a surveyed camera match.

The existing spine body and its unpictured elevation are retained beneath the
new upper masonry and roof. The refinement is confined to a separate
`Oakmere lawn elevation` group in `annexe-oakmere-detail.mjs`; only the generic
west-face sash instances are omitted from the annexe generator. The existing
ward destinations and ownership remain as before. This new reference does not
reassign the previous purple-marked rear service head.

Neither tower, the front belfry, entrance, front pavilions, canted side bays,
external stairs, rear service ranges nor courtyard wards has been moved or
remodelled. `Browser/artifacts/check-oakmere-preservation.mjs` compares 12,015
protected annexe primitives against the original annexe revision, including
their geometry, materials, transforms and collision flags. The baseline is
scoped to the annexe because other tasks are editing separate estate buildings
in the same workspace concurrently.

Open `aerial.html?view=oakmere-photo` or `?view=oakmere-lawn`; the new **Oakmere
lawn elevation** Locations entry also works in the exterior walk. The additions
follow Historic visibility. Blender and Unity source models are unchanged.

Validation: `node test-oakmere.mjs` checks every new opening against the complete
annexe, roof normals, walking access and collisions, and Historic visibility.
The existing annexe and ward tests check the front references, open courts,
mirrored bays/stairs, rotated rear wing and ward ownership. The visual QA script
renders the photo direction, site context and the earlier front and side views.

At validation time, the full suite encountered unrelated assertions in
`test-farndon.mjs` (the former northern OS corridor) and
`test-historic-roads.mjs` (remaining footprint edge count). Both failures were
reproduced with the Oakmere refinement disabled using the test-only
`artifacts/oakmere-baseline-loader.mjs`; the other suite checks passed.

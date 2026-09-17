# Main/admin lawn pine trees

The eleven blue crosses in `marked-locations.png`, supplied on 17 September
2026, place large pine trees on the lawns beside Main/admin, Vivienne Smith
Lane and the annexe. The user requested the same trees in both Historic and
Modern views.

`Browser/dist/admin-pine-trees.mjs` adds one set of eleven trees to the shared
Trees layer. They have tapered trunks, irregular branching whorls and instanced
needle sprays, with estimated heights of 23–27 scene units. Their positions
come from the fixed Hospital Shop roof/base and admin semicircular lawn in
the screenshot; `placement-fit.json` records the approximate camera fit and
ground picks. `Browser/artifacts/fit-admin-pines.mjs` reproduces that fit.

The Trees toggle hides the whole trees, their shadows and their trunk
collisions. They appear once when either or both layouts are selected and
also appear in the exterior walking/gameplay scene. All trunks clear the
Historic and Modern road edges; the closest centre is about 4.3 scene units
from a kerb. Existing buildings and roads retain their geometry.

Use the existing **Admin grounds** location (`aerial.html?view=historic-admin-grounds`)
to inspect the planting. The browser model is updated; Unity and Blender
exports are unchanged.

Validation checked all four layout combinations, tree visibility, trunk
collisions and road clearance. The aerial layout, performance, entrance,
garage and greenhouse checks pass. The full suite stops at the existing
annexe road snapshot mismatch; the Historic road clearance test also fails
at the Main/admin north service road. Both failures were reproduced using
the unchanged exterior from HEAD.

# Annexe roadside trees

The seven blue crosses in `marked-locations.png` place two trees above the
annexe entrance and five along the front avenue beside Picton/Carden. The
supplied `tree-reference.png` selects the existing small rounded broadleaf
model: a slim brown trunk and five overlapping green low-poly crowns.

`Browser/dist/annexe-road-trees.mjs` stores the seven ground positions.
`escape-exterior.mjs` adds them through the existing tree helper at scale 1.1,
sharing its materials and instanced crown batches. They follow the shared
Trees layer in aerial, walking and gameplay, including visibility and trunk
collisions. Existing planting keeps its positions and random shapes.

`placement-fit.json` records the screenshot camera fit, using the unchanged
asphalt apron and Picton/Carden roof corners. Placement is approximate because
the source is a cropped screenshot. Reproduce it with
`node Browser/artifacts/fit-annexe-trees.mjs`; the rendered comparison is
`Browser/artifacts/annexe-trees-after.png`.

This updates the browser model; the Blender and Unity exports are unchanged.

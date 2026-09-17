# Hale bowling lawn

`marked-reference.png` is the user's September 17 aerial annotation. Yellow
selects the small broadleaf tree at scene x=107, z=-98 for removal; blue outlines
the lawn west of Hale's connecting spine, between its two end returns.

The browser green occupies x=84..114.6, z=-119..-77.4, estimated from that image.
It has a narrow grass edge and subtle mowing bands, with no raised kerbs or
walking obstacles. The neighbouring tree at x=80, z=-98 remains outside the
green. No bowls equipment or surveyed dimensions are inferred.

The selected trunk and its five crown instances are omitted during construction;
their random draws are consumed to retain the subsequent trees' generated shapes.
The green belongs to Historic alongside Hale. The removed tree stays absent in
all layouts, and the Modern car park now hides thirteen remaining trees.

Source: `Browser/dist/bowling-green.mjs`, integrated in `escape-exterior.mjs` and
`aerial-layouts.mjs`. Browser aerial, walking and gameplay sources are updated,
and the local compiled aerial model is rebuilt. Unity and Blender exports are
unchanged. The rendered result is `Browser/artifacts/bowling-lawn-after.png`.

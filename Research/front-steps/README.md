# Front entrance split staircase

The 25 September 2026 [marked browser view](extend-to-wall.png) asks for the
red-marked inner stair edge to meet the blue-marked doorway landing wall,
removing the intervening grass strip.

`Browser/dist/front-steps.mjs` extends the middle landing and all four treads
on each lateral branch from z=24.6 back to the doorway wall at z=23.55.
Their depth increases from 1.2 to 2.25 scene units. The outer edge at z=25.8,
stair heights, four approach treads, side returns, parapets and balustrade
retain their existing positions. Solid foundations extend with the stone
surfaces, and the normal obstacle builder uses those new bounds.

This supersedes the earlier gap in the forked entrance stair plan described
in DEVELOPMENT.md. Dimensions remain visual estimates. Browser model sources
and the local compiled aerial model are updated; Unity and Blender exports
are unchanged.

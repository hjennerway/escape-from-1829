## Front semi-basement walks and corrected stair entrances (27 September 2026)

The two facade walks now sit 1.215 scene units below the existing path grade,
following the owner's 50%-deeper correction. Each has six 0.2025-unit risers
at both ends. The outer descent runs along the facade from the blue-marked
corner; the initially modelled stair projection into the lawn is removed.
The inner flight rises beside Reception. Existing bottom windows, blue doors,
upper walls and the central split staircase retain their positions. References,
estimated dimensions and the superseding annotation are in
[Research/front-basement/README.md](Research/front-basement/README.md).

The shared terrain, legacy ground and corner asphalt are excavated to expose
the lower paving and every tread. Exposed foundations close the walls beneath
the windows; retaining edges follow the stepped frontage. Explore follows
the actual lower floor and tread heights and blocks crossing the retaining
walls. Height metadata follows the same visibility/obstacle refresh as the
scene, without changing obstacle-array serialization. Hiding both layouts
restores plain grass; choosing a timeline period reopens the excavation.

The new `test-front-basement.mjs` covers both complete routes in both directions,
all four six-tread flights, removal of the lawn projection, surface heights,
retaining collisions and layout/timeline changes. It is included in `npm test`.
The corner, exterior, walking, touch-input and KML checks pass. A saved pre-edit
comparison confirms every front window position and size remains exact.
Source and rebuilt compiled front, west, east and ground views were inspected.
Evidence uses `Browser/artifacts/front-basement-*`. Browser model sources and
local generated aerial models changed; Unity and Blender exports are unchanged.

# East frontage half-octagonal bay

The user's 25 September 2026 annotation (`marked-bay.png`) identifies the
three-storey bay at x=53.1 on the 1829 building's east frontage. The request
supersedes its earlier full octagonal cylinder and stretched brick texture:
use the half-octagonal shape already present on the western bays and match
the surrounding brick size.

`Browser/dist/east-photo-detail.mjs` now uses the existing shared bay builder
in `west-refinement.mjs`. One broad front and two canted cheeks share their
outline with the white base, floor bands, slate hip and walking collision.
The bay is 5.1 units wide, projects 2.8 units from z=19.45, and retains its
14.3-unit wall height, four-unit white ground floor and nine sash windows.
Dimensions are model estimates; its short rear returns overlap the existing
frontage wall at z=19.5. The original `East curved bay` name is retained for
scene lookup compatibility.

Brickwork uses the surrounding walls' material and 1.7-unit world texture
scale. The western bays keep their existing geometry and opening schedules;
the shared helper gains optional base, band and window-row settings for the
east bay. This changes the shared browser exterior used by aerial, Explore
and gameplay. Unity and Blender exports are not regenerated.

The targeted checks in `Browser/test-escape-exterior.mjs` compare bay shapes
and rendered brick UV scale, ray-test all nine windows and the roof, and
check walking access around the canted corners. Source/compiled close, front
and overhead captures use `Browser/artifacts/east-bay-*`.

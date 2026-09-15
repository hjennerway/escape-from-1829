# Google Earth landmark correction — 15 September 2026

Source: [shared 1829 Google Earth project](https://earth.google.com/earth/d/1jXu49Oe3iXWoHLAS1GdS8lUhKcpg8cUk?usp=sharing). Read the project through the public Earth viewer and decoded its `document/getmapdata` response. These are feature geometry/pin coordinates, not saved camera targets. In particular, the Water tower camera target (53.2119851514, -2.8997763616) is different from its pin.

| Earth feature | Latitude | Longitude | Previous scene X, Z | Corrected scene X, Z |
| --- | ---: | ---: | --- | --- |
| 1829 Building | 53.2116032 | -2.8988043 | 0, 19.5 (entrance anchor) | unchanged |
| The Old Church | 53.2108814 | -2.9005010 | -6, -171.5 | -4.9, -119.2 |
| Water tower | 53.21234432581698 | -2.900961415659128 | 210, -90 | 148, -55.2 |
| Seren Lodge (Churton Ward) | 53.2108487 | -2.8995082 | -30.2, -111.5 | -44.3, -65.9 |

Registration retains the existing approximate site scale (one scene unit per metre) and the north-up satellite alignment below. The 1829 pin is associated with the existing central entrance at (0, 19.5); 1829 geometry is untouched. For each pin, compute east = longitude difference × 111320 × cos(53.2116032°), north = latitude difference × 111320. With L = hypot(0.55, 0.835), scene X = (-0.55 × east + 0.835 × north) / L and Z = 19.5 + (0.835 × east + 0.55 × north) / L. Round to 0.1 scene unit. Scale, axis registration and pin-to-model anchor correspondence remain approximate; the decimal precision does not imply a surveyed reconstruction.

Only the chapel, tower and Churton group positions change. Their dimensions and rotations stay fixed. Churton's local grounds and photo views and the chapel's relative approach follow their existing position references; walking obstacles derive from the moved geometry. The mast, chimney, 1829, other buildings and surrounding planting retain their positions. The older chimney test's relative-Z assumption was removed because that independent chimney is explicitly not moved with the tower.

## Earlier screenshot placement (superseded)
# Landmark placement from scale.png

Reference: user-supplied Downloads/1829/newmap/scale.png (659 × 524 pixels). Only the landmark outlines are placement evidence.

The central front entrance is approximately (434, 265) in the image and (0, 19.5) in scene X/Z. Aligning the main wings gives approximate image directions +X = (-0.55, -0.835), +Z = (0.835, -0.55), at 2.8 pixels per scene unit. This is a visual registration to the existing artistic building footprint, not a surveyed scale.

The tower square is centred near (34, 26), yielding X=150, Z=-53 (previously 124, -103). The church rectangle is centred near (117, 493), yielding X=-6, Z=-120 (previously 1, -105). Coordinates are rounded to whole scene units. The church nave already follows the rectangle's northeast/southwest axis, so its orientation and both landmarks' dimensions are retained.

The church approach uses offsets from its new position. The escape camera pulls back enough to retain the relocated tower in landscape and portrait.


## Chimney correction from the marked aerial screenshot

The subsequent user-supplied aerial image (codex-clipboard-71ea211f-e5f3-4b7e-8203-5c51149071cb.png, 1318 × 766) marks the new chimney base with a red X near image pixel (979, 410). Registering the ground plane against the existing mast base, water-tower base, old chimney base and front-drive corners gives approximately scene (180.4, -30.8), rounded to (180, -31). The ground registration residuals are within roughly four image pixels; placement remains a screenshot estimate. The chimney moves from (238, -66) to (180, -31). Its geometry, height, rotation, Historic membership and every other building position remain unchanged. This supersedes the old chimney anchor referenced in the earlier landmark check above.

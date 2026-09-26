# Roadside lamps and night viewing

The owner requested the same precast concrete design as the two surviving
lamps along the visible roads in every period. The shared swan-neck prefab is
based on [the supplied photograph](kml-trees/concrete-lamp-reference.png).
The two KML lamps retain their exact positions and 1915-onwards visibility.

The additional lamps are illustrative lighting, not a claim about historical
installation dates or surveyed lamp positions. They follow their road's period
visibility, including the independently dated Vivienne and northern Parsons
extensions. Historic road centrelines, saved modern routes, the entrance and
roundabout edges, and the four rear-annexe traces determine placement. Posts
stand outside the carriageway, usually about 30 scene metres apart, trying the
opposite verge around building foundations, tree trunks and road crossings.
Arms face inward toward the road. Positions are deterministic.

Rear-annexe control points in Browser/dist/street-lamp-paths.mjs are copied from
historic-roads/annexe-rear-network-input.json and use the same uniform
Catmull-Rom interpolation as the road generator. Refresh that copy if those
approved rear-road traces change.

Night viewing combines cool moonlight and mist, warm emissive lamp undersides,
soft ground pools and eight nearby point lights. The ground pools and halos
cover every visible fixture; nearby lights illuminate walls and foliage.
This bounded light budget keeps the full estate practical to render. Only the
moon uses the existing cached shadow map; street lights do not add shadow maps.

Browser model sources and generated aerial assets are updated. Unity and
Blender exports are not regenerated.

## Annexe entrance placement correction — 24 September 2026

The owner's [marked night view](annexe-night-lamps-marked.png) adds two posts
beside the central forecourt (red Xs), removes the post on the curved entrance
mouth (yellow circle), and adds two on the avenue verges (blue Xs).

The forecourt pair stands 1.4 scene metres outside its side edges, halfway
between its front and rear. Both arms point inward over the asphalt. The blue
pair follows the avenue: one opposite the entrance, beside the gravel-path
mouth, and one on the building-side verge 35 site-frame units to the right of
the entrance axis. Both use the existing 0.95-metre verge clearance and point
across the road. Screenshot ground registration is retained in
Browser/artifacts/annexe-lamps-register.mjs.

These four placements override the automatic sampling locally, after the other
roadside positions have been generated. The existing Annexe period parents
control the posts and night lighting. The net change is three additional
fixtures in the Annexe periods; other periods retain their existing counts.

## Main/admin lamp positions and ground contact (26 September 2026)

The owner's [purple-marked view](admin-lamps-marked.png) identifies the three
posts around the teardrop lawn. The follow-up request places them right at the
road edge, on the grass. The two island posts therefore sit just inside its
kerb, and the third sits outside the outer-road kerb. All three square concrete
feet clear the kerb by about 0.08 scene metres. Final world X/Z centres are
(248.883, 25.553), (252.572, 39.621), and (266.558, 22.056), respectively.
The screenshot positions are approximate placement guides, not survey data.

The island lawn is at Y=0.37 and the outer terrain at Y=-0.15. Each base extends
0.03 metres below its own ground surface. The instanced columns use a local
foreground depth bias so the junction's biased paving/lawn layers cannot hide
the bottom of the shaft and make it appear airborne. Their arm bearings and
road-period ownership are retained. Night lights follow the per-fixture height.

Placement happens before instancing, batching and walking collision extraction.
Other roadside fixtures retain their positions. Browser model sources and the
local generated aerial model are updated; Unity and Blender are not regenerated.
Registration, ground-contact reports and previews use Browser/artifacts/admin-lamps-*.

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

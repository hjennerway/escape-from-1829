# Escape from 1829

The church grounds now follow the supplied aerial reference, with four short
approach paths, a curved perimeter walk and grass pockets beside Parsons Lane.
Select **Church grounds** in Locations for aerial, plan and walking views.
The refinement appears in both layouts. See the
[reference and modelling notes](Research/church/README.md).

The rear wing roofs now have two levels: the main hipped roof and a lower
single-pitch extension. The east extension matches the west's roof shape,
and the white triangular glitch on the west hip is fixed. See the
[marked reference and geometry notes](Research/1829-back/README.md#rear-wing-roof-correction).

The back of the central 1829 entrance block now has the photographed outside
bevels, landing windows, continuous pale bands and shallow parapet. The marked
roof ridges run to the existing front apex, and the pediment is solid from
behind. The front's overall height is unchanged. Select **Central back** in
Locations for the photo direction and aerial view. See the
[reference and modelling notes](Research/1829-back/README.md).

The outhouse opposite 1829 follows the three supplied photographs and the
later red-circle correction nearer Vivienne Smith Lane. Its roof ridge sits
three-quarters of the way from the blank 1829-facing wall towards the side
with two windows. Select **Outhouse** in Locations for the aerial and three
photo directions, or open `explore.html?view=outhouse` to walk there. The
brickwork, blue trim, weathered boarding, plinth and entrance paving appear
in both layouts. [Reference and modelling notes](Research/outhouse/README.md).

## Play the game

[Explore 1829 and the Asylum](https://hjennerway.github.io/escape-from-1829/)

Use `WASD` to move, the mouse to look, `Shift` to sprint, `C` or `Ctrl` to crouch, `F` to toggle the torch, and `Tab` to open the floor map. Hold `E` at wall artwork to inspect it, or at any of the five emergency exits to escape. NPCs pause whenever `E` is held.

The browser build is served from [`Browser/dist`](Browser/dist). The Unity project and Blender source are included for continued development.

## Device location in aerial mode

The crosshair button beside **Locations** requests the device's current location. Inside the estate or within 100 m of its outer edge, it places a red pin and centres the aerial view there. Farther away it shows “This only works near the West Cheshire Hospital site”. The button also explains denied permissions, unavailable location and timeouts, and can be pressed again to refresh the fix.

Location requires HTTPS (or localhost for development) and browser permission. Each press requests a fresh, high-accuracy fix; coordinates remain in the page and are not saved or sent to a server. The reported device accuracy appears with the result. The pin remains visible across layout changes. This control appears only in aerial mode.

The perimeter in `Browser/dist/device-location.mjs` approximates the whole modelled estate, including the annexe and southern grounds, from the existing outer roads. The 100 m buffer is measured to the nearest perimeter segment, with all interior points accepted. Both the boundary and the existing `earth-registration.mjs` alignment are approximate, not surveyed. Run `node Browser/test-device-location.mjs` for distance, coordinate and permission/error checks.

## Browser performance

The exterior's fixed sunlight shadow map is rendered once and reused while walking, orbiting, and playing the arrival/escape camera sequences. Changing the Historic/Modern layouts or tree visibility refreshes the shadows; restoring a lost WebGL context also refreshes them. Shadow resolution and building detail are unchanged. Code that moves exterior geometry or sunlight at runtime must call `exterior.invalidateShadows()` afterward.

Exterior walking uses a spatial index to check nearby foundations and trunks, retaining the existing polygon collisions, wall sliding, and movement speeds. Idle movement skips collision work. Layout and tree changes rebuild the index with `walker.setObstacles(...)`. Run `npm test` in `Browser` for the navigation checks and collision comparisons across all four layout combinations.

## Historic and Modern aerial layouts

The aerial preview has separate **Historic** and **Modern** checkboxes. Historic starts on and Modern starts off. Either, both, or neither can be visible. Shared 1829/Redesmere geometry, the water tower, Churton and church appear once whenever either layout is on. The Annexe, Main/admin building, its connecting corridor and the freestanding chimney belong to Historic. Existing shared grounds and site context follow the shared group; switching both layouts off leaves the terrain.

Modern includes fifteen saved Google Earth paths: Upton grange, Gerrard Crescent, Frost drive, Vivienne Smith Lane, Ross Avenue, Ross Avenue (Part 2), Upton Grange (Part 2), Lockwood View, Warren Lane, Parsons Lane, Parsons Lane (Upton Lea), Parsons Lane (1829 Central), Valley drive, Parsons Lane (North) and Caldecott Close. Vivienne Smith Lane and all four Parsons Lane sections, with their labels, also appear in Historic, using the same single copies when both layouts are enabled. Each path has a camera-facing road-name label anchored to its centreline; the text stays readable while orbiting and zooming and follows its road’s layout visibility. **Fit layouts** frames all currently visible buildings and roads; ordinary toggles retain the camera for comparison. Expand **15 mapped paths** to see the road names. The layout controls are available throughout the aerial preview and exterior walk. Gameplay retains the existing estate. Press **T** to toggle the **Trees** layer, which starts visible.

The paths are bundled locally from the shared Google Earth project, with all 159 saved vertices retained and registered to the fixed 1829 anchor. Road widths are approximate. See [road provenance and layout details](Research/modern-layouts.md). Run `npm test` in `Browser`; the suite includes all four layout combinations, unchanged transforms, road geometry and landscape/portrait fitting.

Historic and Modern roads share grey asphalt, pale 0.6-unit borders, and rounded joins and ends. Parsons Lane retains its saved vertices. Vivienne Smith Lane follows the September 16 red-marked route across the lawn south of Main/admin, with its western fork moved back to the start of the marked line. Both layouts, labels, junctions and clearance use the refined centreline; the original Google Earth coordinates remain available as source data. Historic roads are trimmed against the complete saved paths, including both roads' borders and end caps, so they do not overlap either lane.

## Historic roads from the marked layout

The supplied `roads/layout.png` and `roads/layout.-annotated.png` now define the Historic road network. Only the red-selected routes and the shared Parsons Lane / Vivienne Smith Lane remain as roads. Blue identifies the semicircular Main/admin forecourt, yellow the narrow teardrop, purple Main/admin, green the water tower and pink its existing service buildings. The road curves are fitted around the established buildings; the photographed plan is not treated as a surveyed projection.

The Main/admin forecourt has a straight frontage and one semicircular drive around a D-shaped lawn. The adjacent teardrop is slender and points towards the northern junction. The northern perimeter, ward approaches, tower courts, annexe avenue and southern drive follow the new trace. The previous full roundabout, extra annexe loops, garden/parking/entrance aprons, extended diagonal and outer eastern spur are removed. The sweeping Reception driveway from Vivienne Smith Lane is shared by Historic and Modern, as clarified by the user. The tower service buildings retain their positions, with road clearance around their walls and the neighbouring Estates department.

Use `aerial.html?view=historic-roads` for the whole network or `?view=historic-admin-grounds` for the closer comparison. Source images and reconstruction notes are in [Research/historic-roads/README.md](Research/historic-roads/README.md). Route data, clearance and rendering are separated in `historic-road-layout.mjs`, `historic-road-clearance.mjs` and `historic-roads.mjs`. The road tests check both saved lanes across every ribbon's full width, building clearance, semicircle/teardrop surfaces, removed routes and all layout combinations. This layout supersedes the earlier alarm-board and aerial road revisions.

The latest annexe annotation keeps the red-circled asphalt forecourt intact and narrows its sweeping entrance to a slim neck with a smooth flare onto the avenue. The frontage side approaches and yellow-circled rear roads, junction mouths and hardstanding are removed. The red-circled Main/admin road ends form continuous junctions, the teardrop has a smooth inner lawn edge, and the northern estate boundary connects around the annexe to Parsons Lane (North). These surfaces belong to Historic. Use `aerial.html?view=annexe-access` or `?view=annexe-entrance`; see the [current frontage notes](Research/annexe-frontage-adjustment/README.md).
### Annexe wards

The colour-matched OS map supplies the approved side wards and rear blocks,
including the separate front courts and open rear courtyard. The later rear
aerial supplies its overall setting. The user's subsequent review sets the
whole annexe to 72% of the OS footprint's width and depth, 12.5% larger than the
first aerial fit, and brings it closer to the red frontage line. Heights and
detailed shapes are retained. It fits inside the Parsons loop and clears the
teardrop. See the [current placement and frontage](Research/annexe-frontage-adjustment/README.md),
[initial aerial correction](Research/annexe-photo-placement/README.md)
and [OS shape comparison](Research/annexe-os-refinement/README.md), or open
`aerial.html?view=annexe-plan`. The **Annexe / Main · aerial photo** location
shows the wider relationship. This supersedes the earlier dimensions and
placement described below.

The OS correction aligns the annexe's central frontage using the fixed church,
Churton and Grafton/Edge, preserving its dimensions. The later road annotation
moves the frontage avenue to the red line, translates the teardrop intact toward
Main/admin and adds the yellow gravel path. The central sweeping entrance is
reconnected; both front-side approaches are removed. Buildings and rear access
remain fixed. See the [alignment and validation notes](Research/annexe-placement/README.md),
or open `aerial.html?view=annexe-roads` for the updated road layout.

The later overhead correction moves the east rear pavilion to the inner side of its link, roughly matching the blue-marked position. The yellow-marked Leighton/Newton connecting leg is 40% shorter, with its end pavilion moved inward to retain the L and the existing 22-degree angle. Roofs, windows, chimneys and walking collisions follow the revised footprints. These changes apply to the browser model; the Blender and Unity exports are unchanged.

The supplied Oakmere lawn photograph now refines the central rear range with a taller two-storey elevation, a central gable and circular vent, divided sash windows, brick bands and low end rooms. The circled belfry and tower retain their geometry, as do the earlier front and side details. Choose **Oakmere lawn elevation** in Locations, or open `aerial.html?view=oakmere-photo`. See [reference and preservation checks](Research/oakmere/README.md).

The annexe is divided into five named ward groups from the [supplied marked view](Research/annexe-wards/ward-reference.png): **Larkton/Jodrell** (yellow, west outer wing), **Tarvin/Jarman** (blue, west courtyard), **Leighton/Newton** (red, rear east L), **Oakmere** (purple, rear service block), and **Picton/Carden** (green, east courtyard). Each has its own **Locations** entry in the aerial and walking views. The colours identify the reference areas; the original brickwork and slate materials are retained.

Ward groups own their existing walls, roofs, windows, trim and chimneys. Shared connecting ranges, central buildings and the unmarked east end remain under The annexe. Geometry, placement and walking collisions are unchanged. Use, for example, aerial.html?view=tarvin-jarman or explore.html?view=oakmere.

### Archived OS building footprints

All brown ground outlines traced from the OS map have been removed from the scene. The source images, saved contours and registration remain available as modelling references in `Research/historic-footprints/`, `Tools/trace_historic_footprints.py`, `Browser/dist/historic-footprint-data.mjs` and `Browser/dist/historic-footprints.mjs`.

A single scale-and-rotation fit anchors Reception and checks the chapel and Churton, accounting for the map's different orientation without moving the estate. The two check landmarks agree within six scene units; the low-resolution scan and model placement make the saved contours approximate. Existing buildings still use the OS reference data for placement, and road checks retain the building-footprint metadata.

Choose **Historic site plan** in Locations, or use `aerial.html?view=historic-footprints`, for the existing overhead view without the brown markers.

## Front boundary and entrance

The front inside corners now follow the supplied yellow footprint: recessed
brick returns, angled stair faces, tall sash windows and blue rear doors. Both
entrance corners share the refinement and remain accessible in Explore. The
recent bollards are omitted. Choose **Inside corner · Photo 1 / Photo 2 / West**
in Locations, or use `aerial.html?view=front-corners`. See the
[reference and geometry notes](Research/front-inside-corners/README.md).

The blue-marked frontage correction moves the wall and hedge continuations to z=74, keeping their orientation and central opening. This leaves approximately one six-unit road width of grass between the boundary and the fixed Vivienne Smith Lane. The lawns and Reception approach extend to the moved wall.

The sweeping, flared asphalt entrance is shared by Historic and Modern, using one copy alongside Vivienne Smith Lane. Its grey asphalt and pale kerbs match the roads in both layouts. A 26-unit-diameter semicircular paved forecourt now sits directly outside Reception, as clarified for the pink-marked area, with its flat side facing the door and its rounded edge opening onto the central approach. The curved edging leaves the approach open.

Matching gravel paths now branch from both sides of Reception's semicircle,
with small sweeping joins onto the entrance wall walks. Those walks widen from
1.2 to 2 scene units, continuing around the forward wings to the west fire exit
stairs and the Redesmere courtyard on the east. The forecourt kerb opens at
both new junctions. These paths appear in both aerial layouts and Explore.

Use `aerial.html?view=front-entrance` to inspect the forecourt, gate, grass verge and junction together. Reference: `Research/front-entrance-annotated.png`. Dimensions remain photo-based estimates. The saved lane vertices and building locations are unchanged. The wall and forecourt also appear in walking/gameplay; the mapped lane junction belongs to the aerial layouts. Unity and Blender exports are unchanged. `Browser/test-modern-entrance.mjs` covers the shared curve, verge width, forecourt shape, surface continuity and clear gate-to-door walking access.

## Hale/Daresbury/Huxley/Dunham

The new two-storey ward follows the green range arrangement in the supplied
aerial between Grafton and the water tower. Its footprint is squared to the
estate axes, with a long cross range, a connecting spine, two courtyard wings
and an opposite end return. It uses Irby/Ashley's multi-pane sash windows,
brickwork and slate-roof treatment. Select **Hale/Daresbury/Huxley/Dunham** in
Locations for aerial, plan, courtyard and walking views. It belongs to Historic;
the courts remain accessible. See [reference and modelling notes](Research/hale-daresbury-huxley-dunham/README.md).

## Hospital Shop beside Redesmere

The white single-storey Hospital Shop block follows the blue footprint in the supplied reference view, with a fully hipped slate roof and seven high multi-pane windows along the garden-facing wall. A narrower brick corridor with a flat roof follows the green footprint and joins its rear to the existing Redesmere-to-Main/admin range. The ivy-covered range and chimney retain their positions.

Choose **Hospital Shop** in Locations, or open `aerial.html?view=laundry`, `?view=laundry-photo` or `?view=laundry-plan`. The building follows Historic visibility and appears in browser walking with solid collisions. Placement, dimensions and concealed faces remain visual estimates. References and modelling notes: [Research/laundry/README.md](Research/laundry/README.md). Unity and Blender exports are unchanged.

## Pharmacy rear court

The latest yellow/purple annotation moves the three workshops towards Main/admin,
aligning their rear beside the fixed Irby end with a narrow roof clearance.
The purple service group also moves towards Main/admin, opening just enough room
for both gas cylinders beside the fixed chimney at the blue marks. Building details,
stairs, ramp, camera views and walking collisions follow the new placement.
See [the placement correction](Research/tower-buildings/README.md#workshop-and-cylinder-placement).

The service court now includes the photographed rear sash windows, two raised masonry stairs with pale blue railings, and two large ribbed gas storage cylinders on brick bases at the yellow-marked locations. Select **Pharmacy rear court** in Locations, or open `aerial.html?view=pharmacy` and `explore.html?view=pharmacy`. The additions follow Historic visibility, with solid foundations and accessible paths around the cylinders. The existing roofs and building footprints remain. See [reference and modelling notes](Research/pharmacy/README.md).

## Tower service buildings

The red-circled western workshop is duplicated into the yellow-marked footprint
at 1.5 times its original width and depth, retaining the same overall height,
roof, blue dormer and facade details. Its rear edge aligns with the original workshops. Open
`aerial.html?view=tower-workshop-copy` for the updated view.

The latest `towerbuildings2` reference turns the detached yellow-marked building into two adjoining gabled workshops, moved outward along the blue arrow. Their two roof slopes face the tower and Estates; the yard fronts have the photographed blue doors and three upper windows. The purple hall is shortened towards Main/admin to open the marked viewpoint. Choose **Twin workshops** in Locations, use `aerial.html?view=tower-twin-gables` for the photo comparison, or `explore.html?view=tower-twin-gables` to walk there. See the [reference and placement notes](Research/tower-buildings/README.md#twin-workshop-gables-and-cleared-photo-viewpoint).

The Historical layer now includes the adjoining brick service ranges, mixed slate and flat roofs, blue roof ventilators, stores doors and the ramp shared by `tower_buildings/img2.jpg` and `img3.jpg`. Three adjoining ranges meet the tower, leaving the 1829-facing wall clear. The corridor begins one third into each north/south face, with a flat strip in front of the upper arch and a shallow pitch touching only the final third. The marked roof correction puts two blue dormers on the east-pointing range nearer the chimney and one on the central hall, all aligned with their host ridges. The stores now run north/south with a flat front section and a hipped ridge against the tower. The three blue-traced photographs fix the contacts: a right-hand slope on the white-door face, a left-hand slope on the opposite face, and two inward-falling slopes on the face away from Redesmere. Their flat centres and shared corner heights now agree with the wall marks. Img3 also refines Main/admin's low east end with angled corners, tall sash lights and a matching hipped roof. The service-road approach curves into a paved court beside the ramp. The blue-circled block in img4 is now modelled separately as Irby/Ashley.

Choose **Tower buildings** in Locations, or open `aerial.html?view=tower-buildings`; photo views 1-4 and a plan are available there. The saved OS trace anchors the ranges; concealed divisions and dimensions remain estimates. Sources and modelling notes: [Research/tower-buildings/README.md](Research/tower-buildings/README.md). New service geometry and roads belong only to the Historical aerial layer; Unity and Blender exports are unchanged.

## Main/admin building

The connecting corridor now branches north at 90 degrees, past the water tower
and through its service ranges to Farndon. A diagonal corridor follows the later
red route to Upton/Frith/Oscroft, with side branches into Grafton/Edge and Witby.
The links share the existing low brick and slate treatment and follow Historic
visibility and exterior walking collisions. Choose **Farndon corridor** or
**Ward corridors** in Locations, or open `aerial.html?view=ward-corridors`.
See the [marked routes and modelling notes](Research/admin-corridor/README.md#farndon-and-ward-extensions).

The paired main_refine3 photographs correct the same Main/admin corner from the annexe end and rear court. The blue-marked wing now has a steep three-sided hipped room with paired sashes, a lower recessed link, and an upper return behind. The flat end seen in img1 is the side of the existing red-marked court block seen front-on in img2; the duplicate room is removed. The accepted rear frontage and hipped stair bay retain their positions and front windows. The green-circled structure is excluded. Use `explore.html?view=main-admin-annexe-end` and `?view=main-admin-rear-court` for the yellow- and blue-arrow directions; these walks include the existing Historic service buildings and court. The same presets work in `aerial.html`. See [paired reference notes](Research/main-refine3/README.md). Dimensions and concealed joins remain photo-based estimates.

The Main/admin building stands east of 1829/Redesmere. `Browser/dist/main-admin-building.mjs` uses the supplied `midwifery-school/os.png` for its central range, two projecting end pavilions and low west rooms. The OS silhouette takes precedence over `scale.png`; coloured circles and camera arrows are reference annotations only. Pixel scale is estimated against the existing estate with Reception as the origin, so placement and dimensions are approximate rather than surveyed.

The four photographs guide the three-storey red-brick facade, two-storey window bays, sash glazing, pale stone trim, central pediment, columned portico with ball finials, slate hips and tall chimney stacks. Photo 1 looks north from the lawn; photo 2 looks west along the frontage from an elevated position; photos 3/4 look east from the western approach. Concealed rear/east elevations are inferred, and gravel approaches retain the estate's circa-1900 treatment.

The main_refine correction gives both front window bays 45-degree chamfered corners, with glazing, stone bands and lead caps following the angled faces. The low west rooms now step back into a narrower, lower-roofed connection beside the tall pavilion, following new-shape.png and front.png: three windows on the projecting outer room and one on the recessed connection. Walking collisions follow the cut corners and leave the new recess open.

The east elevation now follows chimney/img1.jpg, with chimney/img1-loc.png locating the southeast camera looking northwest. The inferred window grid is replaced by one upper sash column, separate ground-floor openings, two side chimney breasts/stacks and a low hipped-roof wing with a recessed connection. Curved gravel approaches follow the photographed circulation. Open aerial.html?view=main-admin-east or explore.html?view=main-admin-east for the comparison.

The freestanding brick chimney in Browser/dist/estate-chimney.mjs is placed at x=180, z=-31, estimated from the latest red X on the user-supplied aerial screenshot, on the lawn between the water tower and Main/admin building. It has a tapered shaft, soot-darkened rim and an open throat. Its total height is exactly 1.3 times ESCAPE_WATER_TOWER.height (50.765 scene units at the current tower height). Position and diameter remain screenshot estimates; the chimney is an independent scene group.

The black OS connection is an independent group, **1829 to Main/admin connecting corridor**. The supplied winter painting now guides its warm red brick, small windows with semicircular heads, pale masonry surrounds and projecting sills, fine divided glazing, shallow slate roof, brick eaves and dark rainwater goods. The later red-marked photograph corrects the first 60% of the exposed connection from Redesmere to a deeper single-storey building with a raised hipped slate roof, stepping down to the remaining narrow corridor at the admin end. The front wall alignment and short concealed joint remain; extra depth extends northwards. The ivy-fronted Redesmere range and its adjoining chimney are unchanged. Walking collision follows the new walls. Roof proportions, window spacing and concealed elevations are estimates; see `Research/admin-corridor/README.md`. Open `aerial.html?view=main-admin-corridor` or `explore.html?view=main-admin-corridor` for a close comparison. The reference is saved in `Research/admin-corridor/winter-corridor-reference.png`; geometry is in `Browser/dist/admin-corridor-detail.mjs`. The escape pan includes the new building and retains the mast and water tower.

Open `aerial.html?view=main-admin` for an aerial, `?view=main-admin-plan` to compare with 1829, or `?view=main-admin-1` through `?view=main-admin-4` for the photographs. The four presets also work in `explore.html`; `explore.html?view=main-admin` starts on the western approach. Photo 2 retains its elevated height. Run `npm test` in `Browser`; `test-main-admin.mjs` covers placement, exposed glazing, roofs, photo starts, collisions, separate corridor ownership and landscape/portrait pan framing. Browser geometry is updated; Unity and Blender exports are unchanged.


The outer east elevation of Redesmere follows `redesmere.jpg`, with `redesmere-loc.png` locating the westward view from the lawn and `redesmere-render.png` showing the previous model. It now has two canted brick bays, a pale green central entrance with a gabled canopy, fine sash windows and splayed stone heads, pale floor bands, slate roofs, tall chimney stacks and a low side room. The garden border and iron railing follow the established circa-1900 treatment; trees leave the marked sightline clear. The inner courtyard details and access routes remain in place. Open `aerial.html?view=redesmere-photo` for the comparison or `explore.html?view=redesmere-photo` to walk from it. Geometry is in `Browser/dist/redesmere-photo-detail.mjs`; dimensions and obscured details are visual estimates. The Unity and Blender exports are unchanged.

Escape the 1829 building in Chester while Sylvia, Security, and the Deva asylum ghost search the corridors.

## Building arrival (browser)

The two mature front-lawn trees follow `trees/img1.jpg` and the yellow crosses in `img1-loc.png`. They stand at approximately x=13, z=61 and x=-13, z=62, either side of the central approach. Their broad bronze-green crowns, substantial branching trunks and fine leaf sprays belong to the **Trees** layer. Choose **Front lawn trees** in Locations, or open `aerial.html?view=front-lawn-trees` / `explore.html?view=front-lawn-trees`, for the view from the red camera marker. Placement and dimensions are photo-based estimates.

The four Redesmere timber planters and east corner shrub bed have been removed, along with the H shortcut. All estate trees, including trunks, branches and crowns, belong to a separate **Trees** layer, visible by default. Press **T** in the aerial view, exterior walk or game to show/hide them. Hidden trees do not cast shadows or block walking.

The menu's **Explore the asylum** button opens a ground-level exterior walk at `explore.html`. Use WASD to move, mouse look (or click and drag when mouse capture is unavailable), Shift to move faster, and Escape to release the mouse and pause movement. The top-right **Locations** button opens the same popup as the aerial view, with walking destinations, an **Entrance** link and links to aerial plans. **Back to game** returns to the menu. **Historic** and **Modern** use the aerial layout visibility rules: Historic starts on, Modern starts off, and either, both or neither can be shown without moving the camera. Walking collisions update with the visible buildings and trees. Losing focus clears movement keys. The exploration page uses bundled Three.js and runs independently of the interior game.

Starting or restarting holds the aerial estate view for 1 second, then rushes the camera toward the central front door while fading to black over 1.5 seconds. It switches to the ground-floor Reception spawn at full black, then fades back in over 0.5 seconds, completing the intro in 3 seconds. Controls, pursuers and the gameplay timer remain frozen until the reveal finishes, preserving the full five-second head start. Hidden tabs suspend the sequence; reduced-motion mode uses a still exterior with the same fades and timing.

The intro and escape ending share the Three.js estate in `Browser/dist/escape-exterior.mjs`. Its central frontage includes three bays of sash windows, stone bands, four Ionic entrance columns, steps and a red panelled door. The triangular pediment maps the actual blue dragons and gold coat of arms from the supplied `Browser/dist/exterior/1829front.webp` photograph. The earlier standalone frontage in `Browser/dist/exterior.mjs` is no longer loaded by the game. Dimensions are visual approximations, not a measured survey. Repeated architectural trim is instanced, and the exterior renders separately from the interior. This browser addition does not require Blender; the Unity scene and existing binary exports have not been changed.

Camera choreography and timing are isolated in `Browser/dist/arrival-cutscene.mjs`. Run `node Browser/serve.mjs` from the repository root to preview at `http://127.0.0.1:1829`. The game-loop checks include arrival timing at low frame rates, both fades, Reception placement, frozen gameplay, restart and reduced motion.

## Reception stairs

The left staircase is based on the uploaded `20260216_092540.mp4` and the user's confirmation that it is down a corridor to the left of Reception. The right corridor and staircase are mirrored at the user's request, not independently verified from footage. Corridor lengths and stair dimensions remain gameplay approximations.

The two stair approaches branch from the existing gallery either side of Reception. They replace the former north/south centre-line markers. Both are shown on the floor map and minimap. The browser constructs its architecture from the current navigation layout, retaining the existing material palette and architectural trim, so old exported walls cannot block these new approaches.

### Playable upstairs (browser)

Hold **E** for 0.8 seconds at either staircase to transfer to the upper landing; release E before using it again. On mobile, hold **USE**. This is a floor transfer, not continuous physics-based stair climbing. Use either upstairs landing to return downstairs. The HUD, floor map, minimap, collisions, lighting and visible pursuers switch to the current floor. All five escape exits remain downstairs.

Upstairs has a mirrored gallery loop and three side rooms, connected to both staircases. This is a fictional gameplay extension, not a measured reconstruction from the footage. Pursuers can route through either staircase; enemies on another floor cannot see, hear or capture you through the ceiling. The ghost continues tracking across floors but must travel to a staircase. Restart resets everyone downstairs.

Run `npm test` in `Browser` for layout reachability and headless game-loop integration checks. The latter mocks rendering and DOM APIs; it is not a visual/WebGL test.

The canonical and browser JSON layouts and Blender layout generator are synchronised. Existing `.blend`, `.fbx`, `.glb` and overview image exports have not been regenerated; the Unity binary level still requires a Blender rebuild. The browser no longer loads the stale `.glb` when `geometrySource` is `layout`.

The menu's **Archival footage** panel links to the supplied [Google Photos video](https://photos.app.goo.gl/UfHfqXjWSfPtDs3C8).

## Historical reference panels

## Escape cutscene

The east forecourt has been refined against `20260912_172141.jpg` and the user's marked viewing direction. It has a full white ground storey, fine multi-pane sash windows, a two-storey forward wing with blue doors and an external metal stair, three tall chimney stacks, a shallow polygonal bay, and two aligned front windows per floor on the three-storey square projection. Window locations are maintained explicitly in `Browser/dist/east-photo-detail.mjs`; foliage-obscured details and dimensions remain visual estimates. Open `explore.html?view=east-photo` to walk from the marked area, or `aerial.html?view=east-photo` for a stationary comparison.

The opposite side of the cut-through is refined against `img2.jpg`, looking from the back towards the front. `Browser/dist/courtyard-photo-detail.mjs` adds the projecting octagonal courtyard bay, two close window pairs plus one single sash per floor on the adjoining wall, the taller stair block with a two-flight external fire escape, white ground-floor walls and windows, exposed pipes, and the glazed brick enclosure. The photographed parking bays are empty. Open `explore.html?view=courtyard-photo` for this comparison position. The courtyard passage and rear approach remain open.

Looking towards the rear of the estate, `img8.jpg` defines the wider rear return and the inward face of the east wing in `Browser/dist/rear-court-photo-detail.mjs`. The return has five upper sashes plus a stair door, wider ground-floor glazing, a return fire escape and a blue gabled porch. The adjoining wing includes its own blue porch, a shallow projecting bay beneath two tall chimney stacks, splayed window heads and a white stair enclosure with a sloping roof. The planting island and empty bay markings follow the photograph; the rear access gap remains open. Open `explore.html?view=rear-court-photo` for this direction.

The corner between 1829 and Redesmere follows `20260912_172245.jpg`, `20260913_171133.jpg` and `bridge-loc.png`. The former roofed connecting rooms are removed, leaving separate rooflines and an open lane into the eastern courtyard. Only a shallow brick lintel crosses the front of the lane: its underside is at first-floor level (4 scene units), with a half-storey masonry head (2 units), a whitewashed face, dentilled cornice and exposed brick parapet. The Redesmere end beside it is a low range with a windowless front and brickwork continuing to ground level. Two shallow slate hips replace the tall windowed end-room placeholders; the taller building and its windows sit behind them. The lamp stands beside the approach, leaving the opening visible. `Browser/dist/redesmere-passage.mjs` holds the detail and comparison camera; open `aerial.html?view=redesmere-passage` or `explore.html?view=redesmere-passage`. Geometry checks verify open sky behind the lintel and the route remains walkable in both directions. Dimensions are photo-based estimates; Unity and Blender exports are unchanged. This supersedes the earlier roofed-link interpretation.

Escaping through any of the five exits starts a ten-second aerial 3D pan over the 1829 estate with **You escaped** on screen. The model follows the supplied aerial photograph and the user's annotated correction: reception at the front centre, curved window bays, projecting wings, slate roofs, lawns, roads and parking areas. The right wing starts from a reflection of the left wing, with a longer stepped front projection and adjusted courtyard and outer rooms following `outline-new.png`. The yellow-shaded extension is represented in matching brick and slate as a long outer range with a stepped rear return, wrapping around roughly three sides of the eastern parking court, with the rear return offset outward and back to leave its rear-left entrance open. The two gaps between the central rearward arms remain open to the rear road. Parking beside the extension moves outward to clear its footprint. A lattice radio mast sits beyond the rear-left corner, at the upper left from this perspective, following the corrected arrow. The shape and dimensions are an artistic reconstruction, not a surveyed model; the property outline and annotations are not reproduced.

The scene is built in `Browser/dist/escape-exterior.mjs` and the pan is controlled by `Browser/dist/escape-cutscene.mjs`. It uses real geometry, instanced window/trim details, procedural brick/slate materials and directional shadows. It shares the game's renderer and remains behind the result screen. The original mast photographs remain as reference assets but are no longer displayed or loaded by the ending. Gameplay and the timer freeze throughout; hidden tabs suspend playback. Select **Skip cutscene**, or press Escape, Space or Enter, to go straight to the result. Reduced-motion mode holds a still 3D aerial view. Losing does not trigger the sequence.

The Old Chapel stands behind the rear car park at x=-4.9, z=-119.2, registered from the shared Google Earth marker with 1829 fixed (see `Research/landmark-placement.md`). `Browser/dist/chapel.mjs` builds the photo-based brick chapel with a steep slate gable roof, pointed lancet windows, stepped buttresses, projecting entrance porch, vestry, clock gable and ridge crosses. Its clock face points towards the front of the main building, with the entrance porch on the west side. Dimensions are approximate and styled to match the aerial model.

With the local server running, open `http://127.0.0.1:1829/aerial.html` to replay the ending directly. Tests cover all five exits, low-frame-rate duration, replay/reset, the retained result background, actual roofs and open rear gaps, and building/mast framing in landscape and portrait. The Unity build is unchanged.

## Historical reference panels

The in-game photo panels and the 1854 statistics plaque are based on the public history and photography references from [Mark Davis Photography](https://www.mark-davis-photography.com/explore/the-countess-of-chester-asylum-deva/), [Based in Churton](https://basedinchurton.co.uk/category/cheshire-lunatic-asylum/), and the [public Deva photo archive](https://www.whateversleft.co.uk/asylums/deva-countess-of-chester-asylum-chester/). The plaque keeps the original report terminology as a historical quotation, rather than a modern diagnosis.

The photo/video-based water tower stands beyond the right campus block at x=148, z=-55.2, registered from the shared Google Earth pin (see `Research/landmark-placement.md`); the escape pan widens to keep its finial visible. Its square brick shaft has concentric round arches, paired slit windows, corbelled eaves, a pyramidal tiled roof and a finial. Total height is 39.05 scene units, 2.2 times the main building's 17.75-unit pediment height. Open the preview with ?view=tower for a close-up. The escape camera widens on narrower screens to retain the tower in view.


The inner eastern courtyard uses `img3.jpg`, with `img3-loc.png` locating the view and `img3-render.png` showing the earlier model. The projecting block now has an exposed brick basement, multi-pane sash windows, a pale cornice beneath a sloped slate roof, iron return stairs and a raised garden with stone edging and low white walls. Planting and plain stair treads adapt the modern reference to the circa-1900 setting; dimensions remain approximate. Use `aerial.html?view=inner-court-photo` for the comparison view or `explore.html?view=inner-court-photo` to walk from it. The later marked rear aerial supersedes the separate lowered stair roof: both wings now carry their main roof over the stair section, above matching lower sloping annex roofs. The exterior stairs are visual scenery, not climbable routes.

The west courtyard follows `img6.jpg`, with `img6-loc.png` locating the view and `img6-render.png` showing the earlier model. It now has a polygonal bay, a single sash and two pairs on each upper storey, an entrance beneath the single sash, exposed brick at ground level, pale floor bands, a recessed corner link and a glazed lean-to. The gravel court and planted border preserve the circa-1900 setting. The previously lowered rear wing ends remain in place. Open `aerial.html?view=west-court-photo` or `explore.html?view=west-court-photo` for the comparison view. Dimensions remain visual approximations. The annotated west corner link is widened to 7.2 units; the central wall and bay move outward into a broader frontage, ending in a seven-unit recessed section and a six-unit projecting corner with separate hipped roofs. The gravel apron and planting move outward to clear the enlarged footprint.

The west-front garden follows `img9.jpg` and its supplied render/location images. It includes a square front with two sashes on each of three floors, an iron return stair, fine windows on the existing polygonal front bay, a brick two-storey forward range with chimney stacks and a low glazed side extension. One spreading tree replaces the two large crowns that hid the facade. Open `aerial.html?view=west-front-photo` or `explore.html?view=west-front-photo` for the comparison view. The architecture is approximate, and external stairs remain non-climbable scenery.

The west-front refinement uses `refine.png`, `refine2.png` and the annotated [custom My Maps outline](https://www.google.com/maps/d/viewer?mid=1K6D3LtUWtSBew_0e9FVCqYLXq777-BI). The square frontage and fire-exit wall now align with the main pavilion, with the iron return stair moved back together with its landing doors. Each storey has a sash on either side of the curved bay. The yellow endpoints indicate a central rear section about 1.5 times the depth of the side arms; the centre is widened to 13 scene units and extended rearwards, with the drive routed around its end. The detailed east and west arms retain their existing lengths, bays, lowered rear roofs, glazing and garden features. These are relative visual estimates, not survey dimensions. Use `aerial.html?view=west-refine` for the updated facade or `aerial.html?view=plan` to compare the footprint.

The inner east elevation is refined against `img14.jpg`, with `img14-loc.png` fixing the viewing direction. `Browser/dist/inner-east-elevation.mjs` adds the tall rectangular brick projection, one front window on each floor, glazed side return, stepped adjoining pier and shallower white base. The external stair now has three flights, an intermediate landing and vertically aligned landing doors. The raised garden and map-based central-arm dimensions are retained; the central-arm stair is aligned to its widened wall. Open `aerial.html?view=inner-east-photo` for the comparison or `explore.html?view=inner-east-photo` to walk from it. Unmeasured dimensions remain visual estimates.

The annotated img14 side-profile correction moves the stair doors, flanking windows, landings and three flights four scene units towards the front, replacing the former blank stretch of wall. A lower brick annex occupies the vacated rear section, with two levels of windows and a slate roof rising towards the moved stair block. The roof has sloping brick infill and pale edge trim. The overall rear footprint stays unchanged. The existing `inner-east-photo` comparison and walking views show this correction.

The west rearward wing is rebuilt from the detailed east inner elevation, reflected across Reception at x=0, then refined against `img15.jpg` (looking east) and `img16.jpg` (looking south). Its outer wall has eight bays and exposed brick basement walls, with pale eaves beneath a continuous grey hipped roof matching the other wings. The end has three broad glazed gallery bays above brick infill, a glazed side return, a single-slope roof and a wider central upper sash with sidelights. The mirrored inner projection and return stairs retain a clear route beside the central arm. This supersedes the earlier lowered west hipped end; the eastern geometry is retained. Dimensions remain photo-based estimates. Open `aerial.html?view=west-wing-side` or `aerial.html?view=west-wing-end` for comparisons; both views are also available in `explore.html`.

The outer east elevation of Redesmere follows `redesmere.jpg`, with `redesmere-loc.png` locating the westward view from the lawn and `redesmere-render.png` showing the previous model. It now has two canted brick bays, a pale green central entrance with a gabled canopy, fine sash windows and splayed stone heads, pale floor bands, slate roofs, tall chimney stacks and a low side room. The garden border and iron railing follow the established circa-1900 treatment; trees leave the marked sightline clear. The inner courtyard details and access routes remain in place. Open `aerial.html?view=redesmere-photo` for the comparison or `explore.html?view=redesmere-photo` to walk from it. Geometry is in `Browser/dist/redesmere-photo-detail.mjs`; dimensions and obscured details are visual estimates. The Unity and Blender exports are unchanged.

The frontage west of Reception follows `img19.jpg`, with `img19-loc.png` locating the northward view from the front lawn and `img19-render.png` showing the previous model. `Browser/dist/entrance-west-photo-detail.mjs` adds the three-bay projection, broad central glazing with sidelights, five recessed sashes on each upper floor, white lower-storey walls and blue doors, a stepped parapet cornice and pitched slate roofs. Reception has matching fine sash glazing, brickwork and white base. The obstructing lawn tree moves away from the sightline, and the gravel approach and handrail gap remain walkable. Open `aerial.html?view=entrance-west-photo` or `explore.html?view=entrance-west-photo` for the comparison. Dimensions and the camera position are visual estimates; Unity and Blender exports are unchanged.

The inner face of the west forward wing follows `img18.jpg`, with `img18-loc.png` fixing the westward lawn view. `Browser/dist/west-lawn-photo-detail.mjs` adds a three-window projecting bay, fine sash windows with segmental brick heads, pale floor bands, a recessed connecting wall and an edged gravel approach. Two taller chimney stacks carry paired pots, and the tree stands beyond the end of the wing. The gravel follows the existing circa-1900 grounds treatment. Open `aerial.html?view=west-lawn-photo` or `explore.html?view=west-lawn-photo` for comparison. Dimensions remain visual estimates; Unity and Blender exports are unchanged.

The two inward-facing elevations around the entrance lawns are mirror images, following the user's blue-outlined correction. `Browser/dist/entrance-symmetry.mjs` reflects the updated west frontage and img18 lawn elevation across Reception at x=0, including the projecting bays, doors, glazing, trim, paths and paired chimney stacks. The east inner walls now match x=29/32 and the forward end at z=43; only the outer roof slope widens to join the retained outer east wall and courtyard details. The large east lawn tree moves beyond the wing end. Use `aerial.html?view=east-lawn-photo` or `?view=entrance-east-photo` for the mirrored comparisons; both presets also work in `explore.html`. This supersedes the earlier asymmetric inner east frontage.

The paired entrance roof sections now rise above their cornice slabs, with matching pitched slate surfaces and bay roof caps above the projecting wall tops. This fixes the pale roof cut-outs exposed by the earlier shallow roof placement. Geometry checks cover both roof edges and the front bay caps.

The front end of the west forward wing follows `img17.jpg`, with `img17-loc.png` locating the northward view and `img-17-render.png` recording the earlier model. `Browser/dist/west-forward-end-photo-detail.mjs` replaces the three-column end with four lower sashes, three tall upper sashes and a glazed blue landing door with a separate transom. It adds segmental brick heads, a pale floor band and layered cornice, rainwater pipes and a two-flight masonry return stair with fine iron railings. The paired chimney stacks are offset across the roof, the nearby tree moves to the side and the hedge leaves the photographed approach open. Plain stair treads retain the circa-1900 treatment. Open `aerial.html?view=west-forward-end-photo` or `explore.html?view=west-forward-end-photo` for comparison. Dimensions are visual estimates; exterior stairs remain non-climbable scenery, and Unity and Blender exports are unchanged.

The main front steps follow `20260913_171036.jpg` and the user's forked plan. Four central treads rise to a branching landing; each side turns 90 degrees outwards up four further treads, then turns forward onto a level return joining the broad doorway landing. Red-brown masonry parapets, pale stone treads and a front iron balustrade complete the portico approach. Geometry is in `Browser/dist/front-steps.mjs`; use `aerial.html?view=front-steps` for a close view, or `explore.html?view=front-steps` from ground level. Dimensions remain visual estimates. As with the other exterior stairs, these are scenery rather than climbable routes; Unity and Blender exports are unchanged.

The front boundary follows the supplied outward-looking photo and red-marked aerial stretches. Two low weathered stone walls with pale coping and capped end piers replace the marked hedge sections, leaving the central entrance path open. Geometry is in Browser/dist/front-boundary-wall.mjs; use aerial.html?view=front-wall for a close view or explore.html?view=front-wall to look out towards it. Height and extents are visual estimates. The browser scene and walking collisions are updated; Unity and Blender exports are unchanged.

The annexe replaces the former new hospital reconstruction. `Browser/dist/annexe.mjs` follows the northern black footprint in the supplied `annexe/os-clean.png`, with the annotated `os.png` identifying the building and photo directions. A similarity transform registers the 417 × 433 map to existing 1829 Reception (pixel 285,308 → world 0,13) and the chapel (215,351 → -6,-120). The Redesmere outer elevation at approximately pixel 242,265 provides an independent placement check. Map proportions and the annexe's 19-degree frontage direction are preserved; pixel picks, heights and concealed details remain visual estimates. The earlier fire-alarm-map courtyard layout is replaced.

The front and side photographs inform the symmetrical entrance pavilions, paired square roof towers, broad hipped hall roof, three round-headed dormer windows, central open bell tower and dome, terracotta banding, white multi-pane sashes, blue gutters/downpipes and side fire stair. Both entrance-side courts have L-shaped voids formed by solid outer/front corners. The rear east L wing turns approximately 22 degrees relative to the frontage, and the two previously modelled transverse rear galleries are removed. The canted bay, glazing, blue rainwater goods and fire stair are mirrored on both sides. Browser geometry is updated; Unity and Blender exports are unchanged.

Use `aerial.html?view=annexe-front`, `?view=annexe-front-right`, `?view=annexe-img1` or `?view=annexe-side` to compare the supplied photographs; `?view=annexe-side-right` shows the mirrored right elevation. `?view=annexe-plan` and `?view=annexe-site` face the same way as the OS map. `?view=annexe` gives an aerial overview; `explore.html?view=annexe` starts on the front approach. Existing `new-hospital` URLs continue to resolve. `Browser/test-annexe.mjs` checks registration, Redesmere alignment, map proportions, open courts, roof normals, exposed arched glazing and rotated wall collisions.

The entrance lawns extend to the front boundary wall. Their only paths are the central approach and a narrow gravel walk following the building walls, recessed frontage and projecting bays on both sides. `Browser/dist/entrance-walks.mjs` joins these walks around the split entrance stairs; the earlier lawn crossings and detached door approaches have been removed.


## Churton Ward

Churton Ward replaces the plain rear campus block in the browser estate. The six paired photographs and location arrows establish the lawn face, broad rear gable, hipped return, oblique middle wing and low side room. The yellow satellite outline sets their approximate proportions, with the ward now registered at x=-44.3, z=-65.9 from the Seren Lodge marker in the shared Google Earth project. The 1829 building remains the fixed reference; see `Research/landmark-placement.md`. Red brick, slate roofs, splayed brick window heads, sash glazing, corbelled chimney stacks, the pale-sided glazed entrance and a hedged lawn follow the references; gravel approaches match the established grounds treatment. Nearby placeholder trees are cleared from the ward and its approach.

Use `aerial.html?view=churton` for the aerial view, `?view=churton-plan` for the footprint, or `?view=churton-1` through `?view=churton-6` for the corresponding photographs. The same six presets work in `explore.html`; `explore.html?view=churton` starts on the lawn approach. Geometry is in `Browser/dist/churton-ward.mjs`. Walking collisions follow the walls and leave both rear recesses open. Run `node Browser/test-churton.mjs` for viewpoint, recess, window visibility and collision checks. Dimensions and unseen details remain visual estimates; Unity and Blender exports are unchanged.

The Churton alignment correction squares the ward and its grounds to the estate axes. The short rear wing now angles towards the church-side return (a backslash when viewed from the rear), with its roof, windows, door and collisions rotated together.

The east forward wing beside the Redesmere approach follows `redesmere-edge/img1.jpg`; `img1-loc.png` establishes the northward viewing direction and `img1-render.png` records the earlier model. Its end now has four aligned sash windows on each of two floors, segmental brick heads, continuous brick at ground level, pale floor and eaves trim, and slimmer chimney stacks. The end is narrowed to 12 scene units while the inward walls stay in place; the outer side windows, white side base, roof and fire escape move together. Low planting, a young verge tree and repositioned lamp leave the facade clear. This supersedes the earlier widened outer slope at this wing. Open `aerial.html?view=east-forward-end-photo` or `explore.html?view=east-forward-end-photo` for comparison. Geometry and proportions are photo-based estimates, and gravel/plain stair treads retain the circa-1900 treatment. Exterior stairs remain scenery; Unity and Blender exports are unchanged. Run `node Browser/test-east-forward-end.mjs` for window visibility, brickwork and forecourt access checks.

The garden corner facing the east side of the square pavilion follows `redesmere-edge/img3.jpg`, with `img3-loc.png` locating the north-westward view and `img3-render.png` showing the previous model. `Browser/dist/redesmere-garden-photo-detail.mjs` replaces the generic side window grid with a blank front section, shallow central projection, paired upper sashes, broad middle glazing with sidelights, two narrow upper windows and a blue ground-floor door. The side return extends behind the retained square front beneath a continuous slate roof. The shallow connecting head moves back along the same passage to z=15.5 so it meets the plain wall beyond the broad window; its four-unit clear height and open lane are retained. Ivy, weathered boarded panels, two slatted benches and four timber herb beds refine the low range and lawn. Gravel paths preserve the circa-1900 treatment. Open `aerial.html?view=redesmere-garden-photo` or `explore.html?view=redesmere-garden-photo` for comparison. Dimensions and obscured details remain visual estimates; Unity and Blender exports are unchanged. `node Browser/test-redesmere-garden.mjs` checks exposed glazing, the roof, bed collisions and passage access.

## Upton/Frith/Oscroft

The two-storey Upton/Frith/Oscroft range stands behind the church in the browser estate. `Browser/dist/upton-frith-oscroft.mjs` uses the western half of the registered OS wall trace for its dimensions and stepped form, then reflects it across the existing church centre line at x=-4.9. This follows the user's red-line symmetry correction and supersedes the uneven OS east wing. Both halves have identical walls, hooked end pavilions, slate hips, windows, doors, trim and roof lanterns. The central projection aligns with the chapel's longitudinal axis; the church's position and rotation are unchanged. The resulting footprint is approximately 101 by 26 scene units.

The supplied aerial guides the joined slate roofs and two pale roof lanterns. The outward garden elevation follows the supplied photo: two mirrored pairs of two-storey canted brick bays, a continuous cream upper-sill course, a dentilled brick cornice and dark rainwater goods. All facade windows use tall white two-light frames, one meeting rail, muted vertical blinds, projecting cream sills and splayed stone lintels. Bay spacing, entrances and the 7.8-unit eaves height remain approximate; the photo adds detail to the symmetric OS-derived main footprint. The building is shared by Historic and Modern, consistent with the present-day aerial. Its walls provide walking collisions, its recesses remain open, and the walking boundary extends northwards to allow access. All brown OS ground traces, including the adjoining unmodelled complex, are removed.

Open `aerial.html?view=upton-outward` for the garden-facing aerial, `?view=upton-outward-photo` for the photo comparison, `?view=upton` for the close aerial, `?view=upton-plan` for the overhead comparison, or `explore.html?view=upton` to walk from the church-side lawn. References, including the red-line correction, are saved in `Research/upton-frith-oscroft/`. Run `node Browser/test-upton.mjs` for fixed church alignment, mirrored footprint and rendered roof checks, two-storey glazing, clearance, walking and layout checks. Unity and Blender exports are unchanged.

## Water tower photo refinement

The water tower now follows all four numbered ground-level photographs, with side 2 facing 1829 and side 4 facing the annexe. Distinct arched openings, intersecting former roof scars, brick infill and pale repairs replace the repeated lower facades. The upper blind arcade, three pairs of blocked slits, string course and corbelled eaves use the photographed proportions. Open `aerial.html?view=tower-1` through `tower-4`, or choose a numbered side from the water tower aerial. [Photo mapping and modelling notes](Research/water-tower/README.md). Browser geometry is updated; overall height and location remain unchanged.

## Redesmere edge chimney

The small, broad chimney at the outer corner of Redesmere's low end range follows the two photos and marked camera views in `Research/redesmere-chimney/`. It has a pale rendered, slightly tapered circular shaft, a stepped round projecting cap and two short circular recessed flues. Position (x=100.55, z=20.1), height (9.9 scene units) and concealed details are visual estimates. Geometry is in `Browser/dist/redesmere-edge-chimney.mjs`, shared by Historic, Modern and walking/gameplay. Open `aerial.html?view=redesmere-chimney` or `?view=redesmere-chimney-lawn` for the two comparison directions; the same views work in `explore.html`.

The rear east and west arms now connect directly into the main 1829 range. Their front roof sections meet the main roof at the same eaves and ridge heights, with continuous slate and masonry across the former gaps. The taller sections farther back are retained. All remaining generic 1829 windows use the same fine three-light, six-row sash frames, glazing and sills as the detailed elevations. These changes apply to the shared browser exterior in aerial, walking and gameplay views; Unity and Blender exports are unchanged.

## Irby/Ashley

The new two-storey Irby/Ashley range follows the yellow refinement in the supplied `irbyashley/location.png`, registered over the existing brown OS trace beside the curved service road. The photos guide the red brick, stepped wings, slate roofs, chimney stacks, tall divided sashes, two canted garden bays and low glazed lean-to. The courtyard openings remain accessible. All brown OS ground traces, including the adjoining unmodelled connection, are removed.

Choose **Irby/Ashley** in Locations, or open `aerial.html?view=irby-ashley`. Plan, purple-camera, blue-camera and Main/admin viewpoints are available; `explore.html?view=irby-ashley` starts on the garden approach. The building belongs to Historic and the walking/gameplay scene. The request refers to img2 at the purple arrow, but the supplied file is img1; that correspondence and concealed details are approximate. Sources and registration notes are in [Research/irby-ashley/README.md](Research/irby-ashley/README.md). Unity and Blender exports are unchanged.

## Grafton/Edge

Grafton/Edge is a copy of Irby/Ashley rotated 90 degrees anticlockwise and fitted to the yellow/orange-marked bay beside Upton/Frith/Oscroft. Its church-facing rear follows the supplied veranda photograph: a mostly flat facade, shallow square projections at both ends, and one central half-octagonal bay intersecting a full-length open veranda. The copied greenhouse and paired rear bays are removed. Slate roofing, slender posts, timber end screens and a clear sheltered walk complete the veranda.

Choose **Grafton/Edge** in Locations, or open `aerial.html?view=grafton-edge-rear` and `explore.html?view=grafton-edge`. The model belongs to Historic. [Placement and photo notes](Research/grafton-edge/README.md) describe the approximate dimensions. `node Browser/test-grafton-edge.mjs` checks canopy coverage, the bay junction, walking access and the unchanged original Irby/Ashley.

## Estates department

The Estates department stands beside the service road near Irby/Ashley, retaining the complete stepped U-shaped OS footprint. The later yellow-guide correction turns the building 19 degrees clockwise and aligns its tower-facing edge within the service-road enclosure; its courtyard, collisions and photo/walking views follow the same transform. The later blue-to-yellow correction slides Estates towards the tower without changing its angle. The purple-selected ground becomes one continuous grey service court around both buildings, retaining the cobbled courtyard and only a small grass island between Estates and Irby/Ashley. The supplied photograph guides its two-storey rear offices, taller right-hand gabled return, low hipped entrance room, left workshop, turquoise doors, white windows, red brick bands, slate roofs and cobbled courtyard. The courtyard entrance remains open for walking.

Choose **Estates department** in Locations, or open `aerial.html?view=estates`, `?view=estates-photo`, `?view=estates-plan`, `?view=estates-site` or `explore.html?view=estates`. The building follows Historic visibility. [Reference notes](Research/estates/README.md) record the OS coordinates and photo-based estimates. `node Browser/test-estates.mjs` checks placement, roof coverage, windows, walking access and layout visibility. Unity and Blender exports are unchanged.

## Farndon ward

The Historic browser estate now includes the single-storey Farndon ward in the corrected blue footprint from `farndon/img1.png`. The registered H-shaped plan preserves its unequal garden wings, small rear room on a narrow link and low side projection. Joined slate roofs, plain brick end gables, the central garden gable, tall multi-pane sashes and chimney stacks follow the aerial and `img2.jpg`. The yellow dot and arrow identify the garden photo direction. The open courts remain accessible; the superseded ward outline is retired while adjacent OS corridor traces remain.

Choose **Farndon ward** in Locations, or use `aerial.html?view=farndon`, `?view=farndon-plan`, `?view=farndon-site`, `?view=farndon-2` or `explore.html?view=farndon`. The ward follows Historic visibility and has walking collisions. [Reference and modelling notes](Research/farndon/README.md) record the footprint registration and estimated dimensions. Run `node Browser/test-farndon.mjs` for geometry, roof, glazing, access and layout checks. Unity and Blender exports are unchanged.


## Witby Ward

Witby Ward duplicates Farndon in the yellow-circled OS footprint southwest of the original, retaining its size, roof details, windows and open courts. It appears in Historic and walking/gameplay. Choose **Witby Ward** in Locations, or open aerial.html?view=witby, ?view=witby-plan, ?view=witby-site, or explore.html?view=witby. [Placement notes](Research/witby/README.md) record the approximate OS alignment.

The later colour-marked overhead map repositions Witby, Farndon, Ashley/Irby,
Grafton/Edge and Hale/Daresbury/Huxley/Dunham against the fixed church and
Churton. Building shapes, sizes and orientations are retained; their camera
views and walking collisions follow the moves. The corridor reconnection keeps
the Main–tower–Farndon gallery perfectly straight beside the tower's chimney
side, at 90 degrees to Main, with Farndon's receiving wing aligned to it.
Witby, Grafton and Hale's links reach their moved walls. Estates is also aligned
to the same church/Churton map reference. See the updated
[ward positions and overhead comparison](Research/ward-placement/README.md).

## Garages and mortuary

The Historic estate now includes the roadside garages in the blue-marked area
opposite Main/admin and the separate T-shaped mortuary in the yellow area.
The photos guide the low brick row, pale blue garage doors, taller workshop,
office windows, slate roofs and mortuary chimneys. Choose **Garages & Mortuary**
in Locations for the aerial, two photo angles, mortuary detail and plan views;
`explore.html?view=garages` starts beside the row. Buildings have walking
collisions and leave the road junction clear. [References and modelling notes](Research/garages/README.md)
record approximate dimensions and hidden details. Run
`node Browser/test-garages-mortuary.mjs` for geometry, clearance and layout checks.

## Greenhouses and gardeners buildings

The Historic browser layout now includes the red-marked access road south of
Vivienne Smith Lane, three parallel glasshouses on the yellow marks, and two
brick service buildings along the blue marks. The supplied photograph guides
their hipped tiled roofs, blue doors, pale windows and working yard. The purple
camera position is available as **Photo view**. Select **Greenhouses & gardeners
buildings** in Locations, or open `aerial.html?view=greenhouses`; use
`explore.html?view=greenhouses` to walk there. See the
[placement and reference notes](Research/greenhouses/README.md).
Run `node Browser/test-greenhouses.mjs` for roof, access, collision and layout
checks. Dimensions and concealed details are estimated from the references;
Unity and Blender exports are unchanged.

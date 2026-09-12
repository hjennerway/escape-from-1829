# Escape from 1829

Escape the 1829 building in Chester while Sylvia, Security, and the Deva asylum ghost search the corridors.

## Play the game

[Launch Escape from 1829 on GitHub Pages](https://hjennerway.github.io/escape-from-1829/)

Use `WASD` to move, the mouse to look, `Shift` to sprint, `C` or `Ctrl` to crouch, `F` to toggle the torch, and `Tab` to open the floor map. Hold `E` at wall artwork to inspect it, or at any of the five emergency exits to escape. NPCs pause whenever `E` is held.

The browser build is served from [`Browser/dist`](Browser/dist). The Unity project and Blender source are included for continued development.

## Building arrival (browser)

Starting or restarting plays a four-second 3D exterior sequence: the camera advances and tilts up towards the decorated pediment, then closes in on the red entrance door. At 3 seconds it fades to black over 0.5 seconds, switches to the ground-floor Reception spawn at full black, and fades back in over 0.5 seconds. Controls, pursuers and the gameplay timer remain frozen until the reveal finishes, preserving the full five-second head start. Hidden tabs suspend the sequence; reduced-motion mode uses a still exterior with the same fades and timing.

The Three.js exterior in `Browser/dist/exterior.mjs` is modelled from the four supplied photographs bundled in `Browser/dist/exterior/`. It includes the central pavilion, recessed wings, sash windows, stone bands, pediment, Ionic entrance columns, steps, railings, red panelled door and planted approach. The pediment uses a cropped detail from the supplied frontal photograph. Dimensions are visual approximations, not a measured survey. Repeated architectural trim is instanced, and the exterior renders separately from the interior. This browser addition does not require Blender; the Unity scene and existing binary exports have not been changed.

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

Escaping through any of the five exits starts a ten-second photo cutscene of the radio mast before the victory screen. It uses the two user-supplied photographs bundled as `Browser/dist/mast-wide.jpg` and `mast-detail.jpg`, with a gentle zoom and crossfade. Select **Skip cutscene**, or press Escape, Space or Enter, to go straight to the result. Reduced-motion mode uses still images with a simple cut. Losing does not trigger the sequence.

## Historical reference panels

The in-game photo panels and the 1854 statistics plaque are based on the public history and photography references from [Mark Davis Photography](https://www.mark-davis-photography.com/explore/the-countess-of-chester-asylum-deva/), [Based in Churton](https://basedinchurton.co.uk/category/cheshire-lunatic-asylum/), and the [public Deva photo archive](https://www.whateversleft.co.uk/asylums/deva-countess-of-chester-asylum-chester/). The plaque keeps the original report terminology as a historical quotation, rather than a modern diagnosis.

# Escape from 1829

Escape the 1829 building in Chester while Sandra, Security, and the Deva asylum ghost search the corridors.

## Play the game

[Launch Escape from 1829 on GitHub Pages](https://hjennerway.github.io/escape-from-1829/)

Use `WASD` to move, the mouse to look, `Shift` to sprint, `C` or `Ctrl` to crouch, `F` to toggle the torch, and `Tab` to open the floor map. Hold `E` at any of the five emergency exits to escape.

The browser build is served from [`Browser/dist`](Browser/dist). The Unity project and Blender source are included for continued development.

## Reception stairs

The left staircase is based on the uploaded `20260216_092540.mp4` and the user's confirmation that it is down a corridor to the left of Reception. The right corridor and staircase are mirrored at the user's request, not independently verified from footage. Corridor lengths and stair dimensions remain gameplay approximations.

The two stair approaches branch from the existing gallery either side of Reception. They replace the former north/south centre-line markers. Both are shown on the floor map and minimap. The browser constructs its architecture from the current navigation layout, retaining the existing material palette and architectural trim, so old exported walls cannot block these new approaches. Turning stair alcoves are visible beyond the ground-floor approaches; upper-floor traversal is not implemented.

The canonical and browser JSON layouts and Blender layout generator are synchronised. Existing `.blend`, `.fbx`, `.glb` and overview image exports have not been regenerated; the Unity binary level still requires a Blender rebuild. The browser no longer loads the stale `.glb` when `geometrySource` is `layout`.

The menu's **Archival footage** panel links to the supplied [Google Photos video](https://photos.app.goo.gl/UfHfqXjWSfPtDs3C8).

## Historical reference panels

The in-game photo panels and the 1854 statistics plaque are based on the public history and photography references from [Mark Davis Photography](https://www.mark-davis-photography.com/explore/the-countess-of-chester-asylum-deva/), [Based in Churton](https://basedinchurton.co.uk/category/cheshire-lunatic-asylum/), and the [public Deva photo archive](https://www.whateversleft.co.uk/asylums/deva-countess-of-chester-asylum-chester/). The plaque keeps the original report terminology as a historical quotation, rather than a modern diagnosis.

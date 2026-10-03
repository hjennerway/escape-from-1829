# Escape from 1829

Explore The West Cheshire Hospital site including the historic Chester County Asylum.

## Aerial View
Explore an aerial perspective of Chester's 1829 building, including the grounds and previous West Cheshire Hospital site.

Use the timeline slider in aerial or walking view to explore 13 periods from 1829 to 2021, with buildings and roads appearing as the site develops.

The pine and oak trees, car parks and modern road layouts as well as exact positions of 1829, the water tower, church, Upton Lea, Churton house and other surviving buildings are reasonably precise and were reconstructed from OS maps, Google Earth, aerial photos of the site before most of the buildings were demolished and a few surviving VHS tapes showing ground perspectives.

Click on a building to see the name of the building, historical photos and information about that building.

Inside the estate site, click the cross-hairs to pinpoint your position to see what used to be where you stand.

## Asylum Escape
Escape the building while being chased by security and find a fire exit.

The internal layout of the building is largely fictional due to the fact that it was built over a 70 year period and has an extremely non-standard, irregular layout. There are around 8 distinct floor heights, spread out across three floors and a basement in the original asylum and a further three floors in the extension wings - which aren't the same floor heights. In addition, there are numerous landings and twisting staircases inside.

## Play

[Play in your browser](https://hjennerway.github.io/escape-from-1829/).

Use **WASD** to move, the **mouse** to look, **Shift** to sprint, **Space** to jump over small walls and hedges, **C/Ctrl** to
crouch, **F** for the torch and **Tab/M/N** for the notebook and explored map. Walk up and down the stairs.
Press **E** at a door to go outside or return inside; hold **E** to view wall artwork.
Reach the front path outside to escape. **H** shows survival help; **Esc** pauses.
The notebook records discoveries and reveals nearby map areas as you explore. Reading it pauses the game.
Touch controls are available on mobile.

In **Explore on foot** on mobile, hold the on-screen arrows to walk and drag the view with another finger to look around.

# Running slowly?
If the view stutters or lags, check hardware accelleration is enabled in your browser

## Chrome

1. Go to chrome://settings/system
2. Enable "Use graphics acceleration when available"
3. Relaunch Chrome
4. Verify at chrome://gpu — look for "Hardware accelerated" next to WebGL, WebGL2, and Canvas. If you see ( "Software only, hardware acceleration unavailable"), you're running without hardware acceleration via the GPU.

## Edge

1. Go to edge://settings/system
2. Enable "Use graphics acceleration when available"
3. Relaunch Edge
4. Verify at edge://gpu — same check as above

# Screenshots
![Aerial view of the asylum](/Art/screenshots/screen1.png "Aerial view of the asylum")
![Night time view](/Art/screenshots/screen2.png "Night time view")
![Asylum Escape](/Art/screenshots/screen3.png "Asylum Escape")

# Credits
Made possible by the invaluable help of the members of the [The History of The West Cheshire Hospital](https://www.facebook.com/groups/447285974557565) Facebook group in identifying and refining the layout of the site. Their photos are viewable when moving around the site.

## Run locally

With Node.js installed, run this from the repository folder:

```sh
node Browser/serve.mjs
```

Open [localhost:1829](http://127.0.0.1:1829/) in your browser. Press **Ctrl+C**
in the terminal to stop the server.

[Development and modelling notes](DEVELOPMENT.md)

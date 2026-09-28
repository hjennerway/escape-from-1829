# Microsoft Store submission: Escape from 1829

Prepared for Windows PC, English (United Kingdom). This is submission material,
not confirmation that a listing or rating has been published.

## Product settings

- Product type: Game (MSIX).
- Title: Escape from 1829, subject to name reservation.
- Price: Free; no trial, subscription or in-app purchases.
- Category: Action & adventure.
- Devices: Windows PC, x64; do not select Xbox or other device families.
- Minimum OS: Windows 10 version 2004 (build 19041).
- Input: keyboard and mouse. Graphics: WebGL 2-capable graphics hardware.
- Language: en-GB.
- Website: https://hjennerway.github.io/escape-from-1829/
- Support: https://github.com/hjennerway/escape-from-1829/issues
- Privacy URL: publish `privacy.md` at a public URL before submission.
- Release: publicly discoverable, as soon as Microsoft certification succeeds.

## Short description

Escape Chester's historic 1829 building, explore the West Cheshire Hospital grounds on foot, and travel through 13 periods of the site's history in an interactive aerial view.

## Description

Find your way out of Chester's 1829 building, or take your time exploring the history of the West Cheshire Hospital site.

In Asylum Escape, search two floors for one of five active exits, randomly selected from fourteen possible routes. Keep moving, watch your map and use your torch while security and the Deva asylum ghost search the corridors.

For a quieter visit, explore the hospital grounds on foot or from above. Move through 13 historical periods from 1829 to 2021 to see buildings and roads appear as the site develops. Select buildings to discover their names, historical information and photographs.

The game is free, with no adverts or in-app purchases. The escape game, historical models and exploration work offline. A small number of optional archive wall images need an internet connection and use fallback artwork when unavailable.

Use a keyboard and mouse to play. WASD moves, the mouse looks around, Shift sprints, C or Ctrl crouches, F switches the torch, Tab opens the map and holding E interacts. Press Esc to pause and F11 for fullscreen.

The escape routes and characters are fictional. Historical reconstructions include interpretation and should not be used as a current map or evacuation plan. The escape mode includes pursuit, ghosts and frightening situations; historical text contains period descriptions of illness and institutional treatment.

## Product features

1. First-person escape gameplay across two floors.
2. Five active escape routes randomly chosen from fourteen possibilities.
3. Free exploration of the hospital grounds on foot and from the air.
4. Thirteen historical periods spanning 1829 to 2021.
5. Building names, historical information and photographs.
6. Core gameplay and historical models available offline.

## Search terms

Chester; West Cheshire Hospital; historical exploration; asylum escape; local history

## Screenshots

Run `node Desktop/scripts/capture-store.mjs` after building the Windows package.
Upload the four PNG files in `Desktop/out/store-submission/screenshots/` in
numbered order. `captions.json` contains their captions. Each image is a direct
1920x1080 capture of the packaged game; no marketing overlay is added.
The package supplies its tile/logo assets. Separate Store listing artwork is
available in the repository's `Art/` directory:

- Poster: `store-poster-1440x2160.png` (or `store-poster-720x1080.png`).
- Square box art: `store-box-2160x2160.png` (or `store-box-1080x1080.png`).
- Tile icons: `store-tile-300x300.png`, `store-tile-150x150.png`,
  `store-tile-71x71.png`.

Both illustrated covers show the real entrance's blue dragons and central
coat of arms. Use these in Store logos, and the direct gameplay captures in
Screenshots. Leave first-release release notes blank.

## Hero and promotional artwork

The additional illustrated PNGs are saved in `Art/`:

| Partner Center slot | File | Title |
| --- | --- | --- |
| 16:9 Super hero art | `store-super-hero-3840x2160.png` or `store-super-hero-1920x1080.png` | None |
| Titled hero art | `xbox-titled-hero-1920x1080.png` | Escape from 1829 |
| Featured promotional square art | `xbox-featured-square-1080x1080.png` | None |
| Legacy branded key art | `xbox-branded-key-584x800.png` | Escape from 1829 |

All four compositions retain the visible blue dragons above the entrance.
The two text-free designs contain no marketing lettering, and the titles in
the other two are within the upper two-thirds. Every PNG is opaque and below
50 MB. The 3840x2160 version is an upscale of the generated wide master.

The 584x800 image is included to match the slot in the user's portal screenshot.
Microsoft's current game-specific [Store listing guidance](https://learn.microsoft.com/en-us/gaming/game-publishing/concepts/store-listing)
says Branded Key Art is retired and should not be submitted for Xbox submissions.
It is supplied as a legacy portrait variant without an Xbox branding bar.
These assets do not change the package's Windows-PC-only device support.

## Notes for certification

This is a standalone Electron desktop game containing local HTML, JavaScript,
WebGL models and artwork. It does not load an online game or require a login,
subscription, activation code or separately installed Node.js. Launch the app
and choose Asylum Escape, Aerial View or Explore on Foot. Core modes work
offline. Five optional wall images use the existing archive image hosts;
fallback artwork is shown if those requests fail.

The runFullTrust capability is required for the packaged Electron desktop
runtime. The app does not request administrator elevation, install a service,
or expose Node.js to game pages. Game pages run in a sandboxed renderer.
HTTPS links open the default browser. The optional position button requests
permission for a single device-location fix; its availability depends on the
runtime location provider and Windows location services. Game logic uses that
fix only to mark the player's position near the hospital site.

## Age-rating content notes

Complete Partner Center's actual IARC questionnaire; do not invent an age
rating. The game contains a ghost, pursuit/capture by security, dark corridors
and a hospital/asylum setting. Capture text includes historical diagnoses and
treatments and references to alcohol, family mistreatment, illness and injury.
Answer the exact questions using that context and the displayed game content.
There is no multiplayer, user chat, paid loot box or in-app purchase system.
No IARC questionnaire has been submitted or rating obtained for this package.

## Submission status

The user supplied the Product identity screenshot on 28 September 2026 for
Escape from 1829, Store ID `9PK5RS1JJGXG`. The exact values are configured in
the ignored `Desktop/store-identity.local.json`:

- Name: `HJennerway.Escapefrom1829`
- Publisher: `CN=51B44ABD-BD81-4C19-9EFC-B4D718A2649C`
- Publisher display name: `HJennerway`

The Store upload file is now
`Desktop/out/EscapeFrom1829-1.0.0-x64-store.msix` (193,295,449 bytes).
MakeAppx validation passed, and the manifest read from inside the final MSIX
matches all three values and version `1.0.0.0`. Its SHA-256 is
`E6B9F4FE70AB08F41010E11F520A781CF9835DDD6D4CA68CDEE2F7D4B126B550`.
The older file named `preview-unsigned.msix` remains a local preview.

The user's Packages page is
https://partner.microsoft.com/en-us/dashboard/products/9PK5RS1JJGXG/submissions/1152921505701986004/packages
Browser control still fails during initialisation, so no package upload or
certification submission has been performed by the agent. Select the Store
MSIX above on that page. Privacy publication, IARC and the remaining submission
sections must be complete before requesting certification.

Sources checked 27 September 2026:

- https://learn.microsoft.com/en-us/windows/apps/publish/publish-your-app/msix/reserve-your-apps-name
- https://learn.microsoft.com/en-us/windows/apps/publish/publish-your-app/msix/create-app-submission
- https://learn.microsoft.com/en-us/windows/apps/publish/publish-your-app/msix/add-and-edit-store-listing-info
- https://learn.microsoft.com/en-us/windows/apps/publish/publish-your-app/msix/screenshots-and-images
- https://learn.microsoft.com/en-us/windows/apps/publish/publish-your-app/msix/age-ratings

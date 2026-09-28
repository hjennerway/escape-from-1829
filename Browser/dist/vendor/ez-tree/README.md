# EZ-Tree

Vendored from Daniel Greenheck's [EZ-Tree](https://github.com/dgreenheck/ez-tree)
at commit `dcf309bd86bd521083d9c70f01f2de45fdc7c457` (28 September 2026).
The interactive presets are at [eztree.dev](https://www.eztree.dev/).

MIT license: see `LICENSE`. Bark001 comes from ambientCG (CC0); the leaf
texture is covered by EZ-Tree's MIT license. See `TEXTURES-LICENSE.md`.

`Browser/vendor-eztree.py <checkout>` reproduces these files with Pillow.
Changes to library files are limited to explicit browser module imports,
using the game's existing Three.js, and converting preset JSON to ES modules.
The 256px oak and 128px bark pixels are baked bottom-up into `texture-data.mjs`
for synchronous Node/browser generation and binary compilation. No runtime
requests to EZ-Tree, a CDN or a package registry are required.

The game uses `Tree.createGeometry()` with the Oak Large preset. Its dimensions,
colour treatment, LODs, wind and collision integration are in the game's
`front-lawn-eztree.mjs` and `front-lawn-wind.mjs`, outside the vendored code.

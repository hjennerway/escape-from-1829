# Precompiled aerial models

Run these commands from `Browser` with Node.js 24:

```sh
npm ci
npx playwright install chromium
npm run test:models
npm run build:models
npm run test:compiled
npm start
```

On Linux CI, install Chromium and its system libraries with `npx playwright install --with-deps chromium`. To use an existing Chrome installation locally, set `MODEL_CHROME_PATH` to its executable before running the build and compiled-scene tests. Playwright is a build/test dependency; visitors do not download it.

Open `http://127.0.0.1:1829/aerial.html` for automatic loading or append `?models=source` to force procedural construction. Add `&view=front` for a close comparison, or `&buildingDetail=full` to retain full window geometry. `?models=compiled` uses the normal compiled-first path and still permits fallback. `exterior.modelBuild` records the selected mode and model setup time for browser instrumentation.

## What is built

`build-models.mjs` calls the same `buildAerialScene` pipeline as the browser fallback. It bakes the estate, dated section groups, material batches, shared tree instances and foliage levels, window atlases and geometry, masonry textures and road labels. It does not change the modelling source or require Blender. The period controller restores those groups after loading, so each slider stop uses the same geometry and visibility as the source scene. Assets with an older timeline version, including those that retain later ground surfaces before construction, fall back to source construction.

The output contains `manifest.json` and a content-hashed `aerial-….bin.gz` file. The manifest is published last, after the binary is complete. The binary stores final typed vertex/index/instance buffers, texture pixels and scene metadata, using the repository's vendored Three.js revision. Shared geometry, materials, instance attributes and building references remain shared after loading. The small Three-specific format also preserves layout hierarchy, shadow flags, LOD and custom material metadata; it is not an interchange GLB. Random Three.js UUIDs are normalized to stable IDs.

The binary is explicitly gzip-compressed and decoded using the browser's `DecompressionStream`, so it works on a static host without special compression headers. If that API or the asset is unavailable, the browser rebuilds from source. The frontage photograph continues to load as its existing separate WebP. The full shaders must still be compiled in the visitor's browser for that device; the existing asynchronous shader warmup remains in place.

The compiler rejects source changes made during a build. The development server compares the manifest's source fingerprint to local source before serving it, so edits cannot silently show old models. Re-run `npm run build:models` after modelling changes. Binary format and Three.js revision checks protect runtime compatibility. GitHub deploys the manifest, binary and page together.

Only the aerial page uses this binary. Walking and the game continue to build their existing models. Original named meshes, including hidden batch sources, stay in the compiled scene for named material updates and inspection.

## GitHub Actions

`.github/workflows/pages.yml` now has separate build and deployment jobs:

1. Pull requests to `main`, pushes to `main` and manual runs install the pinned build dependencies and Chromium.
2. Geometry/LOD/controls and binary-format checks run before compilation.
3. The real scene is compiled, then tested in Chromium against the procedural scene. Tests also exercise layout/tree controls, camera movement, portrait framing, full detail, and missing/incompatible/corrupt model fallbacks.
4. The complete `Browser/dist` directory, including generated models, is uploaded as the Pages artifact.
5. Only successful `main` runs deploy. Pull requests build and validate without publishing.

The repository must already use **GitHub Actions** as its Pages source, as required by the previous deployment workflow. There are no new secrets. Generated models and `node_modules` are ignored by Git; commit source, tests, `package-lock.json` and the workflow. Local build commands do not publish anything.

The workflow follows the official [Node setup](https://github.com/actions/setup-node) and [Pages artifact/deploy actions](https://github.com/actions/deploy-pages).

## Performance and verification

Prebuilding moves geometry generation, instancing preparation, batching and texture baking to the build machine. Browser loading still decompresses the binary, reconstructs scene objects, uploads GPU buffers and compiles shaders. Steady-state rendering submits the same geometry and draw calls; no FPS increase is implied.

The compiled-scene test writes `artifacts/precompiled-models.json` with separate model-setup and page-ready times, and `precompiled-source.png` / `precompiled-compiled.png` for visual comparison. Local timings are diagnostic: local networking, browser caches and software WebGL do not represent a first visit on a phone or a slow connection. The binary trades extra download size for less procedural construction work.

Both compiled-scene browser scripts allow 120 seconds per navigation (including reloads and the walking page), matching the existing scene-readiness timeout. Full-detail startup under software WebGL can exceed Playwright's default 30-second navigation limit before the readiness check starts. The full-detail check also verifies compiled loading and records its timing in `precompiled-models.json`; rendering, image comparison and fallback assertions remain enabled.

The September 17 local check produced a 10.17 MB compressed asset (84.09 MB before compression). Model setup was 1.17 seconds from source and 0.92 seconds compiled, while page-ready time was 6.47 versus 7.15 seconds. This single run does **not** establish an overall startup improvement. Both paths submitted 672,598 triangles and 2,656 draw calls at 1000 × 700. The image comparison found 112 of 700,000 pixels differing by more than three intensity levels per channel on average; the renderings were visually matched. The test now checks image similarity as well as exact geometry/draw counts. Results vary with subsequent modelling changes and hardware.

# Coding-agent guidance

## Documentation

- Keep `README.md` minimal and player-focused: the game description, play link,
  basic controls and local launch instructions.
- Put implementation details and validation notes in `DEVELOPMENT.md`, modelling
  references in the relevant `Research/` notes, and agent instructions here.
- Read the relevant notes before changing a model. The development notes retain
  historical revisions; later corrections may supersede earlier descriptions.

## Development and validation

- Use hardware GPU acceleration for local browser rendering, visual and
  performance tests. Do not force CPU/software rendering (for example SwiftShader or
  `--disable-gpu`). Verify the active renderer before relying on visual or
  performance results; report unavailable GPU acceleration instead of silently
  falling back to software rendering. Non-rendering logic checks still run on
  the CPU.
- Use `Browser/test-support/hardware-browser.mjs` for browser test launches;
  `npm run test:gpu` in `Browser` verifies the GPU and launcher policy. Adapt
  historical scripts under `Browser/artifacts/` to this launcher before reruns.
- Hosted GitHub checks retain explicitly configured software rendering because
  their runners have no GPU. The `CI=true` plus `BROWSER_CI_SOFTWARE=1` exception
  is for those checks only; do not use it for local validation.
- The browser game is served from `Browser/dist`. Start it from the repository
  root with `node Browser/serve.mjs`.
- Run the relevant `Browser/test-*.mjs` checks for the code changed. Run the browser
  suite with `npm test` from `Browser`; rendering changes also need visual checks.
- See `Browser/MODEL-BUILD.md` for precompilation and compiled-scene validation.
  Rebuild generated models after modelling changes when testing that path.
- Browser model changes do not automatically update Unity or Blender exports.
  State accurately which sources and exports were changed or regenerated.
- The current Unity/Android project is `NativeAndroid/Unity`. Its export,
  validation and build entry point is `NativeAndroid/tools/build.ps1`.
  Keep shared modelling inputs outside Unity-specific asset folders.

## Rendering and walking invariants

- Roof faces must meet white render at its edge; no slate may cross through
  the middle of a rendered cornice or roof-to-wall return.
- After moving exterior geometry or sunlight at runtime, call
  `exterior.invalidateShadows()`.
- Changes to batched buildings also require rebuilding affected batches and
  refreshing cached transforms before invalidating shadows.
- When layout or tree visibility changes, refresh walking obstacles with
  `walker.setObstacles(...)` so collisions follow the visible scene.

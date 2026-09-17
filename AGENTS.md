# Coding-agent guidance

## Documentation

- Keep `README.md` minimal and player-focused: the game description, play link,
  basic controls and local launch instructions.
- Put implementation details and validation notes in `DEVELOPMENT.md`, modelling
  references in the relevant `Research/` notes, and agent instructions here.
- Read the relevant notes before changing a model. The development notes retain
  historical revisions; later corrections may supersede earlier descriptions.

## Development and validation

- The browser game is served from `Browser/dist`. Start it from the repository
  root with `node Browser/serve.mjs`.
- Run the relevant `Browser/test-*.mjs` checks for the code changed. Run the browser
  suite with `npm test` from `Browser`; rendering changes also need visual checks.
- See `Browser/MODEL-BUILD.md` for precompilation and compiled-scene validation.
  Rebuild generated models after modelling changes when testing that path.
- Browser model changes do not automatically update Unity or Blender exports.
  State accurately which sources and exports were changed or regenerated.

## Rendering and walking invariants

- After moving exterior geometry or sunlight at runtime, call
  `exterior.invalidateShadows()`.
- Changes to batched buildings also require rebuilding affected batches and
  refreshing cached transforms before invalidating shadows.
- When layout or tree visibility changes, refresh walking obstacles with
  `walker.setObstacles(...)` so collisions follow the visible scene.

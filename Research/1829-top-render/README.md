# Matching white roof-edge render (5 October 2026)

The owner's [marked aerial reference](../../Browser/artifacts/1829-white-top-render/reference.png)
identifies the yellow-circled roof trim as the required bright white and
the purple-circled cream trim as the finish to replace throughout 1829.
The direct dragon frontage is explicitly excepted. Sections with no thick
top render remain as modelled; no new trim is added.

Existing cornices, exposed roof-support slabs, parapets and coping now use
the shared `0xe1e3dc` white render, including its mineral grain. The principal
block builder, Reception sides/rear, both entrance shoulders, both forward
ends, their inward-facing roof bands and bay caps, the inside-corner coping
and the eastern pavilion's side cornice share that material. Lower floor
bands, window trim and door thresholds retain their existing finishes.
The dragon pediment, its border and the portico retain cream.

This changes material assignments in the shared browser exterior only.
Authored roof/wall coordinates, render thicknesses, untrimmed edges,
openings and walking layouts are retained. Browser aerial, Explore and
gameplay use these sources. The local compiled aerial is regenerated;
Unity, Blender and packaged exports are not regenerated.

Validation and saved originals are in
`Browser/artifacts/1829-white-top-render/`. GPU captures and material probes
cover 1829 and its direct surroundings only, as requested. See
`DEVELOPMENT.md` for results and the existing corner-test failure.

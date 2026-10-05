# Courtyard downpipe relocation

The owner's [orange/blue annotated view](marked-reference.png), supplied on
5 October 2026, identifies the far-end courtyard drainpipe in orange and
its requested position beside the low projecting bay in blue. The written
request authorizes this move and restricts validation to the building and
its immediate surroundings.

`Browser/dist/west-court-photo-detail.mjs` moves the existing 0.085-square
iron pipe from x=-71.70 to x=-66.55, 0.10 beyond the low bay's left edge.
Its z=4.74 position is retained. The blue line starts at the low roof:
the pipe now spans y=0..8.91 instead of y=0..12.60. Its top meets the pale
rim, and its shaft clears both neighbouring window banks. These fitted
coordinates are estimates from the annotated view, not survey measurements.

This supersedes the earlier instruction to retain the far-end pipe in
`court-window-roof-2026-10-04/README.md`. The overlapping shaft at x=-65.90
remains removed. No other building or landscape geometry is changed.

The existing west-building check verifies the new shaft, removal of the
old shaft, the roof-height limit and adjacent glazing. Hardware-rendered
before/source/compiled courtyard and close views, the saved original source
and local visible probes are in `Browser/artifacts/west-court-drainpipe/`.
Validation stays within the west building and its courtyard approach; no
estate-wide suite is run. Shared browser sources and the locally generated
aerial model are updated; Unity, Blender and packaged exports are unchanged.

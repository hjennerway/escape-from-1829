# Larkton/Jodrell courtyard and Parsons approach — 24 September 2026

The user's [marked browser view](marked-revision.png) supersedes the west
outer ward footprint in the earlier OS reconstruction. Yellow identifies the
removed narrow return and the adjoining end of the rear pavilion. Red gives
the paving boundary; blue gives the new approach from Parsons Lane.

The west rear link is removed completely. The rear pavilion retains its
western wall and depth and now ends at map x=-86 instead of -79. Its roof,
windows, trim, chimneys and walking collision follow the shortened range.
The front range, long western range, projecting rooms and other wards retain
their existing geometry and placement.

An asphalt paved court wraps the retained rear block, touches the building
at the stepped rear edge and front range, and replaces the removed return.
A small green courtyard remains between the western ward and the paving.
The five-metre approach curves from the existing Parsons bend at (533,-135)
across the lawn to the paved court, matching the blue guide. Its junction
covers the road border only at the mouth. Existing Parsons vertices and the
previously removed annexe roads remain unchanged. Surfaces follow the
Annexe's timeline and Historic visibility.

Validation uses `Browser/test-larkton.mjs` for removed roofs and collisions,
paving contacts, courtyard grass, full-width road continuity, junction and
building clearance, and timeline visibility. The independent pre-edit
fingerprint retains all 18,942 primitives outside Larkton/Jodrell. Only after
that check passes does `Browser/artifacts/refresh-larkton-baselines.mjs`
advance the affected historical fingerprints; earlier transformations and
unaffected range records remain protected. Visuals and logs use
`Browser/artifacts/larkton-`.

Browser modelling sources and the locally generated aerial model are updated.
Unity and Blender exports are unchanged.

The concurrent entrance-alignment task extends the low central range. The
Larkton preservation regression normalizes only that range's input depth in
an isolated process, retaining the original pre-edit fingerprint and all live
geometry checks. It does not alter source files or the visible scene.

The Jarman whole-estate snapshot was independently checked with both later
input edits normalized in memory: the old 861,075 primitives match exactly.
Its current snapshot then advances to 860,652 primitives. The source and
compiled previews match, and the compiled comparison and every timeline stop
pass (`Browser/artifacts/larkton-compiled.txt`).

Validation: all 64 browser test commands pass, as do the rebuilt source/compiled comparison and every timeline stop. Source and compiled overhead and close previews render without page errors. Logs and screenshots use `Browser/artifacts/larkton-`.

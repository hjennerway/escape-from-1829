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

## Recess between Larkton/Jodrell and Tarvin/Jarman — 24 September 2026

The user's [marked model](recess-marked-model.png), [street photograph](recess-photo.png)
and [aerial crop](recess-aerial.png) supersede the previous solid join at the inward
end of the Larkton frontage. All retained Larkton/Jodrell ranges move left by seven
map units (about 7.35 metres on the placed ground plane). This distance and the
concealed connection dimensions are estimates from the photographs.

The replacement connection has a two-storey rear range, projecting left cheek,
recessed terracotta entrance arch, upper sashes, broad chimney and a lower hipped
room with a pale glazed door. Its narrow paved approach and handrails follow the
street photo. The other wards retain their placement and geometry. The whole
Larkton paved court follows the shift, while only the final curve of its Parsons
approach moves; the existing road junction remains fixed. Saved Larkton views
follow the translated wing.

`Browser/test-larkton-recess.mjs` compares 21,162 retained primitives against an
independent pre-edit snapshot after undoing only the rigid translation, excluding
the replaced connection. A separate fingerprint protects all 18,375 primitives
outside Larkton/Jodrell without normalization. It also checks retained range
sizes, exposed doors, the low projection, walking clearance and wall collisions.
Historical whole-model snapshots advance only after this check passes; the rear
alignment snapshot retains its original west/head records. Existing paving,
road-continuity, ward ownership and viewpoint tests remain active.

Browser sources and the locally rebuilt aerial model are updated. Unity and
Blender sources and exports are unchanged. Previews and validation logs use
`Browser/artifacts/larkton-recess-`.

The concurrent Oakmere rear-court additions are omitted only during the immutable
pre-edit fingerprint comparison, then restored before live visibility and walking
checks. The latest combined aerial scene has been rebuilt and its timeline check
passes for both source and compiled loading.

Validation: all 68 browser-suite commands pass; the final photo-selection check
was rerun after moving its probes to the revised frontage and recessed roof.
Source/compiled rendering comparison and the rebuilt combined scene timeline
pass. Final oblique, close and ground-level previews render without page errors.

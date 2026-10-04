# West court roof-step masonry

The owner's [purple-circled game view](marked-reference.png), supplied on
4 October 2026, locates a tiled face between the tall cross-range roof and
the lower rearward arm. The written request asks to replace that face with
brick and white render matching the adjoining walls.

The former `West courtyard upper link slate closure` was an almost vertical
slate strip. It is removed. A solid vertical return shares the neighbouring
photo-brick material, meets the lower roof edge at x=-37.4, and extends from
y=11.3 to 14.3 over z=5..7.25. Its foot is buried in the existing roof/link
infill. Three joined white-render cornice profiles follow the same corner,
continuing the neighbouring trim. Both adjoining pitched roofs retain their
geometry.

`Browser/dist/west-court-photo-detail.mjs` supplies the shared browser model.
The local compiled aerial asset is rebuilt. Unity, Blender and packaged
desktop/Android exports are not regenerated.

Evidence, the original builder, matching before/after captures and repeatable
validation scripts are in
[Browser/artifacts/west-roof-masonry](../../../Browser/artifacts/west-roof-masonry/).
The west-wing regression rejects the original tiled face and verifies vertical
brick, matching material, continuous white trim and retained roof coverage.
Exterior, roof-contact, inside-corner and all 25 facade-course checks pass.
Actual compiled aerial and Explore pages each pass twelve brick-face probes,
twelve trim probes and eight roof probes, with no page or shader errors.
Desktop and phone views are visually reviewed.

Final roof-step validation: the complete suite was continued after updating
the facade-course count for the three new joined cornices. Only the existing
Jarman and Leighton/Newton whole-estate snapshots fail; both also fail with
the original tiled-face builder. Their expected records are retained.
Concurrent west-roof edits repeatedly invalidated the live manifest during
checks, so source/compiled image and draw-count comparison, full detail,
missing/incompatible/corrupt asset fallbacks and every timeline stop were
verified against a consistent local source snapshot. Actual compiled and
Explore corner probes and desktop/phone views also pass for that snapshot.
Evidence and fingerprints are in Browser/artifacts/west-roof-masonry/.

After the concurrent facade-course consolidation, the final live workspace
passes all 22 explicit courses, 3,000 surface probes, 36 complete-scene west
probes, west refinement and all 3,888 roof-contact probes. This supersedes the
intermediate count of 25 courses above. The final live aerial asset was rebuilt
and its source fingerprint matched at completion.

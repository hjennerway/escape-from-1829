# Jarman lawn frontage — 24 September 2026

## Snapshot reconciliation — 5 October 2026

The owner's request to fix the tests advances the protected estate reference
to 818,948 primitives. Importing all 134 historical model modules at `db70a03`
reproduces the saved 818,930 count and hash exactly. The comparison retains
816,532 primitive records exactly and identifies 268 further records whose
expanded vertex attributes, materials, transforms and flags differ only in UVs.
The 2,130 removed and 2,148 added structural records are confined to the
documented 1829 building/court repairs, west basement/terrain/access changes
and the two Larkton recessed-door strips. The west entrance path retains its
size and height and shifts exactly 1.25 units onto the corrected door axis.

`Browser/artifacts/test-repair/audit-snapshots.mjs` independently reproduces
both production scope rules. `refresh-snapshots.mjs` checks the reviewed source
set, each structural region, the precise path translation, stable model inputs,
fresh production fingerprints and Leighton/Newton's original L dimensions
before advancing only the two saved count/hash pairs. The complete evidence is
in `reviewed-snapshot-audit.json` beside those scripts. All frontage, window,
roof and collision assertions and the original exclusions remain enabled.
This supersedes the earlier reference totals; no model sources change as part
of this snapshot reconciliation.

## Snapshot reconciliation — 3 October 2026

The owner's request to repair the exterior comparison updates the protected
estate reference from 820,082 to 818,930 primitives. An isolated import of all
132 historical model modules at `16abbbb` reproduces the previous count and
SHA-256 exactly. The current model retains 818,185 primitive records exactly;
1,897 old pieces and 745 replacement pieces belong to 70 reviewed groups from
the documented exterior stair guards/clearance, continuous facade courses,
inner-court window spacing and roof-soffit repairs. The anonymous changes are
confined to those main-estate facade/stair areas. The corresponding
Leighton/Newton estate reference had the same stale comparison and is reconciled
using the same evidence, retaining its original L ranges.

`Browser/artifacts/jarman-comparison/audit.mjs` reproduces the historical and
current production fingerprints independently, including the original scope
exclusions. `refresh.mjs` checks every changed feature group, the primitive
delta, stable exterior source inputs and both current production fingerprints
before updating only the two saved count/hash pairs. `reviewed-audit.json`
records the evidence. Jarman's frontage, sash arrangement, veranda, walking
collision assertions and scope rules are unchanged. Both photographic tests
pass normally after the reference update. No exterior model sources or exports
change as part of this reconciliation; it supersedes the older totals below.

Final validation: all 114 commands in the complete browser suite pass with
exit code 0; see `Browser/artifacts/jarman-comparison/npm-test-final.log`.

## Snapshot reconciliation — 29 September 2026

The protected-estate baseline is refreshed to 820,016 primitives after an
independent reconstruction of `58f8bf3` exactly reproduced the old 859,404-count
snapshot. The difference is later documented estate work: front-lawn trees,
basements/access paving, west facade/courtyard repairs, roof trim and the shop
lamp. The audit retains 819,114 protected primitives exactly, including 14,392
unnamed meshes, and checks every changed name or unnamed position against those
regions. `Browser/artifacts/geometry-snapshot-repair.json` records the evidence.
The frontage assertions and existing exclusion rules are unchanged. This
supersedes the old total below; no geometry changes as part of this repair.

The user’s red outline in `img1-loc.png` identifies the south-facing front of
Tarvin/Jarman, with the blue dot and arrow registering the lawn camera. The two
unaltered photographs, `img1.jpg` and `jarman3.jpg`, supply the architectural
reference. They supersede the previously copied outer-front design on this
one elevation. The opposite Picton/Carden front retains the earlier design.

The replacement has a two-window left section, a projecting three-window
pediment, five upper windows over a glazed veranda, and a three-window right
pediment. White divided sashes, terracotta bands and stepped verges, circular
cross-barred gable lights, blue gutters/downpipes, four broad ventilated brick
chimneys, a metal lean-to roof, blue door and entrance handrails follow the
photos. The veranda has a brick base, glazed returns and a narrow paved apron.
The last broad chimney encloses the pre-existing host stack. Dimensions and
concealed joins are estimates fitted to the accepted ward footprint; this is
not a survey. Modern air-conditioning units and loose furniture are omitted.

`Browser/dist/annexe-jarman-detail.mjs` owns the replacement within the existing
`West court front elevation` group. The ward bodies, main hipped roof, other
ward fronts, site placement, surrounding roads and trees retain their geometry.
The veranda plinth participates in normal walking-obstacle construction.
`aerial.html?view=annexe-jarman-photo` and the equivalent walking URL use the
marked approach; both Locations menus include **Jarman lawn photo**.

`test-jarman.mjs` checks the window arrangement, exposed glazing, upward veranda
roof, clear camera, actual walking against the veranda and the protected estate.
The old copied-gable equality test remains active for the opposite court. The
older general walking test now stops at the new veranda instead of the wall
behind it. Whole-annexe fingerprints were refreshed only after independent
original/replacement construction showed exact equality of all 861,075
primitives outside the named frontage. The initial estate snapshot is retained:
it differed by 74 primitives from a later reconstruction of the original facade;
original and replacement builds from that same later state match exactly.

This updates browser sources and the rebuilt compiled aerial asset. Unity and
Blender sources and exports are unchanged. Validation images and logs are in
`Browser/artifacts/annexe-jarman-*` and `Browser/artifacts/jarman-*`.

Validation: all 63 browser-suite scripts pass. The rebuilt source/compiled comparison and every timeline stop pass. Final source and compiled lawn, oblique, overview and plan views render without page errors; the lawn viewpoint links to the matching walking view. Final visual review confirms the veranda joins and unchanged courtyard layout. The compiled asset was rebuilt again after whitespace-only cleanup and its final viewpoint previews confirm compiled loading.

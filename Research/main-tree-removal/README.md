# Main building tree removal

The red-circle screenshot (marked-trees.png) supersedes older west-front garden
and inner-court planting references for these trees only.

Remove sixteen broadleaves at scene x,z coordinates:
(-100,-84), (-91,-91), (-82,-98), (-73,-84), (-64,-91),
(-65,-35), (-72,-23), (-72,-10), (-72,29), (-25.5,46.7),
(98.2,-38), (122.2,-47), (122.2,-35), (122.2,25), (122.2,37), (122.2,49).
Also remove the separate west garden tree (-48.5,42.5) and courtyard birch
(26,-43). Preserve planting beds, shrubs and all unmarked trees.

Only Browser model sources and local compiled assets are updated.

Validation: escape exterior, west refinement, aerial layouts, exterior walking
and revised tree collision/toggle checks pass. The source preview was visually
inspected (Browser/artifacts/marked-tree-removal-after.png). The full suite
passed through the garden check, then encountered a concurrent road module
import error: west-parsons-junctions.mjs requested missing export junction from
admin-road-junctions.mjs. No unrelated road code was changed for this task.
The compiled model was rebuilt; concurrent source edits may invalidate its
fingerprint and force the normal source fallback.

The compiled check passed source/compiled rendering equality and the full-detail
load, then timed out on automatic loading after concurrent source changes.
Timeline browser checks were consequently not reached.
